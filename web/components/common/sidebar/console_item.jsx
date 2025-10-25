import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import clsx from 'clsx';
import { Edit, Ellipsis, Loader2, Terminal, Trash } from 'lucide-react';

import { useDeleteConsoleMutation } from '@/components/common/sidebar/hooks/use_delete_console_mutation';
import { useUpdateConsoleMutation } from '@/components/common/sidebar/hooks/use_update_console_mutation';
import { useConfirm } from '@/components/providers/confirm_provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ConsoleItem({ console, dataSourceId, isSelected, onClick, showOptionsMenu = true }) {
  const { mutate: updateConsole } = useUpdateConsoleMutation();

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameText, setRenameText] = useState(console.name);
  const inputRef = useRef(null);

  // Set initial rename text
  useEffect(() => {
    setRenameText(console.name);
  }, [console.name]);

  // Focus input when renaming
  useEffect(() => {
    if (isRenaming) {
      // Add a small delay to ensure the DOM has updated
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 200);
    }
  }, [isRenaming]);

  // Handle submit of rename
  function handleRename() {
    setIsRenaming(false);
    if (renameText.trim() === '') {
      setRenameText(console.name);
    } else if (isRenaming && console.name !== renameText.trim()) {
      updateConsole({
        data_source_id: dataSourceId,
        id: console.id,
        name: renameText,
      });
    }
  }

  // Click handler
  function handleClick(e) {
    if (isRenaming) {
      e.preventDefault();
      e.stopPropagation();
    } else {
      // If not renaming, handle click like usual
      onClick(e);
    }
  }

  // Listen for enter and submit
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Enter') {
        handleRename();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRename]);

  // Listen for escape and cancel
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape') {
        setRenameText(console.name);
        setIsRenaming(false);
      }
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [console.name]);

  return (
    <div
      className={clsx(
        'relative px-2 py-1 hover:bg-accent rounded-md cursor-pointer flex items-center gap-1 text-muted-foreground group overflow-hidden',
        isSelected && 'bg-accent',
        isRenaming && !isSelected && 'hover:bg-background'
      )}
      onClick={handleClick}
    >
      <Terminal className="w-4 h-4 flex-shrink-0" />
      {isRenaming ? (
        <input
          type="text"
          value={renameText}
          onChange={e => setRenameText(e.target.value)}
          onBlur={handleRename}
          ref={inputRef}
          className={clsx('flex-1 bg-transparent border-2 px-1 text-sm min-w-0', showOptionsMenu && 'group-hover:pr-4')}
          autoFocus
        />
      ) : (
        <span className={clsx('text-sm truncate min-w-0 flex-1', showOptionsMenu && 'group-hover:pr-4')}>
          {renameText}
        </span>
      )}
      {showOptionsMenu && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2">
          <ConsoleOptionsMenu
            console={console}
            dataSourceId={dataSourceId}
            isSelected={isSelected}
            setIsRenaming={setIsRenaming}
          />
        </div>
      )}
    </div>
  );
}

function ConsoleOptionsMenu({ console, dataSourceId, isSelected, setIsRenaming }) {
  const router = useRouter();
  const confirm = useConfirm();

  const { mutate: deleteConsole, isPending: deletePending } = useDeleteConsoleMutation();

  function handleDeleteConsole(e) {
    e.preventDefault();
    e.stopPropagation();
    confirm({
      title: 'Delete Console?',
      description: `This will permanently delete "${console.name}"`,
      confirmationText: 'Delete',
      cancellationText: 'Cancel',
      confirmationButtonProps: { variant: 'destructive' },
      dialogProps: {
        className: 'max-w-sm',
      },
    }).then(confirmed => {
      if (confirmed) {
        // Redirect immediately if this console is selected to avoid query errors
        if (isSelected) {
          router.push(`/data-source/${dataSourceId}/console/default`);
        }
        deleteConsole({ data_source_id: dataSourceId, id: console.id });
      }
    });
  }

  function handleRenameConsole(e) {
    setIsRenaming(true);
    e.stopPropagation();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className="p-1 rounded-md cursor-pointer flex-shrink-0 invisible group-hover:visible"
          onClick={e => e.stopPropagation()}
        >
          <Ellipsis className="h-4 w-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-24">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleRenameConsole}>
            <Edit />
            <span>Rename</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-500" disabled={deletePending} onClick={handleDeleteConsole}>
          {deletePending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash />}
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
