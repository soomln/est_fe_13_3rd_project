'use client';
import { useState } from 'react';

import styles from './page.module.sass';

import TabGroup from '../_components/Modal/TabGroup';
import Contents from '../_components/Modal/Contents';
import UploadBtn from './_components/UploadBtn';
import CustomSetting from './_components/CustomSetting';
import EditorBlock from './_components/EditorBlock';
import AiChatPanel from './_components/AiChatPanel';

export default function Upload() {
  const [activeTab, setActiveTab] = useState('ai');
  const [blocks, setBlocks] = useState([]);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [gap, setGap] = useState(Number(16));
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [messages, setMessages] = useState([]);

  const addBlock = (type) => {
    const newBlock = {
      id: crypto.randomUUID(),
      type,
    };

    if (type === 'text') {
      newBlock.content = '';
    }

    if (type === 'image') {
      newBlock.file = null;
      newBlock.previewUrl = '';
    }

    if (type === 'video') {
      newBlock.url = '';
    }

    if (type === 'code') {
      newBlock.code = '';
    }

    setBlocks((prev) => [...prev, newBlock]);
  };

  const updateBlock = (id, newData) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id
          ? {
              ...block,
              ...newData,
            }
          : block,
      ),
    );
  };

  const removeBlock = (id) => {
    setBlocks((prev) => prev.filter((block) => block.id !== id));
  };

  return (
    <div className={`${styles.page} ${isChatOpen ? styles.chat_open : ''}`}>
      {isChatOpen ? (
        <aside className={styles.ai_chat}>
          <AiChatPanel onClose={() => setIsChatOpen(false)} messages={messages} setMessages={setMessages} />
        </aside>
      ) : (
        <button
          type='button'
          className={styles.open_chat_btn}
          onClick={() => setIsChatOpen(true)}
          aria-label='AI 채팅 열기'
        >
          <span className='material-symbols-sharp'>auto_awesome</span>
        </button>
      )}
      <div className={`container ${styles.workspace}`}>
        <main>
          <TabGroup bgColor={bgColor} activeTab={activeTab} onChangeTab={setActiveTab} />
          <Contents bgColor={bgColor} gap={gap} blocks={blocks} updateBlock={updateBlock} removeBlock={removeBlock}>
            {blocks.map((block) => (
              <EditorBlock key={block.id} block={block} updateBlock={updateBlock} removeBlock={removeBlock} />
            ))}
          </Contents>
        </main>
        <aside className={styles.btns_wrapper}>
          <div className={styles.add_btns}>
            <UploadBtn iconText='image' text='이미지' isIconFill={true} onClick={() => addBlock('image')} />
            <UploadBtn iconText='ondemand_video' text='동영상' onClick={() => addBlock('video')} />
            <UploadBtn iconText='text_fields' text='텍스트' onClick={() => addBlock('text')} />
            <UploadBtn iconText='code' text='코드' onClick={() => addBlock('code')} />
          </div>
          <UploadBtn iconText='import_export' text='순서 바꾸기' />
          <CustomSetting bgColor={bgColor} onSetColor={setBgColor} gap={gap} onSetGap={setGap} />
          <div className={styles.save_btns}>
            <UploadBtn iconText='monitor' text='미리보기' />
            <UploadBtn iconText='save' text='임시 저장' isIconFill={true} />
          </div>
        </aside>
      </div>
    </div>
  );
}
