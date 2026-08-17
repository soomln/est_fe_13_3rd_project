'use client';

import SelectBox from '@/app/search-companies/_components/SelectBox';
import { SORT_OPTIONS } from '@/app/search-companies/_lib/options';
import styles from './PostToolbar.module.sass';

// 후기 / 족보 목록 상단 필터 + 글 작성하기
export default function PostToolbar({ filters, codes, onChange, onWriteClick }) {
  const sortOptions = SORT_OPTIONS.map((option) => ({ code: option.value, label: option.label }));

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbar_filters}>
        <SelectBox
          label='직무 전체'
          value={filters.jobRole}
          options={codes.job_role ?? []}
          onChange={(value) => onChange('jobRole', value)}
        />

        <SelectBox
          label='난이도'
          value={filters.difficulty}
          options={codes.difficulty ?? []}
          onChange={(value) => onChange('difficulty', value)}
        />

        <SelectBox
          label='합격 여부'
          value={filters.passResult}
          options={codes.pass_result ?? []}
          onChange={(value) => onChange('passResult', value)}
        />

        <SelectBox
          label='정렬'
          value={filters.sort}
          options={sortOptions}
          onChange={(value) => onChange('sort', value)}
        />
      </div>

      <button type='button' className={`${styles.toolbar_write} font_body_s_b`} onClick={onWriteClick}>
        글 작성하기
      </button>
    </div>
  );
}
