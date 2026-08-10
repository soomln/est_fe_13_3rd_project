import { useState } from 'react';
import styles from './CustomSetting.module.sass';

export default function CustomSetting({ bgColor, onSetColor, onSetGap }) {
  const [gap, setGap] = useState(Number(16));
  const minGap = 0;
  const maxGap = 64;
  const gapPercent = ((gap - minGap) / (maxGap - minGap)) * 100;

  return (
    <div className={styles.custom_setting}>
      <div className={styles.bg_color_setting}>
        <span className='font_body_s_r'>배경 색상</span>
        <div className={styles.input_wrapper}>
          <input type='color' value={bgColor} onChange={(e) => onSetColor(e.target.value)} />
          <input
            type='text'
            value={bgColor}
            placeholder='#000000'
            maxLength={7}
            onChange={(e) => {
              const value = e.target.value;
              if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                onSetColor(value);
              }
            }}
            className={`${styles.color_code} font_caption_b`}
          />
        </div>
      </div>
      <div className={styles.gap_setting}>
        <div className={styles.slider_header}>
          <span className='font_body_s_r'>간격 설정</span>
          <span className='font_body_s_r'>{gap}px</span>
        </div>
        <input
          type='range'
          min='0'
          max='64'
          value={gap}
          onChange={(e) => {
            setGap(Number(e.target.value));
          }}
          className={styles.slider}
          style={{
            '--progress': `${gapPercent}%`,
          }}
        />
      </div>
    </div>
  );
}
