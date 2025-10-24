import { useEffect, useState } from 'react';

// Tailwind default breakpoints
const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
};

export function useMediaQuery(query) {
  // Start with undefined to indicate "not yet determined"
  const [matches, setMatches] = useState(undefined);

  useEffect(() => {
    // We're on the client now, set the actual value
    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);

    const handleChange = event => {
      setMatches(event.matches);
    };

    mediaQueryList.addEventListener('change', handleChange);

    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

// Helper function to use with Tailwind breakpoint names
export function useBreakpointQuery(breakpoint) {
  return useMediaQuery(breakpoints[breakpoint] || breakpoints.md);
}
