'use client';

import { useContext, useEffect, useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { CircleUserRound, LogOut, Settings } from 'lucide-react';

import UserContext from '@/components/providers/user_provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { SettingsModal } from '../pages/settings/settings_modal';
import { useLogOutMutation } from './hooks/use_log_out_mutation';

export function ProfileButton() {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { mutate: logOut, isSuccess: isLogOutSuccess } = useLogOutMutation();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLogOutSuccess) {
      router.push('/');
    }
  }, [isLogOutSuccess]);

  const { user } = useContext(UserContext);
  const letter = user?.name?.charAt(0).toUpperCase() || '';

  const [selectedSettingsTab, setSelectedSettingsTab] = useState('general');

  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#settings/')) {
        const tab = hash.replace('#settings/', '');
        setSelectedSettingsTab(tab);
        setIsSettingsModalOpen(true);
      } else {
        setIsSettingsModalOpen(false);
      }
    };

    checkHash();

    const handleHashChange = () => checkHash();
    const handlePopState = () => checkHash();

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handlePopState);

    const interval = setInterval(checkHash, 100);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handlePopState);
      clearInterval(interval);
    };
  }, [pathname]);

  const handleOpenSettingsModal = (tab = 'general') => {
    setSelectedSettingsTab(tab);
    setIsSettingsModalOpen(true);
    window.history.pushState(null, null, `${pathname}#settings/${tab}`);
  };

  const handleSettingsModalTabChange = tab => {
    setSelectedSettingsTab(tab);
    window.history.pushState(null, null, `${pathname}#settings/${tab}`);
  };

  return (
    <div>
      <SettingsModal
        isOpen={isSettingsModalOpen}
        closeModal={() => {
          setIsSettingsModalOpen(false);
          window.history.pushState(null, null, pathname);
        }}
        initialTab={selectedSettingsTab}
        onTabChange={handleSettingsModalTabChange}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-secondary/50">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback>{letter}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-fit" align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem className="cursor-default text-muted-foreground data-[highlighted]:text-muted-foreground data-[highlighted]:bg-transparent flex items-center gap-2">
              <CircleUserRound />
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleOpenSettingsModal('general')}>
              <Settings />
              <span>Settings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logOut()}>
            <LogOut />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
