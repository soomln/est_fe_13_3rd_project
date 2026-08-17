import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { PAGE_GAP, PAGE_HEIGHT } from '@/app/resume/editor/_lib/pageBreaks';

const PAGE_WIDTH = 794;
// A4 실제 크기(mm). 794x1123px 이 96dpi 기준으로 딱 이 크기다
const A4_WIDTH = 210;
const A4_HEIGHT = 297;
// 글자가 뭉개지지 않게 두 배로 찍는다
const SHOT_SCALE = 2;
// PNG 로 넣으면 두 장에 20MB 가 넘는다. 글자는 이 품질이면 충분하다
const JPEG_QUALITY = 0.92;

// 화면을 그대로 찍어 A4 장마다 잘라 붙인다
export default async function downloadPdf(pagesEl, fileName) {
  const stack = pagesEl.firstElementChild;
  if (!stack) return;

  // 배율이 걸린 채로 찍으면 흐려진다. 찍는 동안만 100% 로 되돌린다
  const previousZoom = pagesEl.style.zoom;
  pagesEl.style.zoom = '1';
  stack.dataset.capture = 'true';

  try {
    const shot = await html2canvas(stack, {
      scale: SHOT_SCALE,
      backgroundColor: '#FFFFFF',
      useCORS: true,
    });

    const count = Math.max(
      1,
      Math.round((stack.offsetHeight + PAGE_GAP) / (PAGE_HEIGHT + PAGE_GAP))
    );

    const sheet = document.createElement('canvas');
    sheet.width = PAGE_WIDTH * SHOT_SCALE;
    sheet.height = PAGE_HEIGHT * SHOT_SCALE;
    const ctx = sheet.getContext('2d');

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });

    for (let page = 0; page < count; page += 1) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, sheet.width, sheet.height);
      ctx.drawImage(
        shot,
        0,
        page * (PAGE_HEIGHT + PAGE_GAP) * SHOT_SCALE,
        sheet.width,
        sheet.height,
        0,
        0,
        sheet.width,
        sheet.height
      );

      if (page > 0) pdf.addPage();
      pdf.addImage(sheet.toDataURL('image/jpeg', JPEG_QUALITY), 'JPEG', 0, 0, A4_WIDTH, A4_HEIGHT);
    }

    pdf.save(`${fileName}.pdf`);
  } finally {
    pagesEl.style.zoom = previousZoom;
    delete stack.dataset.capture;
  }
}
