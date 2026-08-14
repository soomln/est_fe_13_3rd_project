'use client';

import { useState, useEffect } from 'react';

import styles from './page.module.sass';

import TabGroup from '../_components/Modal/TabGroup';
import Contents from '../_components/Modal/Contents';
import UploadBtn from './_components/UploadBtn';
import CustomSetting from './_components/CustomSetting';
import AiChatPanel from './_components/AiChatPanel';
import AiChatBtn from './_components/AiChatBtn';
import BackBtn from './_components/BackBtn';
import SaveBtn from './_components/SaveBtn';
import Window from './_components/Window';

import { getCurrentUser } from '@backend/lib/api/auth';
import { createPortfolio, updatePortfolio } from '@backend/lib/api/portfolio';

export default function Upload() {
  const [item, setItem] = useState({
    id: crypto.randomUUID(),
    authorId: '',
    title: '',
    category: '',
    thumbnailUrl: null,
    description: '',
    content: [],
    tags: [],
    bgColor: '#ffffff',
    gapPx: 16,
    status: 'draft',
  });

  const [isCreated, setIsCreated] = useState(false);

  const [activeTab, setActiveTab] = useState('ai');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);

  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();

        if (!user) return;

        setItem((prev) => ({
          ...prev,
          authorId: user.id,
        }));
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  const addBlock = (type) => {
    const newBlock = {
      id: crypto.randomUUID(),
      type,
    };

    if (type === 'text') {
      newBlock.html = '';
    }

    if (type === 'image') {
      newBlock.url = '';
    }

    if (type === 'video') {
      newBlock.url = '';
    }

    if (type === 'code') {
      newBlock.code = '';
    }

    setItem((prev) => ({
      ...prev,
      content: [...prev.content, newBlock],
    }));
  };

  const updateBlock = (id, updatedBlock) => {
    setItem((prev) => ({
      ...prev,
      content: prev.content.map((block) =>
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
      content: prev.content.filter((block) => block.id !== id),
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
      gapPx: gap,
    }));
  };

  const onTempSave = async () => {
    if (isSaving) return;

    if (!item.authorId) {
      alert('사용자 정보를 불러오는 중입니다.');
      return;
    }

    try {
      setIsSaving(true);

      const draftItem = {
        ...item,
        status: 'draft',
      };

      if (!isCreated) {
        const createdItem = await createPortfolio(draftItem);

        /*
         POST에서는 프론트에서 만든 item.id를 사용하지 않음 -> 실제 id로 교체.
         tags는 현재 백엔드가 반환/저장하지 않으므로 로컬 값은 유지
        */
        setItem((prev) => ({
          ...prev,
          ...createdItem,
          tags: prev.tags,
          status: 'draft',
        }));

        setIsCreated(true);

        console.log('최초 임시 저장 완료:', createdItem);

        return;
      }

      const updatedItem = await updatePortfolio(item.id, draftItem);

      setItem((prev) => ({
        ...prev,
        ...updatedItem,
        tags: prev.tags,
      }));

      console.log('임시 저장 완료:', updatedItem);
    } catch (error) {
      console.error('임시 저장 실패:', error);
      alert('임시 저장에 실패했습니다.');
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
      {isChatOpen && (
        <aside className={styles.ai_chat}>
          <AiChatPanel onClose={() => setIsChatOpen(false)} messages={messages} setMessages={setMessages} />
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

          <Contents item={item} setItem={setItem} isEditMode updateBlock={updateBlock} removeBlock={removeBlock} />
        </main>

        <aside className={styles.btns_wrapper}>
          <div className={styles.add_btns}>
            <UploadBtn iconText='image' text='이미지' isIconFill={true} onClick={() => addBlock('image')} />

            <UploadBtn iconText='ondemand_video' text='동영상' onClick={() => addBlock('video')} />

            <UploadBtn iconText='text_fields' text='텍스트' onClick={() => addBlock('text')} />

            <UploadBtn iconText='code' text='코드' onClick={() => addBlock('code')} />
          </div>

          <UploadBtn iconText='import_export' text='순서 바꾸기' />

          <CustomSetting bgColor={item.bgColor} onSetColor={setBgColor} gap={item.gapPx} onSetGap={setGap} />
        </aside>
      </div>

      <Window
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
