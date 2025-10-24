import { Check, CircleAlert, Minus } from 'lucide-react';

export const STATUS_VARIANT = {
  NEUTRAL: 'NEUTRAL',
  POSITIVE: 'POSITIVE',
  WARN: 'WARN',
  DESTRUCTIVE: 'DESTRUCTIVE',
};

const defaultIcons = {
  [STATUS_VARIANT.NEUTRAL]: Minus,
  [STATUS_VARIANT.POSITIVE]: Check,
  [STATUS_VARIANT.WARN]: CircleAlert,
  [STATUS_VARIANT.DESTRUCTIVE]: CircleAlert,
};

const variantStyles = {
  [STATUS_VARIANT.NEUTRAL]: 'bg-gray-500/20 text-gray-500',
  [STATUS_VARIANT.POSITIVE]: 'bg-green-500/20 text-green-500',
  [STATUS_VARIANT.WARN]: 'bg-yellow-300/20 text-yellow-500',
  [STATUS_VARIANT.DESTRUCTIVE]: 'bg-red-500/20 text-red-500',
};

export function StatusBadge({ variant = STATUS_VARIANT.NEUTRAL, icon, text, className = '' }) {
  const Icon = icon || defaultIcons[variant];

  return (
    <div
      className={`flex items-center gap-1 !text-xs font-medium rounded-md px-2 py-1 w-fit ${variantStyles[variant]} ${className}`}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {text}
    </div>
  );
}