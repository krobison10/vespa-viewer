import Link from 'next/link';

import { Text } from '@/components/common/text';

export function Logo() {
  return (
    <div className="">
      <Link href="/" className="cursor-pointer flex items-center gap-1">
        <VespaSVG />
        <Text className="text-primary !text-2xl !font-bold -ml-3">VespaViewer</Text>
      </Link>
    </div>
  );
}

export function VespaSVG() {
  return (
    <svg width="52" height="31" viewBox="0 0 70 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="vespaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#ff3985', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#fea809', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path
        d="M13.5876 32.2135H56.2925L42.7049 45.2039H0V26.6467L13.5876 13.6562V32.2135Z"
        fill="url(#vespaGradient)"
      ></path>
      <path
        d="M69.8804 0.666016V19.2233L56.2928 32.213V13.6558H13.5879L27.1762 0.666016H69.8804Z"
        fill="url(#vespaGradient)"
      ></path>
    </svg>
  );
}
