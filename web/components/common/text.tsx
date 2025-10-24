import React from 'react';

import clsx from 'clsx';

type Variant = 'p' | 'h1' | 'h2' | 'h3' | 'h4';

type VariantConfig = {
  element: keyof React.JSX.IntrinsicElements;
  className: string;
};

const variants: Record<Variant, VariantConfig> = {
  p: {
    element: 'p',
    className: 'text-sm',
  },
  h1: {
    element: 'h1',
    className: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
  },
  h2: {
    element: 'h2',
    className: 'scroll-m-20 text-3xl font-semibold tracking-tight',
  },
  h3: {
    element: 'h3',
    className: 'scroll-m-20 text-2xl font-semibold tracking-tight',
  },
  h4: {
    element: 'h4',
    className: 'scroll-m-20 text-xl font-semibold tracking-tight',
  },
};

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
}

export function Text({ children, className, variant = 'p', ...props }: TextProps) {
  const Tag = variants[variant]?.element || 'p';

  return (
    // @ts-expect-error React doesn't infer the correct type for dynamic elements
    <Tag className={clsx(variants[variant]?.className, className)} {...props}>
      {children}
    </Tag>
  );
}
