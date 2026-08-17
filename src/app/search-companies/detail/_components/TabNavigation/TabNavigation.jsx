"use client"

import styles from "./TabNavigation.module.sass"

import Link from "next/link";
import { usePathname } from "next/navigation";


export default function TabNavigation({ companySlug }) {
  const pathname = usePathname();
  const isCompany =
  !pathname.includes("/interview-review") &&
  !pathname.includes("/interview-question");
  const isReview = pathname.includes("/interview-review");
  const isQuestion = pathname.includes("/interview-question");
  return (
    <nav className={styles.tab}>
      <Link 
      className={`${styles.tab} ${isCompany ? styles.active : ""} `}
      href={`/search-companies/detail/${companySlug}`}>
        기업 정보
      </Link>

      <Link 
      className={`${styles.tab} ${isReview ? styles.active : ""} `}
      href={`/search-companies/detail/${companySlug}/interview-review`}>
        면접 후기
      </Link>

      <Link 
      className={`${styles.tab} ${isQuestion ? styles.active : ""} `}
      href={`/search-companies/detail/${companySlug}/interview-question`}>
        면접 족보
      </Link>
    </nav>
  );
}