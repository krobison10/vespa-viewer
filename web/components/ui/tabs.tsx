'use client';

import * as React from 'react';

import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
  const [indicatorStyle, setIndicatorStyle] = React.useState({ left: 0, width: 0 });
  const [isInitialized, setIsInitialized] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);

  const updateIndicator = React.useCallback(() => {
    if (!listRef.current) return;
    const activeTab = listRef.current.querySelector('[data-state="active"]') as HTMLElement;
    if (activeTab) {
      const listRect = listRef.current.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      setIndicatorStyle({
        left: tabRect.left - listRect.left,
        width: tabRect.width,
      });
    }
  }, []);

  // Set initial position immediately without transition
  React.useLayoutEffect(() => {
    updateIndicator();
    // Enable transitions after initial render
    requestAnimationFrame(() => {
      setIsInitialized(true);
    });
  }, [updateIndicator]);

  // Listen for subsequent changes
  React.useEffect(() => {
    const observer = new MutationObserver(updateIndicator);
    if (listRef.current) {
      observer.observe(listRef.current, { attributes: true, subtree: true });
    }
    window.addEventListener('resize', updateIndicator);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateIndicator);
    };
  }, [updateIndicator]);

  return (
    <TabsPrimitive.List
      ref={el => {
        listRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      className={cn(
        'inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground relative select-none',
        className
      )}
      {...props}
    >
      <div
        className="absolute bg-background rounded-md shadow"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
          height: 'calc(100% - 0.5rem)',
          top: '0.25rem',
          transition: isInitialized ? 'all 200ms ease-out' : 'none',
        }}
      />
      {children}
    </TabsPrimitive.List>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative z-10 transition-colors duration-200 select-none',
      'data-[state=active]:text-foreground',
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
