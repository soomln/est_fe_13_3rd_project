// 코치가 준 초안을 이력서 커서 자리에 넣는다.
// 어디에 넣을지는 사용자가 커서로 정한다. 말이나 제목으로 추측하지 않는다

const UNDO_HINT = '\n이전으로 돌리고 싶다면 Ctrl+Z로 되돌릴 수 있어요.\n더 필요한 게 있거나 궁금한 점이 있다면 말씀해주세요.';

// "아래 버튼을 눌러주세요" 같은 안내는 이력서에 들어가면 안 된다
const GUIDE_LINE = /버튼|눌러\s*주|넣으시려면|넣어드릴까요/;

// 이력서에 넣을 줄만 골라낸다
function pickLines(text) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !GUIDE_LINE.test(line));

  // "이렇게 쓰면 좋을 것 같아요:" 처럼 안내로 끝나는 줄이 있으면 그 뒤부터가 본문이다
  const guide = lines
    .map((line, index) => (line.endsWith(':') ? index : -1))
    .filter((index) => index >= 0)
    .pop();
  const body = guide === undefined ? lines : lines.slice(guide + 1);

  // 목록으로 왔으면 목록만 넣는다
  const listed = body.filter((line) => /^[·•\-*]\s/.test(line));
  const picked =
    listed.length > 0 ? listed.map((line) => line.replace(/^[·•\-*]\s*/, '')) : body;

  // 따옴표로 감싸 오는 일이 있다
  return picked.map((line) => line.replace(/^["'“”]+|["'“”]+$/g, ''));
}

const toBlocks = (lines) =>
  lines.map((line) => ({ type: 'paragraph', content: [{ type: 'text', text: line }] }));

// 표 칸 두 개 이상에 걸쳐 있는지. 그대로 바꾸면 칸이 사라진다
export function crossesCells(editor, { from, to }) {
  let cells = 0;

  editor.state.doc.nodesBetween(from, to, (node) => {
    if (/^table(Cell|Header)$/.test(node.type.name)) cells += 1;
  });

  return cells > 1;
}

// 골라둔 자리를 결과로 바꾼다. 보조도구가 쓴다
export function replaceRange(editor, text, range) {
  const lines = pickLines(text);
  if (!lines.length) return '바꿀 문장을 만들지 못했어요. 다시 시도해주세요.';

  // 그 사이 글을 고쳤으면 자리가 어긋난다
  if (range.to > editor.state.doc.content.size) {
    return '그 사이 글이 바뀌어서 바꿀 자리를 찾지 못했어요.';
  }

  // 한 줄이면 글자만 바꾼다. 문단으로 넣으면 문단이 둘로 갈라진다
  const content = lines.length === 1 ? [{ type: 'text', text: lines[0] }] : toBlocks(lines);

  editor.chain().focus().insertContentAt(range, content).run();
  return `골라둔 글을 바꿨어요.${UNDO_HINT}`;
}

export default function insertInto(editor, text) {
  const lines = pickLines(text);
  if (!lines.length) return '넣을 문장을 만들지 못했어요. 다시 말씀해주세요.';

  editor.chain().focus().insertContent(toBlocks(lines)).run();
  return `커서가 있던 자리에 넣었어요.${UNDO_HINT}`;
}
