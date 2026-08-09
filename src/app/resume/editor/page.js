import EditorShell from '@/app/resume/editor/_components/EditorShell';
import styles from './page.module.sass';

// 주의: 에디터 엔진 붙이기 전까지 쓰는 임시 본문
const SAMPLE_PAGES = [
  `<h1>홍길동</h1>
   <p><em>프론트엔드 개발자</em></p>
   <h2>인적사항</h2>
   <table><tbody>
     <tr><td>이메일</td><td>hong@example.com</td></tr>
     <tr><td>연락처</td><td>010-0000-0000</td></tr>
     <tr><td>깃허브</td><td>github.com/hong</td></tr>
   </tbody></table>
   <h2>학력</h2>
   <table><tbody>
     <tr><td>2020.03 – 2024.02</td><td>○○대학교 소프트웨어학과 (졸업)</td></tr>
   </tbody></table>
   <h2>경력</h2>
   <table><tbody>
     <tr><td>2024.03 – 재직 중</td><td>○○○ / 프론트엔드 개발</td></tr>
   </tbody></table>`,
  `<h2>기술 스택</h2>
   <ul>
     <li>JavaScript, TypeScript</li>
     <li>React, Next.js</li>
     <li>Git, Figma</li>
   </ul>
   <h2>자격 및 어학</h2>
   <table><tbody>
     <tr><td>2024.06</td><td>정보처리기사</td></tr>
     <tr><td>2024.09</td><td>OPIc IH</td></tr>
   </tbody></table>`,
];

export default function Editor() {
  return (
    <div className={styles.editor}>
      <EditorShell pages={SAMPLE_PAGES} />
    </div>
  );
}
