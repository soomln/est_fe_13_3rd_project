'use client';
import { useState } from 'react';

import styles from './page.module.sass';

import TabGroup from '../_components/Modal/TabGroup';
import Contents from '../_components/Modal/Contents';
import UploadBtn from './_components/UploadBtn';
import CustomSetting from './_components/CustomSetting';

export default function Upload() {
  const [activeTab, setActiveTab] = useState('ai');
  const [bgColor, setBgColor] = useState('#ffffff');

  return (
    <div className={`container ${styles.workspace}`}>
      <div>
        <TabGroup bgColor={bgColor} activeTab={activeTab} onChangeTab={setActiveTab} />
        <Contents bgColor={bgColor} />
      </div>
      <div className={styles.btns_wrapper}>
        <div className={styles.add_btns}>
          <UploadBtn iconText='image' text='이미지' isIconFill={true} />
          <UploadBtn iconText='ondemand_video' text='동영상' />
          <UploadBtn iconText='text_fields' text='텍스트' />
          <UploadBtn iconText='code' text='코드' />
        </div>
        <UploadBtn iconText='import_export' text='순서 바꾸기' />
        <CustomSetting bgColor={bgColor} onSetColor={setBgColor} />
        <div className={styles.save_btns}>
          <UploadBtn iconText='monitor' text='미리보기' />
          <UploadBtn iconText='save' text='임시 저장' isIconFill={true} />
        </div>
      </div>
    </div>
  );
}
