'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

import PropTypes from 'prop-types';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Create context with default values
const ConfirmContext = createContext({
  confirm: () => Promise.reject(new Error('ConfirmProvider not found')),
});

export const ConfirmProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState({});
  const [resolveRef, setResolveRef] = useState(null);

  const confirm = useCallback((options = {}) => {
    return new Promise(resolve => {
      setOptions(options);
      setResolveRef(() => resolve);
      setOpen(true);
    });
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleConfirm = useCallback(() => {
    if (resolveRef) {
      resolveRef(true);
    }
    handleClose();
  }, [resolveRef, handleClose]);

  const handleCancel = useCallback(() => {
    if (resolveRef) {
      resolveRef(false);
    }
    handleClose();
  }, [resolveRef, handleClose]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent {...options.dialogProps}>
          <DialogHeader>
            {options.title && <DialogTitle {...options.titleProps}>{options.title}</DialogTitle>}
            {options.description && (
              <DialogDescription className="!mt-4 break-all">{options.description}</DialogDescription>
            )}
          </DialogHeader>

          {options.content && <div {...options.contentProps}>{options.content}</div>}

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} {...options.cancellationButtonProps}>
              {options.cancellationText || 'Cancel'}
            </Button>
            <Button onClick={handleConfirm} {...options.confirmationButtonProps}>
              {options.confirmationText || 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {children}
    </ConfirmContext.Provider>
  );
};

ConfirmProvider.propTypes = {
  children: PropTypes.node,
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);

  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }

  return context.confirm;
};
