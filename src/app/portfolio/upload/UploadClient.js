'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import useToast from '@/hooks/useToast';

import styles from './page.module.sass';

import TabGroup from '../_components/TabGroup';
import Contents from '../_components/Contents';
import UploadBtn from './_components/UploadBtn';
import OrderModal from './_components/OrderModal';
import CustomSetting from './_components/CustomSetting';
import AiChatPanel from './_components/AiChatPanel';
import AiChatBtn from './_components/AiChatBtn';
import BackBtn from './_components/BackBtn';
import SaveBtn from './_components/SaveBtn';
import SettingModal from './_components/SettingModal';
import ToastMessage from '../_components/ToastMessage';

import { getCurrentUser } from '@backend/lib/api/auth';
import { createPortfolio, updatePortfolio, getPortfolio } from '@backend/lib/api/portfolio';

export default function UploadClient() {
  const searchParams = useSearchParams();
  const portfolioId = searchParams.get('id');

  const [item, setItem] = useState({
    id: crypto.randomUUID(),
    authorId: '',
    title: '',
    category: '',
    thumbnailUrl: '',
    description: '',
    overview: [],
    document: [],
    code: [],
    tags: [],
    bgColor: '#ffffff',
    gapPx: 16,
    status: 'draft',
  });

  const [isCreated, setIsCreated] = useState(false);

  const allowedBlockTypes = {
    overview: ['text', 'image', 'video'],
    document: ['text', 'image'],
    code: ['text', 'code', 'image'],
  };

  const [activeTab, setActiveTab] = useState('overview');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { isToastVisible, toastMessage, showToast } = useToast();

  const activeBlocks = item[activeTab] ?? [];

  useEffect(() => {
    const initializePage = async () => {
      try {
        const user = await getCurrentUser();

        if (!user) return;

        // 수정 모드
        if (portfolioId) {
          const portfolio = await getPortfolio(portfolioId);

          setItem({
            ...portfolio,

            authorId: portfolio.authorId ?? user.id,
            title: portfolio.title ?? '',
            category: portfolio.category ?? '',
            thumbnailUrl: portfolio.thumbnailUrl ?? '',
            description: portfolio.description ?? '',

            overview: portfolio.overview ?? [],
            document: portfolio.document ?? [],
            code: portfolio.code ?? [],

            tags: portfolio.tags ?? [],

            bgColor: portfolio.bgColor ?? '#ffffff',
            gapPx: Number(portfolio.gapPx ?? 16),

            status: portfolio.status ?? 'draft',
          });

          // 이미 DB에 존재하는 포트폴리오
          setIsCreated(true);

          return;
        }

        // 신규 작성 모드
        setItem((prev) => ({
          ...prev,
          authorId: user.id,
        }));
      } catch (error) {
        console.error('페이지 초기화 실패:', error);
        showToast('포트폴리오 정보를 불러오지 못했습니다.');
      }
    };

    initializePage();
  }, [portfolioId]);

  const isBlockAllowed = (type) => {
    return allowedBlockTypes[activeTab]?.includes(type);
  };

  const addBlock = (type) => {
    const newBlock = {
      id: crypto.randomUUID(),
      type,
    };

    switch (type) {
      case 'text':
        newBlock.html = '';
        break;

      case 'image':
      case 'video':
        newBlock.url = '';
        break;

      case 'code':
        newBlock.language = 'javascript';
        newBlock.code = '';
        newBlock.filename = '';
        break;

      default:
        return;
    }

    setItem((prev) => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newBlock],
    }));
  };

  const updateBlock = (id, updatedBlock) => {
    setItem((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((block) =>
        block.id === id
          ? {
              ...block,
              ...updatedBlock,
            }
          : block,
      ),
    }));
  };

  const removeBlock = (id) => {
    setItem((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].filter((block) => block.id !== id),
    }));
  };

  const onApplyBlockOrder = (sortedBlocks) => {
    setItem((prev) => ({
      ...prev,
      [activeTab]: sortedBlocks,
    }));
  };

  const setBgColor = (bgColor) => {
    setItem((prev) => ({
      ...prev,
      bgColor,
    }));
  };

  const setGap = (gap) => {
    setItem((prev) => ({
      ...prev,
      gapPx: Number(gap),
    }));
  };

  const onTempSave = async () => {
    if (isSaving) return;

    if (!item.authorId) {
      showToast('사용자 정보를 불러오는 중입니다.');
      return;
    }

    try {
      setIsSaving(true);

      const draftItem = {
        title: item.title,
        category: item.category || null,
        thumbnailUrl: item.thumbnailUrl,
        description: item.description,

        overview: item.overview,
        document: item.document,
        code: item.code,

        bgColor: item.bgColor,
        gapPx: item.gapPx,
        status: 'draft',
      };

      // 신규 포트폴리오
      if (!isCreated) {
        const createdItem = await createPortfolio(draftItem);

        setItem((prev) => ({
          ...prev,
          ...createdItem,

          // 백엔드가 tags를 반환하지 않는 경우 기존 값 유지
          tags: prev.tags,
          status: 'draft',
        }));

        setIsCreated(true);

        console.log('최초 임시 저장 완료:', createdItem);
        showToast('임시 저장되었습니다.');

        return;
      }

      // 기존 포트폴리오 수정
      const updatedItem = await updatePortfolio(item.id, draftItem);

      setItem((prev) => ({
        ...prev,
        ...updatedItem,
        tags: prev.tags,
      }));

      console.log('임시 저장 완료:', updatedItem);
      showToast('임시 저장되었습니다.');
    } catch (error) {
      console.error('임시 저장 실패:', error);
      showToast('임시 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const onPublish = () => {
    setIsSettingOpen(true);
  };

  const onCloseSetting = () => {
    setIsSettingOpen(false);
  };

  return (
    <div className={`${styles.page} ${isChatOpen ? styles.chat_open : ''}`}>
      {isToastVisible && <ToastMessage message={toastMessage} />}

      {isChatOpen && (
        <aside className={styles.ai_chat}>
          <AiChatPanel
            activeTab={activeTab}
            item={item}
            messages={messages}
            setMessages={setMessages}
            showToast={showToast}
            onClose={() => setIsChatOpen(false)}
          />
        </aside>
      )}

      <div className={styles.workspace}>
        <header>
          <div className={styles.btns}>
            {!isChatOpen && (
              <AiChatBtn
                onClick={() => {
                  setIsChatOpen(true);
                }}
              />
            )}

            <BackBtn />
          </div>

          <div className={styles.btns}>
            <SaveBtn
              iconText='save'
              text={isSaving ? '저장 중' : '임시 저장'}
              textColor='#00A63D'
              bgColor='#EEFDF3'
              onClick={onTempSave}
            />

            <SaveBtn iconText='upload' text='업로드' textColor='#FFFFFF' bgColor='#111111' onClick={onPublish} />
          </div>
        </header>

        <main>
          <TabGroup bgColor={item.bgColor} activeTab={activeTab} onChangeTab={setActiveTab} />

          <Contents
            item={item}
            setItem={setItem}
            activeTab={activeTab}
            isEditMode
            updateBlock={updateBlock}
            removeBlock={removeBlock}
          />
        </main>

        <aside className={styles.btns_wrapper}>
          <div className={styles.add_btns}>
            <UploadBtn
              iconText='image'
              text='이미지'
              isIconFill={true}
              disabled={!isBlockAllowed('image')}
              onClick={() => addBlock('image')}
            />

            <UploadBtn
              iconText='ondemand_video'
              text='동영상'
              disabled={!isBlockAllowed('video')}
              onClick={() => addBlock('video')}
            />

            <UploadBtn
              iconText='text_fields'
              text='텍스트'
              disabled={!isBlockAllowed('text')}
              onClick={() => addBlock('text')}
            />

            <UploadBtn
              iconText='code'
              text='코드'
              disabled={!isBlockAllowed('code')}
              onClick={() => addBlock('code')}
            />
          </div>

          <UploadBtn iconText='import_export' text='콘텐츠 순서 변경' onClick={() => setIsOrderModalOpen(true)} />

          <OrderModal
            isOpen={isOrderModalOpen}
            onClose={() => setIsOrderModalOpen(false)}
            blocks={activeBlocks}
            onApply={onApplyBlockOrder}
          />

          <CustomSetting bgColor={item.bgColor} onSetColor={setBgColor} gap={item.gapPx} onSetGap={setGap} />
        </aside>
      </div>

      <SettingModal
        item={item}
        setItem={setItem}
        isCreated={isCreated}
        setIsCreated={setIsCreated}
        isOpen={isSettingOpen}
        onClose={onCloseSetting}
      />
    </div>
  );
}
