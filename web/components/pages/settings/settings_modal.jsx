import { useEffect, useState } from 'react';

import clsx from 'clsx';
import { Palette, Settings } from 'lucide-react';

import { ErrorBoundary } from '@/components/common/error_boundary';
import { Text } from '@/components/common/text';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Appearance } from './tabs/appearance';
import { General } from './tabs/general';

export function SettingsModal({ isOpen, closeModal, initialTab = 'general', onTabChange }) {
  const [selectedTab, setSelectedTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setSelectedTab(initialTab);
    }
  }, [initialTab]);

  const handleTabChange = tab => {
    setSelectedTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'general':
        return <General />;
      case 'appearance':
        return <Appearance />;
      default:
        return <></>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="max-w-3xl overflow-hidden p-0 gap-0" aria-description="setings-content">
        <DialogTitle className="p-6 border-b text-2xl">Settings</DialogTitle>
        <div className="h-[512px] flex flex-row gap-3">
          <div className="flex-shrink-0 p-3">
            <SettingsSidebar onSelectTab={handleTabChange} selectedTab={selectedTab} />
          </div>
          <div className="flex-1 overflow-y-auto">
            <ErrorBoundary>
              <ScrollArea className="h-full">
                <div className="py-6 pr-6">{renderTabContent()}</div>
              </ScrollArea>
            </ErrorBoundary>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const tabs = [
  {
    title: 'General',
    value: 'general',
    icon: Settings,
  },
  {
    title: 'Appearance',
    value: 'appearance',
    icon: Palette,
  },
];

function SettingsSidebar({ onSelectTab, selectedTab }) {
  return (
    <div className="h-full flex flex-col gap-2 w-48">
      {tabs.map(tab => (
        <div
          key={tab.value}
          className={clsx(
            'flex items-center gap-2 cursor-pointer justify-start px-3 py-2 rounded-md text-sm',
            selectedTab === tab.value && 'bg-secondary'
          )}
          onClick={() => onSelectTab(tab.value)}
        >
          <tab.icon className="w-4 h-4" />
          <Text>{tab.title}</Text>
        </div>
      ))}
    </div>
  );
}
