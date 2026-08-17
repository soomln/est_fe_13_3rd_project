import { Suspense } from 'react';

import EditorLoader from '@/app/resume/editor/_components/EditorLoader';
import FONT_VARS from '@/app/resume/editor/_lib/editorFonts';
import styles from './page.module.sass';

export default function Editor() {
  return (
    <div className={`${styles.editor} ${FONT_VARS}`}>
      <Suspense>
        <EditorLoader />
      </Suspense>
    </div>
  );
}
