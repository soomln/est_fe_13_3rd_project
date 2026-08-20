'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { MAX_QUESTION, ask, resetState } from '@/app/resume/editor/_lib/alan';
import fillProfile, { findMatches, loadProfileView } from '@/app/resume/editor/_lib/fillProfile';
import insertInto, { crossesCells, replaceRange } from '@/app/resume/editor/_lib/insertAnswer';
import AI_TOOLS, { splitText } from '@/app/resume/editor/_lib/aiTools';

const HELLO = `안녕하세요.
작성을 도와드릴 AI 코치입니다.

작성 시작 전 마이페이지에 등록된 정보를 바탕으로 자동 기입해드릴까요? 🙂`;

const PICKED_SELF = '알겠습니다. 작성이 어려운 게 있거나 궁금한 게 있다면 저에게 물어봐주세요.';

// 말투가 핵심이다. 정보 목록만 주면 면접관처럼 캐묻는다.
// Alan 은 출력 틀을 그려주면 빈 답을 준다. 규칙은 자연어로만 쓴다.
// 질문 전체가 900자를 넘으면 안 된다. 규칙이 길면 사용자가 한 말이 밀려난다.
// 다 갖춰지면 쓰라고 하면 끝없이 캐묻는다. 먼저 쓰고 그다음에 묻게 한다
const SYSTEM = `너는 IT 취업 준비생의 이력서 쓰는 걸 도와주는 친구야. 다정한 존댓말로, 이모지는 하나 정도.
사용자가 아직 아무 경험도 말하지 않았다면 어떤 직무에 지원하는지만 물어봐.
경험이나 강점을 한 가지라도 말했다면 더 캐묻지 말고, 반드시 "이렇게 쓰면 좋을 것 같아요:" 로 시작하는 줄을 넣어 이력서에 넣을 문장을 두세 줄 써줘.
없는 회사나 숫자를 지어내지 마. 초안을 준 다음에 더 좋게 만들 질문을 하나만 덧붙여.
대화가 이어지면 앞서 준 문장을 새로 들은 내용까지 넣어 더 구체적으로 고쳐 써줘.
공감하고 "같이 찾아볼까요?" 처럼 함께 하자고 해. 가르치듯 "~해보세요" 라고 하지 마. 같은 것을 두 번 묻지 마.
넣어달라고 하면, 너는 문서를 고칠 수 없으니 "문서에서 넣을 곳을 클릭해 커서를 둔 뒤 아래 [문서에 넣기] 버튼을 눌러주세요" 라고 안내해.`;

// 그래도 캐묻기만 하면 못 박는다. 질문은 그대로 두어 대화가 이어지게 한다
const DRAFT_NOW =
  '\n지금까지 나온 말이면 충분해. 이번 답에는 "이렇게 쓰면 좋을 것 같아요:" 로 시작하는 이력서 문장을 반드시 넣어줘.';

const PUT_CHOICE = { key: 'put', label: '문서에 넣기' };
const PUT_HINT = '문서에서 넣을 곳을 클릭해 커서를 둔 뒤 「문서에 넣기」를 눌러주세요.';

const SWAP_LABEL = '이 내용으로 바꾸기';
const NEED_SELECTION = '문서에서 고칠 글을 먼저 드래그해서 선택해주세요.';
const CROSSES_CELLS = '표는 여러 칸에 걸쳐 고칠 수 없어요. 한 칸 안에서 골라주세요.';
const SAME_AS_BEFORE = '고칠 부분이 없어요. 이대로도 좋아요 🙂';

// 한 번에 400자까지만 보낼 수 있어서 길면 나눠 묻는다
const longNote = (done, total) =>
  `글이 길어서 ${total}번에 나눠 물어보고 있어요. (${done} / ${total})`;

