'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import {
  createDocument,
  createDocumentDraftId,
  getDocument,
  removeDocumentImages,
  updateDocument,
} from '@backend/lib/api/documents';
import { getTemplate } from '@backend/lib/api/templates';
import { useAuth } from '@/app/_components/auth';
import ErrorState from '@/app/mypage/_components/ErrorState';
import EditorShell from '@/app/resume/editor/_components/EditorShell';
import styles from './EditorLoader.module.sass';

// ?template=<id> 는 저장 전까지 문서를 만들지 않는다. ?document=<id> 면 그 문서를 연다
export default function EditorLoader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentId = searchParams.get('document');
  const templateId = searchParams.get('template');

  const { isLoggedIn, isLoading, openLogin } = useAuth();
  const [doc, setDoc] = useState(null);
  const [status, setStatus] = useState('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const [reason, setReason] = useState('');

  // 저장하며 주소만 바꿀 때 다시 불러오지 않게 한다
  const loadedIdRef = useRef(null);
  const savedIdRef = useRef(null);
  const draftRef = useRef(null);

  useEffect(() => {
    if (isLoading) return undefined;

    // 문서를 만들고 저장하려면 로그인이 필요하다
    if (!isLoggedIn) {
      setStatus('guest');
      return undefined;
    }

    if (loadedIdRef.current && loadedIdRef.current === documentId) return undefined;

    let alive = true;
    setStatus('loading');

    const open = async () => {
      if (documentId) {
        const result = await getDocument(documentId);
        loadedIdRef.current = documentId;
        return result;
      }

      if (!templateId) return null;

      // 양식 내용만 받아 두고, 문서는 저장을 눌러야 만든다
      const template = await getTemplate(templateId);
      draftRef.current = createDocumentDraftId();

      return {
        id: null,
        draftId: draftRef.current,
        docType: template.docType,
        templateId: template.id,
        title: template.title,
        contentHtml: template.contentHtml,
      };
    };

    open()
      .then((result) => {
        if (!alive) return;
        if (!result) {
          setStatus('empty');
          return;
        }
        setDoc(result);
        setStatus('ready');
      })
      .catch((error) => {
        if (!alive) return;
        setReason(error?.message ?? '');
        setStatus('error');
      });

    return () => {
      alive = false;
    };
  }, [documentId, templateId, reloadKey, isLoggedIn, isLoading]);

  // 저장하지 않고 나가면 올려 둔 이미지를 지운다
  useEffect(
    () => () => {
      if (draftRef.current && !savedIdRef.current) {
        removeDocumentImages(draftRef.current).catch(() => {});
      }
    },
    [],
  );

  const save = useCallback(
    async (patch) => {
      const targetId = documentId ?? savedIdRef.current;
      if (targetId) return updateDocument(targetId, patch);

      const created = await createDocument({
        id: draftRef.current,
        docType: doc?.docType ?? 'resume',
        templateId: doc?.templateId ?? null,
        ...patch,
      });

      savedIdRef.current = created.id;
      loadedIdRef.current = created.id;
      router.replace(`/resume/editor?document=${created.id}`);

      return created;
    },
    [documentId, doc, router],
  );

  if (status === 'loading') {
    return (
      <p className={`${styles.editor_loader_state} font_body_m_r`} role='status'>
        불러오는 중이에요…
      </p>
    );
  }

  if (status === 'guest') {
    return (
      <ErrorState
        icon='lock'
        title='로그인이 필요해요'
        desc='로그인하면 이 양식으로 이력서를 만들 수 있어요.'
      >
        <button
          type='button'
          className={`${styles.editor_loader_btn} font_body_m_b`}
          onClick={openLogin}
        >
          로그인하기
        </button>
      </ErrorState>
    );
  }

  if (status === 'empty') {
    return (
      <ErrorState icon='description' title='열 문서가 없어요' desc='양식을 먼저 골라주세요.'>
        <Link href='/resume/free-form' className={`${styles.editor_loader_btn} font_body_m_b`}>
          무료 양식 보러가기
        </Link>
      </ErrorState>
    );
  }

  if (status === 'error') {
    return (
      <ErrorState
        title='문서를 불러오지 못했어요'
        reason={reason}
        onRetry={() => setReloadKey((prev) => prev + 1)}
      />
    );
  }

  return <EditorShell doc={doc} onSave={save} />;
}
