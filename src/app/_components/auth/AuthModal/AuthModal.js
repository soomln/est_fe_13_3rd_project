'use client';

import Image from 'next/image';
import { useEffect } from 'react';

import { OAUTH_PROVIDERS } from '@backend/lib/api/auth';

import ProviderMark from '../ProviderMark';
import s from './AuthModal.module.sass';

const PROVIDER_ORDER = ['google', 'github', 'kakao'];
const MARK_CLASS = { google: s.markGoogle, github: s.markGithub, kakao: s.markKakao };

const PROVIDERS = PROVIDER_ORDER.map((id) => ({
  ...OAUTH_PROVIDERS.find((p) => p.id === id),
  markClass: MARK_CLASS[id],
}));

const SIGNUP_BENEFITS = [
  '무료 양식으로 이력서 · 자소서 작성',
  'AI 코치와 대화하며 문장 다듬기',
  '내 문서함에서 서류 관리 · 다운로드',
];

export default function AuthModal({
  mode,
  connectingProvider,
  errorMessage,
  onSelectProvider,
  onChangeMode,
  onClose,
}) {
  const isOpen = mode !== null;

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const connecting = PROVIDERS.find((p) => p.id === connectingProvider);

  return (
    <div
      className={s.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={s.dialog} role='dialog' aria-modal='true' aria-label={mode === 'signup' ? '회원가입' : '로그인'}>
        <div className={s.head}>
          <Image src='/logo.svg' alt='CallBack' width={120} height={18} priority />
          <button type='button' className={s.closeButton} onClick={onClose} aria-label='닫기'>
            <span className='material-symbols-outlined'>close</span>
          </button>
        </div>

        {connecting ? (
          <div className={s.connecting}>
            <div className={s.connectingRing}>
              <ProviderMark provider={connecting.id} size={36} />
            </div>
            <h2 className={`font_h4 ${s.connectingTitle}`}>{connecting.label} 계정으로 연결 중이에요</h2>
            <p className={`font_body_m_r ${s.connectingDescription}`}>
              잠시만 기다려주세요.
              <br />
              {connecting.label} 로그인 화면으로 이동합니다.
            </p>
            <button type='button' className={`font_body_m_b ${s.cancelButton}`} onClick={onClose}>
              취소
            </button>
          </div>
        ) : (
          <>
            {errorMessage && (
              <p className={`font_body_s_r ${s.error}`} role='alert'>
                {errorMessage}
              </p>
            )}

            {mode === 'signup' ? (
              <>
                <h2 className={`font_h2 ${s.title}`}>CallBack 시작하기</h2>
                <p className={`font_body_m_r ${s.description}`}>
                  {'따로 입력할 것 없어요.\n소셜 계정 하나로 바로 시작할 수 있어요.'}
                </p>

                <ul className={s.benefits}>
                  {SIGNUP_BENEFITS.map((benefit) => (
                    <li key={benefit} className={`font_body_m_r ${s.benefitItem}`}>
                      <span className={`material-symbols-outlined ${s.check}`}>check</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <h2 className={`font_h2 ${s.title}`}>다시 만나서 반가워요</h2>
                <p className={`font_body_m_r ${s.description}`}>
                  {'소셜 계정으로 로그인하고,\n작성하던 서류를 이어서 완성해보세요.'}
                </p>
              </>
            )}

            <div className={s.providers}>
              {PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  type='button'
                  className={s.provider}
                  onClick={() => onSelectProvider(provider.id)}
                  disabled={!provider.isEnabled}
                  title={provider.isEnabled ? undefined : provider.disabledReason}
                >
                  <span className={`${s.providerMark} ${provider.markClass}`}>
                    <ProviderMark provider={provider.id} />
                  </span>
                  <span className={`font_body_m_b ${s.providerLabel}`}>{provider.label}</span>
                  {!provider.isEnabled && (
                    <span className={`font_caption_r ${s.providerBadge}`}>
                      {provider.disabledReason}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {mode === 'signup' ? (
              <>
                <p className={`font_body_s_r ${s.hint}`}>원하는 계정을 눌러 3초 만에 가입하세요</p>
                <p className={`font_body_s_r ${s.terms}`}>
                  가입하면 <a href='/terms'>이용약관</a> 과 <a href='/privacy'>개인정보 처리방침</a> 에
                  <br />
                  동의하는 것으로 봅니다.
                </p>
                <div className={`font_body_s_r ${s.footer}`}>
                  이미 계정이 있나요?
                  <button
                    type='button'
                    className={`font_body_s_b ${s.linkButton}`}
                    onClick={() => onChangeMode('login')}
                  >
                    로그인
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className={`font_body_s_r ${s.hint}`}>원하는 계정을 눌러 로그인하세요.</p>
                <div className={`font_body_s_r ${s.divider}`}>처음이신가요?</div>
                <button
                  type='button'
                  className={`font_body_m_b ${s.signupButton}`}
                  onClick={() => onChangeMode('signup')}
                >
                  30초 만에 회원가입
                  <span className='material-symbols-outlined'>arrow_forward</span>
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
