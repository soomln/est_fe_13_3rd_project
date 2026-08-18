import { Suspense } from 'react';
import Portfolio from './Portfolio';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Portfolio />
    </Suspense>
  );
}
