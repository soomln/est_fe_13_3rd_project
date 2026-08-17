'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { hexToHsl, hslToHex, hslToRgb } from '@/app/resume/editor/_lib/color';
import styles from './ColorPicker.module.sass';

// 자주 쓰는 색
const SWATCHES = [
  { key: 'black', value: '#111111' },
  { key: 'gray', value: '#6F6F6F' },
  { key: 'silver', value: '#ACAEAD' },
  { key: 'white', value: '#FFFFFF' },
  { key: 'red', value: '#DC2626' },
  { key: 'orange', value: '#FF9900' },
  { key: 'yellow', value: '#FFE600' },
  { key: 'green', value: '#00A63D' },
  { key: 'blue', value: '#0066FF' },
  { key: 'purple', value: '#8635F6' },
  { key: 'pink', value: '#FF6699' },
  { key: 'brown', value: '#823000' },
];

// 화면에 그려지는 크기(px). 캔버스는 선명하게 두 배로 그린다
const WHEEL = 176;
const BAR_H = 16;
const SCALE = 2;

// 버튼 아래에 붙어서 열리는 색 고르기
export default function ColorPicker({ isOpen, current, onPick, onClose }) {
  const boxRef = useRef(null);
  const wheelRef = useRef(null);
  const barRef = useRef(null);
  // 원판 그림은 밝기가 바뀔 때만 다시 만든다
  const wheelCacheRef = useRef({ l: null, image: null });

  const [isCustom, setIsCustom] = useState(false);
  const [hsl, setHsl] = useState({ h: 0, s: 100, l: 50 });
  const [hexDraft, setHexDraft] = useState(null);

  const hex = hslToHex(hsl.h, hsl.s, hsl.l);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onDown = (event) => {
      if (!boxRef.current?.contains(event.target)) onClose();
    };
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  // 닫히면 다음에 열 때 다시 팔레트부터 보여준다
  useEffect(() => {
    if (!isOpen) setIsCustom(false);
  }, [isOpen]);

  const drawWheel = useCallback(() => {
    const canvas = wheelRef.current;
    if (!canvas) return;

    const size = WHEEL * SCALE;
    const radius = size / 2;
    const ctx = canvas.getContext('2d');
    const rounded = Math.round(hsl.l);

    if (wheelCacheRef.current.l !== rounded) {
      const image = ctx.createImageData(size, size);

      for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
          const dx = x - radius + 0.5;
          const dy = y - radius + 0.5;
          const dist = Math.hypot(dx, dy);
          const at = (y * size + x) * 4;

          if (dist > radius) continue;

          const hue = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
          const [r, g, b] = hslToRgb(hue, Math.min(1, dist / radius) * 100, rounded);

          image.data[at] = r;
          image.data[at + 1] = g;
          image.data[at + 2] = b;
          image.data[at + 3] = Math.min(255, (radius - dist) * 255);
        }
      }

      wheelCacheRef.current = { l: rounded, image };
    }

    ctx.putImageData(wheelCacheRef.current.image, 0, 0);

    const angle = (hsl.h * Math.PI) / 180;
    const at = (hsl.s / 100) * radius;
    const mx = radius + Math.cos(angle) * at;
    const my = radius + Math.sin(angle) * at;

    ctx.beginPath();
    ctx.arc(mx, my, 8, 0, Math.PI * 2);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(mx, my, 10, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [hsl]);

  const drawBar = useCallback(() => {
    const canvas = barRef.current;
    if (!canvas) return;

    const width = WHEEL * SCALE;
    const height = BAR_H * SCALE;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, hslToHex(hsl.h, hsl.s, 0));
    gradient.addColorStop(0.5, hslToHex(hsl.h, hsl.s, 50));
    gradient.addColorStop(1, hslToHex(hsl.h, hsl.s, 100));

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const mx = (hsl.l / 100) * width;
    ctx.beginPath();
    ctx.rect(Math.max(2, Math.min(width - 6, mx - 2)), 0, 4, height);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [hsl]);

  useEffect(() => {
    if (!isOpen || !isCustom) return;
    drawWheel();
    drawBar();
  }, [isOpen, isCustom, drawWheel, drawBar]);

  if (!isOpen) return null;

  const openCustom = () => {
    setHsl(hexToHsl(current) ?? { h: 0, s: 100, l: 50 });
    setHexDraft(null);
    setIsCustom(true);
  };

  const pickOnWheel = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - box.left - box.width / 2;
    const dy = event.clientY - box.top - box.height / 2;
    const dist = Math.min(1, Math.hypot(dx, dy) / (box.width / 2));

    setHexDraft(null);
    setHsl((prev) => ({
      ...prev,
      h: ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360,
      s: dist * 100,
    }));
  };

  const pickOnBar = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));

    setHexDraft(null);
    setHsl((prev) => ({ ...prev, l: ratio * 100 }));
  };

  const dragProps = (pick) => ({
    onPointerDown: (event) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      pick(event);
    },
    onPointerMove: (event) => {
      if (event.buttons === 1) pick(event);
    },
  });

  return (
    <div className={styles.color_picker} ref={boxRef} onMouseDown={(e) => e.preventDefault()}>
      {isCustom ? (
        <>
          <canvas
            ref={wheelRef}
            width={WHEEL * SCALE}
            height={WHEEL * SCALE}
            className={styles.color_picker_wheel}
            aria-label='색상환. 끌어서 색을 고르세요'
            {...dragProps(pickOnWheel)}
          />

          <canvas
            ref={barRef}
            width={WHEEL * SCALE}
            height={BAR_H * SCALE}
            className={styles.color_picker_bar}
            aria-label='밝기'
            {...dragProps(pickOnBar)}
          />

          <div className={styles.color_picker_hex}>
            <input
              type='text'
              className={`${styles.color_picker_hex_field} font_body_s_r`}
              value={hexDraft ?? hex.toUpperCase()}
              onChange={(event) => {
                setHexDraft(event.target.value);
                const parsed = hexToHsl(event.target.value);
                if (parsed) setHsl(parsed);
              }}
              onBlur={() => setHexDraft(null)}
              aria-label='색상 코드'
            />
            <button
              type='button'
              className={`${styles.color_picker_apply} font_body_s_b`}
              onClick={() => onPick(hex)}
            >
              적용
            </button>
          </div>

          <button
            type='button'
            className={`${styles.color_picker_more} font_body_s_b`}
            onClick={() => setIsCustom(false)}
          >
            <span className='material-symbols-sharp' aria-hidden='true'>
              arrow_back
            </span>
            기본 색으로
          </button>
        </>
      ) : (
        <>
          <ul className={styles.color_picker_list}>
            {SWATCHES.map((swatch) => (
              <li key={swatch.key}>
                <button
                  type='button'
                  className={`${styles.color_picker_swatch} ${styles[`color_picker_${swatch.key}`]} ${
                    swatch.value === current ? styles.color_picker_swatch_on : ''
                  }`}
                  aria-label={swatch.value}
                  onClick={() => onPick(swatch.value)}
                />
              </li>
            ))}
          </ul>

          <button
            type='button'
            className={`${styles.color_picker_more} font_body_s_b`}
            onClick={openCustom}
          >
            <span className='material-symbols-sharp' aria-hidden='true'>
              add
            </span>
            색상 추가
          </button>
        </>
      )}
    </div>
  );
}
