'use client';

import { useEffect, useState } from 'react';

import styles from './InterviewTimer.module.sass';

function formatElapsed(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function InterviewTimer({ startedAt, running = true }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!startedAt || !running) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt, running]);

  const elapsedMs = startedAt ? now - startedAt : 0;

  return (
    <div className={styles.interview_timer}>
      <span className={`material-symbols-outlined ${styles.timer_icon}`}>
        schedule
      </span>

      <span className="font_body_m_b">면접 진행중</span>

      <span className={`${styles.timer_value} font_body_m_b`}>
        {formatElapsed(elapsedMs)}
      </span>
    </div>
  );
}
