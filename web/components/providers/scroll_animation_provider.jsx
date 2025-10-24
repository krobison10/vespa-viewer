'use client';

import { useScrollAnimation } from '@/components/common/hooks/use_scroll_animation';

export function ScrollAnimationProvider({ children }) {
  useScrollAnimation();
  return children;
}
