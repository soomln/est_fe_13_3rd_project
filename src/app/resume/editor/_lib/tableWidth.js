import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

// 종이 폭 794 에서 좌우 여백 76 씩을 뺀 본문 폭.
// DocumentPage.module.sass 의 .document_page padding 과 같은 값이어야 한다
const MAX_WIDTH = 642;
// Table.configure 의 cellMinWidth 와 같은 값
const MIN_CELL = 40;

// 첫 줄의 칸 너비를 다 더한다. 정해지지 않은 칸이 하나라도 있으면 줄일 수 없다
function totalWidth(row) {
  let total = 0;
  let unset = false;

  row.forEach((cell) => {
    const widths = cell.attrs.colwidth;
    if (!widths) {
      unset = true;
      return;
    }
    widths.forEach((width) => {
      if (width) total += width;
      else unset = true;
    });
  });

  return unset ? 0 : total;
}

// 칸을 끌어 넓히면 표가 종이 여백을 넘어 가로 스크롤이 생긴다.
// 넘으면 칸 비율은 그대로 두고 전체를 본문 폭에 맞춰 줄인다
const TableWidth = Extension.create({
  name: 'tableWidth',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('tableWidth'),

        appendTransaction: (transactions, oldState, newState) => {
          if (!transactions.some((tr) => tr.docChanged)) return null;

          const tr = newState.tr;
          let changed = false;

          newState.doc.descendants((table, tablePos) => {
            if (table.type.name !== 'table') return true;

            const total = totalWidth(table.firstChild);
            if (!total || total <= MAX_WIDTH) return false;

            const scale = MAX_WIDTH / total;

            table.forEach((row, rowOffset) => {
              row.forEach((cell, cellOffset) => {
                if (!cell.attrs.colwidth) return;

                const next = cell.attrs.colwidth.map((width) =>
                  width ? Math.max(MIN_CELL, Math.round(width * scale)) : width
                );

                tr.setNodeMarkup(tablePos + 1 + rowOffset + 1 + cellOffset, undefined, {
                  ...cell.attrs,
                  colwidth: next,
                });
              });
            });

            changed = true;
            return false;
          });

          return changed ? tr.setMeta('addToHistory', false) : null;
        },
      }),
    ];
  },
});

export default TableWidth;
