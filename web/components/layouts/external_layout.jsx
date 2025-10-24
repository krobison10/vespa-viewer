import { Text } from '@/components/common/text';

export default function ExternalLayout({ children }) {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-start items-center h-[68px] w-full p-4">
        <Text variant="h3">Vespa Viewer</Text>
      </div>
      <div className="h-full">{children}</div>
    </div>
  );
}
