'use client';
import { useState } from 'react';

import styles from './page.module.sass';

import TabGroup from '../_components/Modal/TabGroup';
import Contents from '../_components/Modal/Contents';
import UploadBtn from './_components/UploadBtn';
import CustomSetting from './_components/CustomSetting';
import AiChatPanel from './_components/AiChatPanel';
import AiChatBtn from './_components/AiChatBtn';
import BackBtn from './_components/BackBtn';
import SaveBtn from './_components/SaveBtn';

export default function Upload() {
  const [item, setItem] = useState({
    id: crypto.randomUUID(),
    bgColor: '#ffffff',
    gap: 16,
    content: [],
  });

  const [activeTab, setActiveTab] = useState('ai');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);

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
      gap,
    }));
  };

  return (
    <>
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
              <SaveBtn iconText='save' text='임시 저장' textColor='#00A63D' bgColor='#EEFDF3' />

              <SaveBtn iconText='upload' text='업로드' textColor='#FFFFFF' bgColor='#111111' />
            </div>
          </header>

          <main>
            <TabGroup bgColor={item.bgColor} activeTab={activeTab} onChangeTab={setActiveTab} />

            <Contents item={item} isEditMode={true} updateBlock={updateBlock} removeBlock={removeBlock} />
          </main>

          <aside className={styles.btns_wrapper}>
            <div className={styles.add_btns}>
              <UploadBtn iconText='image' text='이미지' isIconFill={true} onClick={() => addBlock('image')} />

              <UploadBtn iconText='ondemand_video' text='동영상' onClick={() => addBlock('video')} />

              <UploadBtn iconText='text_fields' text='텍스트' onClick={() => addBlock('text')} />

              <UploadBtn iconText='code' text='코드' onClick={() => addBlock('code')} />
            </div>

            <UploadBtn iconText='import_export' text='순서 바꾸기' />

            <CustomSetting bgColor={item.bgColor} onSetColor={setBgColor} gap={item.gap} onSetGap={setGap} />

            <div className={styles.save_btns}></div>
          </aside>
        </div>
      </div>
    </>
  );
}
