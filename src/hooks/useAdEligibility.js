'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { canLoadAdvertising } from '@/lib/adSafety';

export function useAdEligibility() {
  const pathname = usePathname();
  const [eligible, setEligible] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setEligible(canLoadAdvertising(pathname, window.localStorage));
    setReady(true);
  }, [pathname]);

  return { eligible, ready };
}
