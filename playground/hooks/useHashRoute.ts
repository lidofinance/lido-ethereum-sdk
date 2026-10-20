import { useCallback, useEffect, useState } from 'react';

const readHash = () =>
  typeof window === 'undefined'
    ? ''
    : decodeURIComponent(window.location.hash.replace(/^#/, ''));

/** Current `location.hash` (without `#`) kept in sync with navigation. */
export const useHashRoute = () => {
  const [hash, setHash] = useState('');

  useEffect(() => {
    const update = () => setHash(readHash());
    update();
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  const navigate = useCallback((next: string) => {
    window.location.hash = next;
  }, []);

  return [hash, navigate] as const;
};
