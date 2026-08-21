import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

// A4 (96dpi) 와 종이 안쪽 여백. DocumentPage.module.sass 와 같은 값이어야 한다
export const PAGE_HEIGHT = 1123;
export const PAGE_GAP = 24;
const PAD_TOP = 64;
const PAD_BOTTOM = 94;

// 한 장에 들어가는 본문 높이
const CONTENT_HEIGHT = PAGE_HEIGHT - PAD_TOP - PAD_BOTTOM;
// 장을 넘길 때 건너뛰어야 하는 거리 (아래 여백 + 장 사이 간격 + 위 여백)
const SKIP = PAD_BOTTOM + PAGE_GAP + PAD_TOP;

// 글자를 칠 때마다 재지 않도록 조금 미룬다
const MEASURE_DELAY = 80;

export const pageBreaksKey = new PluginKey('pageBreaks');

// 어느 블록 앞에서 장을 넘겨야 하는지, 몇 장이 되는지 잰다. 미리보기도 같이 쓴다
export function planPages(container) {
  const blocks = [...container.children].filter((el) => !el.dataset.pageSpacer);
  if (!blocks.length) return { breaks: [], count: 1 };

  // 자리에서 재면 빈 자리를 넣은 뒤 값이 달라져 넣었다 뺐다를 반복한다.
  // 각 문단의 제 높이와 제 여백만 보면 빈 자리와 상관없이 늘 같은 값이 나온다
  // offsetHeight 는 정수로 잘려서 문단이 많으면 몇 px 씩 어긋난다. 소수까지 재고 배율을 되돌린다
  const scale = container.getBoundingClientRect().width / container.offsetWidth || 1;
  const sizeOf = (el) => {
    const style = getComputedStyle(el);
    return {
      height: el.getBoundingClientRect().height / scale,
      marginTop: Number.parseFloat(style.marginTop) || 0,
      marginBottom: Number.parseFloat(style.marginBottom) || 0,
    };
  };

  const breaks = [];
  let filled = 0;
  let prevBottom = 0;
  let count = 1;
  // 직전 블록이 제목이면 기억해 둔다. 제목만 앞 장에 남기지 않으려고 쓴다
  let heading = null;

  blocks.forEach((el, index) => {
    const size = sizeOf(el);
    // 위아래 여백은 큰 쪽 하나만 남는다
    const gap = filled === 0 ? 0 : Math.max(prevBottom, size.marginTop);

    if (filled > 0 && filled + gap + size.height > CONTENT_HEIGHT) {
      // 제목만 앞 장 끝에 남으면 보기 나쁘다. 앞이 제목이면 제목부터 넘긴다
      const start = heading ?? { index, before: { filled, prevBottom }, size };

      breaks.push({
        index: start.index,
        height:
          CONTENT_HEIGHT + SKIP - start.before.filled - start.before.prevBottom - start.size.marginTop,
      });

      filled =
        start === heading
          ? heading.size.height + Math.max(heading.size.marginBottom, size.marginTop) + size.height
          : size.height;
      prevBottom = size.marginBottom;
      heading = null;
      count += 1;
      return;
    }

    // 앞에 아무것도 없는 제목은 넘겨봐야 빈 장만 생긴다
    heading = /^H[1-3]$/.test(el.tagName) && filled > 0 ? { index, before: { filled, prevBottom }, size } : null;
    filled += gap + size.height;
    prevBottom = size.marginBottom;
  });

  return { breaks, count };
}

// 편집기는 블록 순서 대신 문서 안 위치가 필요하다
function measure(view) {
  const { breaks, count } = planPages(view.dom);

  const positions = [];
  view.state.doc.forEach((_node, offset) => positions.push(offset));

  return {
    breaks: breaks.map((item) => ({ pos: positions[item.index] ?? 0, height: item.height })),
    count,
  };
}

const isSame = (a, b) =>
  a.length === b.length && a.every((item, i) => item.pos === b[i].pos && item.height === b[i].height);

const PageBreaks = Extension.create({
  name: 'pageBreaks',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: pageBreaksKey,

        state: {
          init: () => ({ decorations: DecorationSet.empty, breaks: [], count: 1 }),
          apply(tr, prev) {
            const next = tr.getMeta(pageBreaksKey);
            if (next) return next;

            return { ...prev, decorations: prev.decorations.map(tr.mapping, tr.doc) };
          },
        },

        props: {
          decorations(state) {
            return pageBreaksKey.getState(state).decorations;
          },
        },

        view(view) {
          let timer = 0;

          const update = () => {
            const { breaks, count } = measure(view);
            const prev = pageBreaksKey.getState(view.state);
            if (isSame(prev.breaks, breaks) && prev.count === count) return;

            const decorations = DecorationSet.create(
              view.state.doc,
              breaks.map((item) =>
                Decoration.widget(
                  item.pos,
                  () => {
                    const el = document.createElement('div');
                    el.dataset.pageSpacer = 'true';
                    // 높이가 문단마다 달라서 클래스로는 줄 수 없다
                    el.style.height = `${item.height}px`;
                    return el;
                  },
                  { side: -1, ignoreSelection: true, key: `page-${item.pos}-${item.height}` }
                )
              )
            );

            view.dispatch(
              view.state.tr.setMeta(pageBreaksKey, { decorations, breaks, count }).setMeta('addToHistory', false)
            );
          };

          // 타이머로 미룬다. 화면이 가려진 창에서는 requestAnimationFrame 이 멈춘다
          const schedule = () => {
            clearTimeout(timer);
            timer = setTimeout(update, MEASURE_DELAY);
          };

          schedule();
          window.addEventListener('resize', schedule);
          // 그림이 늦게 뜨면 높이가 바뀐다
          view.dom.addEventListener('load', schedule, true);

          return {
            update: schedule,
            destroy() {
              clearTimeout(timer);
              window.removeEventListener('resize', schedule);
              view.dom.removeEventListener('load', schedule, true);
            },
          };
        },
      }),
    ];
  },
});

export default PageBreaks;
