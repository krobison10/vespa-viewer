import { useEffect, useState } from 'react';

export function useLoadingState(isLoading, minDuration = 500) {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    let timeoutId;
    if (isLoading) {
      timeoutId = setTimeout(() => {
        setShowLoading(true);
      }, minDuration);
    } else {
      setShowLoading(false);
    }

    return () => clearTimeout(timeoutId);
  }, [isLoading, minDuration]);

  return showLoading;
}
