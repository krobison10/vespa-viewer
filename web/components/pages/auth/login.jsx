'use client';

import { useEffect, useState } from 'react';
import { FaGoogle } from 'react-icons/fa';

import { useRouter, useSearchParams } from 'next/navigation';

import { Loader2 } from 'lucide-react';

import ExternalLayout from '@/components/layouts/external_layout';
import { showError } from '@/components/providers/alert_provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCookie } from '@/utils/helpers';

import { useLoginMutation } from './hooks/use_login_mutation';

const handledLoginCodes = ['invalid_credentials'];

export function Login() {
  const router = useRouter();

  const cookieEmail = getCookie('loginEmail');

  const { mutate: submitLogin, isPending: isLoginPending } = useLoginMutation(handledLoginCodes);

  const submitPending = isLoginPending;

  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    let timeoutId;

    if (submitPending) {
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
  }, [submitPending]);

  const [hasSubmitAttempt, setHasSubmitAttempt] = useState(false);
  const [email, setEmail] = useState(undefined);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [error, setError] = useState(undefined);

  const checkEmailValidity = email => {
    return email && email.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  useEffect(() => {
    if (!hasSubmitAttempt) {
      setIsEmailValid(true);
    } else {
      const isValid = checkEmailValidity(email);
      setIsEmailValid(isValid);
      setError(isValid ? undefined : 'Please enter a valid email address');
    }
  }, [hasSubmitAttempt, email]);

  useEffect(() => {
    if (email === undefined) {
      setEmail(cookieEmail || '');
    }
  }, [cookieEmail, email]);

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

    if (!checkEmailValidity(email)) {
      return;
    }

    submitLogin(
      { email },
      {
        onSuccess: data => {
          if (data.status === 'fail') {
            if (data.code === 'invalid_credentials') {
              setError('Password is incorrect, please try again');
              setIsEmailValid(false);
            }
            return;
          }

          if (data.redirect) {
            window.location.href = data.redirect;
          } else {
            router.push('/');
            // router.push('/login/password');
          }
        },
      }
    );
  };

  return (
    <ExternalLayout>
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col justify-center items-center w-96">
          <h1 className="text-4xl font-bold mb-8">Log in</h1>

          <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <Input
                type="email"
                placeholder="Email address*"
                name="email"
                value={email || ''}
                className={!isEmailValid ? 'border-red-500 focus-visible:ring-red-500' : ''}
                onChange={e => setEmail(e.target.value)}
              />
              {!isEmailValid && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full text-center mb-6"
              disabled={!email || !isEmailValid || submitPending}
            >
              {submitPending && showLoader && <Loader2 className="w-4 h-4 animate-spin" />}
              Continue
            </Button>
          </div>

          {/* <div className="flex justify-center items-center w-96 mb-6">
            <Separator className="w-5/12" />
            <p className="text-sm mx-4 flex-grow text-center">OR</p>
            <Separator className="w-5/12" />
          </div>

          <Button
            className="w-full mb-2 flex items-center justify-center gap-2"
            variant="outline"
            onClick={() => {
              window.location.href = `${API_URL}/auth/google`;
            }}
          >
            <FaGoogle className="h-5 w-5" />
            Continue with Google
          </Button> */}
          {/* <Button className="w-full mb-2 flex items-center justify-center gap-2" variant="outline">
            <FaMicrosoft className="h-5 w-5" />
            Continue with Microsoft Account
          </Button>
          <Button className="w-full mb-2 flex items-center justify-center gap-2" variant="outline">
            <FaApple className="h-5 w-5" />
            Continue with Apple
          </Button> */}
        </div>
      </div>
    </ExternalLayout>
  );
}
