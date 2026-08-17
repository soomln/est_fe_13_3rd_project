import { Suspense } from 'react';
import UploadClient from './UploadClient';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <UploadClient />
    </Suspense>
  );
}
