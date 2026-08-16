'use client';

import { Fragment, useRef, useState } from 'react';
import { useEditorState } from '@tiptap/react';

import { uploadDocumentImages } from '@backend/lib/api/documents';
import { UPLOAD_LIMIT } from '@backend/lib/constants';
import AiToolMenu from '@/app/resume/editor/_components/AiToolMenu';
import FontTools from '@/app/resume/editor/_components/FontTools';
import ToolBtn from '@/app/resume/editor/_components/ToolBtn';
import LinkDialog from '@/app/resume/editor/_components/LinkDialog';
import TableMenu from '@/app/resume/editor/_components/TableMenu';
import ImageMenu from '@/app/resume/editor/_components/ImageMenu';
import ColorPicker from '@/app/resume/editor/_components/ColorPicker';
import { DEFAULT_SIZE, FONTS } from '@/app/resume/editor/_lib/editorFonts';
import styles from './EditorToolbar.module.sass';
const ALIGNS = ['left', 'center', 'right', 'justify'];

export default function EditorToolbar({ editor, documentId, onNotify }) {
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  // null | 'color' | 'highlight'
  const [palette, setPalette] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef(null);

  // 커서 자리 상태를 구독한다. 이게 없으면 버튼 눌린 표시와 글꼴·크기가 안 따라온다
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => {
      const style = current?.getAttributes('textStyle') ?? {};
      const on = (name) => Boolean(current?.isActive(name));

      return {
        font: style.fontFamily ?? FONTS[0].value,
        size: Number.parseInt(style.fontSize, 10) || DEFAULT_SIZE,
        hasColor: Boolean(style.color),
        color: style.color ?? '',
        highlightColor: current?.getAttributes('highlight').color ?? '',
        linkHref: current?.getAttributes('link').href ?? '',
        bold: on('bold'),
        italic: on('italic'),
        underline: on('underline'),
        strike: on('strike'),
        highlight: on('highlight'),
        bulletList: on('bulletList'),
        orderedList: on('orderedList'),
        link: on('link'),
        image: on('image'),
        // 이미지 메뉴의 크기 칸이 따라오려면 여기서 같이 구독해야 한다
        imageWidth: current?.getAttributes('image').width ?? null,
        table: on('table'),
        align: ALIGNS.find((value) => current?.isActive({ textAlign: value })) ?? '',
      };
    },
  });

  // 편집기가 준비되기 전에는 눌러도 아무 일이 없어야 한다
  if (!editor) return <div className={styles.toolbar} />;

  const run = (fn) => fn(editor.chain().focus()).run();

  const { font, size } = state ?? { font: FONTS[0].value, size: DEFAULT_SIZE };

  const alignTools = [
    { icon: 'format_align_left', label: '왼쪽 정렬', value: 'left' },
    { icon: 'format_align_center', label: '가운데 정렬', value: 'center' },
    { icon: 'format_align_right', label: '오른쪽 정렬', value: 'right' },
    { icon: 'format_align_justify', label: '양쪽 정렬', value: 'justify' },
  ];

  const TOOL_GROUPS = [
    [
      {
        icon: 'format_color_text',
        label: '글자 색',
        isActive: Boolean(state?.hasColor),
        onClick: () => setPalette((prev) => (prev === 'color' ? null : 'color')),
        palette: 'color',
        paletteValue: state?.color,
        onPick: (color) => run((chain) => chain.setColor(color)),
      },
      {
        icon: 'border_color',
        label: '형광펜',
        isActive: Boolean(state?.highlight),
        onClick: () => setPalette((prev) => (prev === 'highlight' ? null : 'highlight')),
        palette: 'highlight',
        paletteValue: state?.highlightColor,
        onPick: (color) => run((chain) => chain.setHighlight({ color })),
      },
    ],
    [
      {
        icon: 'format_bold',
        label: '굵게',
        isActive: Boolean(state?.bold),
        onClick: () => run((chain) => chain.toggleBold()),
      },
      {
        icon: 'format_italic',
        label: '기울임',
        isActive: Boolean(state?.italic),
        onClick: () => run((chain) => chain.toggleItalic()),
      },
      {
        icon: 'format_underlined',
        label: '밑줄',
        isActive: Boolean(state?.underline),
        onClick: () => run((chain) => chain.toggleUnderline()),
      },
      {
        icon: 'strikethrough_s',
        label: '취소선',
        isActive: Boolean(state?.strike),
        onClick: () => run((chain) => chain.toggleStrike()),
      },
    ],
    [
      ...alignTools.map((tool) => ({
        icon: tool.icon,
        label: tool.label,
        isActive: state?.align === tool.value,
        onClick: () => run((chain) => chain.setTextAlign(tool.value)),
      })),
      {
        icon: 'format_list_numbered',
        label: '번호 목록',
        isActive: Boolean(state?.orderedList),
        onClick: () => run((chain) => chain.toggleOrderedList()),
      },
      {
        icon: 'format_list_bulleted',
        label: '글머리 목록',
        isActive: Boolean(state?.bulletList),
        onClick: () => run((chain) => chain.toggleBulletList()),
      },
    ],
    [
      {
        icon: 'link',
        label: '링크',
        isActive: Boolean(state?.link),
        onClick: () => setIsLinkOpen(true),
      },
      {
        icon: isUploading ? 'hourglass_top' : 'imagesmode',
        label: isUploading ? '올리는 중…' : '이미지 올리기',
        isActive: Boolean(state?.image),
        onClick: () => fileRef.current?.click(),
      },
      {
        icon: 'table',
        label: '표',
        isActive: Boolean(state?.table),
        onClick: () =>
          run((chain) => chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true })),
      },
    ],
  ];

  const applyLink = (url) => {
    setIsLinkOpen(false);

    if (!url) {
      run((chain) => chain.extendMarkRange('link').unsetLink());
      return;
    }

    run((chain) => chain.extendMarkRange('link').setLink({ href: url }));
  };

  const uploadImages = async (files) => {
    if (!files.length) return;

    if (!documentId) {
      onNotify?.('문서를 먼저 열어주세요.', 'error');
      return;
    }

    setIsUploading(true);

    try {
      const urls = await uploadDocumentImages(documentId, files);
      urls.forEach((url) => run((chain) => chain.setImage({ src: url })));
    } catch (error) {
      onNotify?.(error?.message ?? '이미지를 올리지 못했어요.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.toolbar}>
      <AiToolMenu />

      <div className={styles.toolbar_inner}>
        <FontTools
          font={font}
          size={size}
          onChangeFont={(value) => run((chain) => chain.setFontFamily(value))}
          onChangeSize={(value) => run((chain) => chain.setFontSize(`${value}px`))}
        />

        {TOOL_GROUPS.map((group, index) => (
          <Fragment key={index}>
            <span className={styles.toolbar_divider} aria-hidden='true' />

            {group.map((tool) => (
              <span key={tool.icon} className={styles.toolbar_tool}>
                <ToolBtn
                  icon={tool.icon}
                  label={tool.label}
                  isActive={tool.isActive}
                  onClick={tool.onClick}
                />

                {tool.palette && (
                  <ColorPicker
                    isOpen={palette === tool.palette}
                    current={tool.paletteValue}
                    onPick={(color) => {
                      setPalette(null);
                      tool.onPick(color);
                    }}
                    onClose={() => setPalette(null)}
                  />
                )}
              </span>
            ))}
          </Fragment>
        ))}
      </div>

      <TableMenu editor={editor} isInTable={Boolean(state?.table)} />

      <ImageMenu editor={editor} isOnImage={Boolean(state?.image)} />

      <input
        ref={fileRef}
        type='file'
        multiple
        accept={UPLOAD_LIMIT.document.mimes.join(',')}
        className={styles.toolbar_file}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = '';
          uploadImages(files);
        }}
        aria-label='이미지 파일'
      />

      <LinkDialog
        isOpen={isLinkOpen}
        current={state?.linkHref ?? ''}
        title='링크 주소'
        placeholder='https://example.com'
        hint='비워두고 확인하면 링크가 풀려요.'
        onConfirm={applyLink}
        onCancel={() => setIsLinkOpen(false)}
      />
    </div>
  );
}
