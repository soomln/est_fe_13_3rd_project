import styles from './UploadBtnGroup.module.sass';

import UploadBtn from '../UploadBtn';

export default function UploadBtnGroup() {
  return (
    <div className={styles.group}>
      <UploadBtn iconText='image' text='이미지' isIconFill={true} />
      <UploadBtn iconText='ondemand_video' text='동영상' />
      <UploadBtn iconText='text_fields' text='텍스트' />
      <UploadBtn iconText='code' text='코드' />
    </div>
  );
}
