'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

import { Loader2 } from 'lucide-react';

import ExternalLayout from '@/components/layouts/external_layout';
import { showError } from '@/components/providers/alert_provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCookie } from '@/utils/helpers';

import { useLoginMutation } from './hooks/use_login_mutation';

const handledCodes = ['invalid_credentials'];

export function EnterPassword() {
  const cookieEmail = getCookie('loginEmail');

  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [hasSubmitAttempt, setHasSubmitAttempt] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [error, setError] = useState(undefined);
  const [showLoader, setShowLoader] = useState(false);

  const { mutate: submitLogin, isPending: isLoginPending } = useLoginMutation(handledCodes);

  useEffect(() => {
    if (cookieEmail === null) {
      router.push('/login');
    }

    setEmail(cookieEmail);
  }, [cookieEmail, router]);

  const checkPasswordValidity = password => {
    return password && password.trim() !== '' && password.length >= 8;
  };

  useEffect(() => {
    if (!hasSubmitAttempt) {
      setIsPasswordValid(true);
    } else {
      const isValid = checkPasswordValidity(password);
      setIsPasswordValid(isValid);
      setError(isValid ? undefined : 'Please enter your password');
    }
  }, [hasSubmitAttempt, password]);

  useEffect(() => {
    let timeoutId;

    if (isLoginPending) {
      timeoutId = setTimeout(() => {
        setShowLoader(true);
      }, 200);
    } else {
      timeoutId = setTimeout(() => {
        setShowLoader(false);
      }, 200);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoginPending]);

  const params = useSearchParams();

  useEffect(() => {
    if (!params.get('error')) {
      return;
    }

    switch (params.get('error')) {
      case 'invalid_credentials':
        showError('Email or password is incorrect, please try again or contact support if the problem persists', false);
        break;
      default:
        showError('An unknown error occurred, please try again or contact support if the problem persists', false);
    }
  }, [params]);

  const handleSubmit = () => {
    setHasSubmitAttempt(true);

    if (!checkPasswordValidity(password)) {
      return;
    }

    submitLogin(
      { email, password },
      {
        onSuccess: data => {
          if (data.status === 'fail') {
            if (data.code === 'invalid_credentials') {
              setError('Password is incorrect');
              setIsPasswordValid(false);
            }
            return;
          }

          window.location.href = '/';
        },
      }
    );
  };

  return (
    <ExternalLayout>
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col gap-8 justify-center items-center w-96">
          <h1 className="text-4xl font-bold">Enter password</h1>

          <div className="w-full flex flex-col gap-8">
            <div className="flex flex-col gap-4 w-full">
              <div className="relative w-full">
                <Input type="email" value={email || ''} name="email" className="text-muted-foreground" readOnly />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-[20px]"
                  onClick={() => router.push('/login')}
                >
                  Edit
                </Button>
              </div>
              <div className="flex flex-col gap-1">
                <Input
                  type="password"
                  placeholder="Password*"
                  name="password"
                  value={password}
                  className={!isPasswordValid ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  onChange={e => setPassword(e.target.value)}
                />
                {!isPasswordValid && <p className="text-sm text-red-500">{error}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1 w-full">
              <Button
                onClick={handleSubmit}
                className="w-full text-center"
                disabled={!password || !isPasswordValid || isLoginPending}
              >
                {isLoginPending && showLoader && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Login
              </Button>
              <Button
                variant="link"
                type="button"
                className="w-full text-center underline"
                onClick={() => forgotPassword({ email })}
                disabled={isForgotPasswordPending}
              >
                I forgot my password
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ExternalLayout>
  );
}
