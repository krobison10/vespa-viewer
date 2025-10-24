'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import clsx from 'clsx';
import { PanelLeft } from 'lucide-react';

import { ErrorBoundary } from '@/components/common/error_boundary';
import { useBreakpointQuery } from '@/components/common/hooks/use_breakpoint';
import { Logo } from '@/components/common/logo';
import { ProfileButton } from '@/components/common/profile_button';
import { Sidebar } from '@/components/common/sidebar/sidebar';
import { Text } from '@/components/common/text';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Storage key for sidebar state
const SIDEBAR_STATE_KEY = 'sidebar-is-open';

// Get initial sidebar state from localStorage if available
const getInitialSidebarState = () => {
  if (typeof window === 'undefined') return false;
  const storedState = localStorage.getItem(SIDEBAR_STATE_KEY);
  return storedState === null ? true : storedState === 'true';
};

export const LayoutContext = createContext({
  isSidebarOpen: false,
  toggleSidebar: () => {},
});

export const useLayout = () => useContext(LayoutContext);

export default function InternalLayout({ children }) {
  const router = useRouter();

  const isMd = useBreakpointQuery('md');

  const [isSidebarOpen, setIsSidebarOpen] = useState(getInitialSidebarState());

  const prevIsMd = useRef();

  // Sidebar: handle initial load and transitions
  useEffect(() => {
    if (isMd === undefined) return;

    const storedState = typeof window !== 'undefined' ? localStorage.getItem(SIDEBAR_STATE_KEY) : null;

    // On first load
    if (prevIsMd.current === undefined) {
      if (isMd) {
        // Above medium => read stored value or default true
        setIsSidebarOpen(storedState === null ? true : storedState === 'true');
      } else {
        // Start closed below medium
        setIsSidebarOpen(false);
      }
    } else {
      // Transition
      if (prevIsMd.current === false && isMd) {
        // Going from below → above: read stored preference (or default true)
        setIsSidebarOpen(storedState === null ? true : storedState === 'true');
      }
      // Going from above → below: do nothing (keep current state)
    }
    prevIsMd.current = isMd;
  }, [isMd]);

  // Only update localStorage when at or above medium
  useEffect(() => {
    if (typeof window !== 'undefined' && isMd && isSidebarOpen !== undefined) {
      localStorage.setItem(SIDEBAR_STATE_KEY, isSidebarOpen.toString());
    }
  }, [isMd, isSidebarOpen]);

  // Toggle function that both updates state and localStorage
  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
  };

  if (isMd === undefined) {
    return null;
  }

  // Layout context value
  const layoutContextValue = {
    isSidebarOpen,
    sidebarIsEmbedded: isMd,
    toggleSidebar,
  };

  return (
    <LayoutContext.Provider value={layoutContextValue}>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Nav Bar - Three-zone flex layout */}
        <div className="h-12 flex items-center">
          {/* Left zone - Sidebar toggle and buttons */}
          <div
            className="shrink-0 flex items-center justify-between px-2 transition-all duration-300 ease-in-out overflow-hidden"
            style={{ width: isMd && isSidebarOpen ? '16rem' : '120px' }}
          >
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                      <PanelLeft />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <Text variant="p">{isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}</Text>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Center zone - Logo */}
          <div className="flex-1 flex justify-center items-center transition-all duration-300 ease-in-out">
            <Logo />
          </div>

          {/* Right zone - User actions */}
          <div className="shrink-0 px-2 flex items-center gap-2">
            <ErrorBoundary component={<Skeleton className="w-[32px] h-[32px] rounded-full" />}>
              <ProfileButton />
            </ErrorBoundary>
          </div>
        </div>

        {/* Main page */}
        <div className="flex-1 flex min-h-0">
          <div
            className="hidden md:flex pt-3 transition-all duration-300 ease-in-out overflow-hidden"
            style={{ width: isSidebarOpen ? '16rem' : '0' }}
          >
            <ErrorBoundary>
              <div
                className="transition-opacity duration-300 ease-in-out"
                style={{ opacity: isSidebarOpen ? '1' : '0', width: '16rem' }}
              >
                <Sidebar />
              </div>
            </ErrorBoundary>
          </div>
          {!isMd && (
            <Drawer
              direction="left"
              open={isSidebarOpen}
              onOpenChange={open => {
                setIsSidebarOpen(open);
                // If drawer is being closed, blur any active elements
                if (!open && typeof document !== 'undefined') {
                  document.activeElement?.blur();
                }
                // If drawer is being opened, ensure we're not leaving focus in the main content
                if (open && typeof document !== 'undefined') {
                  // Move focus to the drawer or first focusable element in drawer
                  setTimeout(() => {
                    const drawerElement = document.querySelector('[role="dialog"]');
                    if (drawerElement) {
                      const firstFocusable = drawerElement.querySelector(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                      );
                      if (firstFocusable) {
                        firstFocusable.focus();
                      } else {
                        drawerElement.focus();
                      }
                    }
                  }, 100);
                }
              }}
            >
              <VisuallyHidden>
                <DrawerHeader>
                  <DrawerTitle>Sidebar</DrawerTitle>
                  <DrawerDescription>Sidebar</DrawerDescription>
                </DrawerHeader>
              </VisuallyHidden>
              <DrawerContent className="w-64 h-full pb-4 rounded-none">
                <ErrorBoundary>
                  <Sidebar />
                </ErrorBoundary>
              </DrawerContent>
            </Drawer>
          )}

          {/* Main page */}
          <div
            className={clsx(
              'h-full flex-1 border-t bg-card text-card-foreground shadow tracking-tight overflow-hidden',
              !isSidebarOpen && 'rounded-none md:rounded-none',
              isSidebarOpen && 'md:rounded-tl-2xl rounded-tl-none md:border-l'
            )}
          >
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </div>
      </div>
    </LayoutContext.Provider>
  );
}