// 따옴표만 걷어내고 본다. 띄어쓰기를 고친 것도 첨삭 결과다
const sameText = (a, b) => a.replace(/["'“”]/g, '').trim() === b.replace(/["'“”]/g, '').trim();

// 초안을 줄 때 쓰라고 시켜둔 문구. 이게 보이면 넣기 버튼을 붙인다.
// 목록으로 가리려 했더니 예시를 나열한 것까지 초안으로 봤다
const DRAFT_SIGN = /이렇게 쓰면|이렇게 작성|초안이에요|초안입니다/;

const looksDraft = (text) => DRAFT_SIGN.test(text);

// 사용자가 두 번째로 말하는데 아직 초안이 없으면 이번엔 쓰게 한다
const needsDraft = (turns) =>
  turns.filter((turn) => turn.role === 'user' && !turn.pick).length >= 1 &&
  !turns.some((turn) => turn.role === 'ai' && looksDraft(turn.text));

const FILL_CHOICES = [
  { key: 'fill-empty', label: '빈 곳만 채우기' },
  { key: 'fill-all', label: '전부 덮어쓰기' },
];

// 번호를 세면 파일을 저장할 때 0 으로 돌아가 이미 쓴 번호와 겹친다
const makeId = () => crypto.randomUUID();

const aiTurn = (text, choices, hint) => ({ id: makeId(), role: 'ai', text, choices, hint });

const userTurn = (text, pick) => ({ id: makeId(), role: 'user', text, pick });

// 이력서 본문 대신 제목만 보낸다. 주소에 담을 자리가 없다
function headings(editor) {
  const titles = [];
  editor?.state?.doc.forEach((node) => {
    if (node.type.name === 'heading') titles.push(node.textContent.trim());
  });
  return titles.filter(Boolean).join(' · ');
}

// 사용자가 한 말이 재료다. 자리가 모자라면 최근 것부터 챙긴다
function said(turns, room) {
  const lines = [];
  let left = room;

  [...turns].reverse().forEach((turn) => {
    if (turn.role !== 'user' || turn.pick) return;

    const line = `· ${turn.text}`;
    if (line.length > left) return;

    left -= line.length;
    lines.unshift(line);
  });

  return lines.join('\n');
}

// 사용자가 한 말이 먼저다. 코치가 한 말은 자리가 남을 때만 넣는다
function buildPrompt(rule, turns, editor, text) {
  const titles = headings(editor).slice(0, 40);
  const room = MAX_QUESTION - rule.length - titles.length - text.length - 40;
  const lines = said(turns, Math.max(0, room));

  const left = room - lines.length;
  const asked =
    left > 40 ? ([...turns].reverse().find((turn) => turn.role === 'ai')?.text.slice(0, left) ?? '') : '';

  return [
    rule,
    titles && `[이력서 항목]\n${titles}`,
    lines && `[사용자가 한 말]\n${lines}`,
    asked && `[방금 코치가 한 말]\n${asked}`,
    `[지금]\n${text}`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

// 채팅 패널의 대화 상태
export default function useCoach({ editor } = {}) {
  const [turns, setTurns] = useState(() => [
    aiTurn(HELLO, [
      { key: 'import', label: '내 정보 불러오기' },
      { key: 'self', label: '직접 작성하기' },
    ]),
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingNote, setThinkingNote] = useState('');
  const [profile, setProfile] = useState(null);
  const abortRef = useRef(null);

  // 지난 대화가 서버에 남아 있다. 새 대화는 지우고 시작한다
  useEffect(() => {
    resetState();
  }, []);

  // 말풍선 사진에 쓰고, 불러오기를 누르면 바로 쓴다
  useEffect(() => {
    let alive = true;
    loadProfileView()
      .then((loaded) => alive && setProfile(loaded))
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  const append = useCallback((turn) => setTurns((prev) => [...prev, turn]), []);
  const say = useCallback((text, choices, hint) => append(aiTurn(text, choices, hint)), [append]);

  // 한 번 고른 선택지는 다시 못 누르게 지운다
  const clearChoices = useCallback(
    (id) => setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, choices: null } : t))),
    []
  );

  const askCoach = useCallback(
    async (question) => {
      const text = question.trim();
      if (!text || isThinking) return;

      append(userTurn(text));
      setIsThinking(true);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const rule = needsDraft(turns) ? SYSTEM + DRAFT_NOW : SYSTEM;
        const answer = await ask(buildPrompt(rule, turns, editor, text), {
          signal: controller.signal,
        });

        // 문서에 넣는 것은 버튼을 눌렀을 때만 한다. 자리는 사용자가 커서로 정한다
        if (!looksDraft(answer)) say(answer);
        // 넣을 글을 버튼이 직접 들고 있게 한다. 나중에 되찾으면 엉뚱한 말풍선을 집을 수 있다
        else say(answer, [{ ...PUT_CHOICE, draft: answer }], PUT_HINT);
      } catch (error) {
        if (error.name === 'AbortError') return;
        say(error.message || 'AI 가 응답하지 않았어요. 잠시 뒤 다시 시도해주세요.');
      } finally {
        setIsThinking(false);
      }
    },
    [append, editor, isThinking, say, turns]
  );

  // 마이페이지에서 프로필을 가져와 채울 수 있는 항목을 알려준다
  const startImport = useCallback(async () => {
    if (!editor) return;
    setIsThinking(true);

    try {
      const loaded = profile ?? (await loadProfileView());
      setProfile(loaded);

      const found = findMatches(editor.getHTML(), loaded);

      if (!found.length) {
        say('마이페이지에 등록된 정보 중에 이 양식과 맞는 항목이 없어요. 직접 작성해주세요.');
        return;
      }

      say(`마이페이지에서 ${found.join(' · ')} 을(를) 찾았어요.\n어떻게 채울까요?`, FILL_CHOICES);
    } catch {
      say('마이페이지 정보를 불러오지 못했어요. 잠시 뒤 다시 시도해주세요.');
    } finally {
      setIsThinking(false);
    }
  }, [editor, profile, say]);

  const runFill = useCallback(
    (overwrite) => {
      if (!editor || !profile) return;

      const result = fillProfile(editor.getHTML(), profile, { overwrite });

      if (!result.filled.length) {
        say(
          `${result.skipped.join(' · ')} 은(는) 이미 직접 쓰신 내용이 있어서 그대로 두었어요.`,
          [FILL_CHOICES[1]]
        );
        return;
      }

      // 한 번에 바꿔야 되돌리기 한 번으로 원래대로 돌아간다
      editor.commands.setContent(result.html);

      const left = result.skipped.length
        ? `\n${result.skipped.join(' · ')} 은(는) 이미 쓰신 내용이 있어서 두었어요.`
        : '';
      say(
        `${result.filled.join(' · ')} 을(를) 채웠어요.${left}\n이전으로 돌리고 싶다면 Ctrl+Z로 되돌릴 수 있어요.\n더 필요한 게 있거나 궁금한 점이 있다면 말씀해주세요.`
      );
    },
    [editor, profile, say]
  );

  // 툴바의 AI 보조도구. 고른 글을 보내고 결과를 채팅에 보여준다
  const runTool = useCallback(
    async (kind) => {
      const tool = AI_TOOLS[kind];
      if (!editor || !tool || isThinking) return;

      const { from, to } = editor.state.selection;
      const selected = editor.state.doc.textBetween(from, to, '\n').trim();

      if (!selected) {
        say(NEED_SELECTION);
        return;
      }

      // 물어보기 전에 막는다. 답을 기다린 뒤에 못 바꾼다고 하면 25초가 아깝다
      if (tool.replace && crossesCells(editor, { from, to })) {
        say(CROSSES_CELLS);
        return;
      }

      append(userTurn(`${tool.label} — ${selected.slice(0, 30)}`, true));
      setIsThinking(true);

      const parts = splitText(selected);

      try {
        const answers = [];

        for (let index = 0; index < parts.length; index += 1) {
          if (parts.length > 1) setThinkingNote(longNote(index + 1, parts.length));
          // 한 번에 하나씩 묻는다. 연달아 보내면 서버가 거른다
          answers.push(await ask(`${tool.rule}\n\n[글]\n${parts[index]}`));
        }

        const answer = answers.join('\n');

        if (tool.replace && sameText(answer, selected)) {
          say(SAME_AS_BEFORE);
          return;
        }

        // 바꿀 자리를 버튼이 들고 있는다. 나중에는 선택이 풀려 있다
        const choices = tool.replace
          ? [{ key: 'swap', label: SWAP_LABEL, draft: answer, range: { from, to } }]
          : undefined;
        say(tool.wrap ? tool.wrap(answer) : answer, choices);
      } catch (error) {
        say(error.message || 'AI 가 응답하지 않았어요. 잠시 뒤 다시 시도해주세요.');
      } finally {
        setThinkingNote('');
        setIsThinking(false);
      }
    },
    [append, editor, isThinking, say]
  );

  const pickChoice = useCallback(
    (turnId, choice) => {
      clearChoices(turnId);
      append(userTurn(choice.label, true));

      if (choice.key === 'self') say(PICKED_SELF);
      else if (choice.key === 'import') startImport();
      else if (choice.range) say(replaceRange(editor, choice.draft, choice.range));
      // 초안은 이미 이력서용 문장이라 다시 물어볼 필요가 없다
      else if (choice.draft) say(insertInto(editor, choice.draft));
      else runFill(choice.key === 'fill-all');
    },
    [append, clearChoices, editor, runFill, say, startImport]
  );

  return {
    turns,
    isThinking,
    thinkingNote,
    askCoach,
    pickChoice,
    runTool,
    avatarUrl: profile?.avatarUrl ?? '',
  };
}
