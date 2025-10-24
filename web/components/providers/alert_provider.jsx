'use client';

import React, { createContext, useEffect, useState } from 'react';

import { AlertCircle, CheckCircle, X } from 'lucide-react';
import PropTypes from 'prop-types';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const STATES = {
  ERROR: 'destructive',
  SUCCESS: 'success',
};

// Create a simple event system for alerts
let errorCallback = null;
let successCallback = null;

// Export a standalone function that can be used anywhere
export function showError(text, ephemeral = true) {
  if (errorCallback) {
    errorCallback(text, ephemeral);
  } else {
    console.error('Alert system not initialized yet:', text);
  }
}

export function showSuccess(text, ephemeral = true) {
  if (successCallback) {
    successCallback(text, ephemeral);
  } else {
    console.log('Alert system not initialized yet:', text);
  }
}

const AlertContext = createContext({
  alert: null,
  text: null,
  success: () => {},
  error: () => {},
});

const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);
  const [text, setText] = useState(null);
  const [timer, setTimer] = useState(null);
  const [title, setTitle] = useState(null);

  // Clear the alert after a specified time
  const clearAlertWithTimer = (duration = 10000) => {
    clearTimeout(timer); // Clear any existing timer
    const newTimer = setTimeout(() => {
      clear();
    }, duration);
    setTimer(newTimer);
  };

  const error = (text, ephemeral) => {
    console.log('error', text);
    setText(text);
    setTitle('Error');
    setAlert(STATES.ERROR);
    if (ephemeral) {
      clearAlertWithTimer();
    }
  };

  const success = (text, ephemeral) => {
    console.log('success', text);
    setText(text);
    setTitle('Success');
    setAlert(STATES.SUCCESS);
    if (ephemeral) {
      clearAlertWithTimer();
    }
  };

  errorCallback = error;
  successCallback = success;

  const clear = () => {
    setText(null);
    setAlert(null);
    setTitle(null);
    clearTimeout(timer);
  };

  // Cleanup timer on unmount to prevent memory leaks
  useEffect(() => {
    return () => clearTimeout(timer);
  }, [timer]);

  return (
    <AlertContext.Provider value={{ error, success, clear }}>
      {alert && (
        <Alert
          variant={alert}
          className={`fixed w-[520px] top-24 left-1/2 transform -translate-x-1/2 z-[10000] ${
            alert === STATES.ERROR ? 'bg-red-500' : 'bg-green-500'
          } text-white`}
        >
          <button
            onClick={clear}
            className="absolute top-2 right-2 rounded-sm hover:bg-white/20 p-1"
            aria-label="Close alert"
          >
            <X className="h-4 w-4 !text-white" />
          </button>

          {alert === STATES.ERROR ? (
            <AlertCircle className="h-4 w-4 !text-white" />
          ) : (
            <CheckCircle className="h-4 w-4 !text-white" />
          )}
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription className="text-wrap break-words">{text}</AlertDescription>
        </Alert>
      )}
      {children}
    </AlertContext.Provider>
  );
};

AlertProvider.propTypes = {
  children: PropTypes.node,
};

export { AlertProvider };
export default AlertContext;
