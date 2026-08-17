// 색 고르기에서 쓰는 색 변환

export function hslToRgb(h, s, l) {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const at = (n) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
  };
  return [at(0), at(8), at(4)];
}

export function hslToHex(h, s, l) {
  return `#${hslToRgb(h, s, l)
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')}`;
}

export function hexToHsl(hex) {
  const matched = /^#?([0-9a-f]{6})$/i.exec((hex ?? '').trim());
  if (!matched) return null;

  const num = Number.parseInt(matched[1], 16);
  const r = (num >> 16) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const span = max - min;
  const l = (max + min) / 2;
  const s = span === 0 ? 0 : span / (1 - Math.abs(2 * l - 1));

  let h = 0;
  if (span !== 0) {
    if (max === r) h = ((g - b) / span) % 6;
    else if (max === g) h = (b - r) / span + 2;
    else h = (r - g) / span + 4;
  }

  return { h: (h * 60 + 360) % 360, s: s * 100, l: l * 100 };
}
