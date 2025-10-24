'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

import { Loader2 } from 'lucide-react';

import ExternalLayoutMinimal from '@/components/layouts/external_layout_minimal';
import { showError } from '@/components/providers/alert_provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCookie } from '@/utils/helpers';

import { useSignupMutation } from './hooks/use_signup_mutation';
import { PasswordRequirements, checkPasswordRequirements } from './password_requirements';

export function CreatePassword() {
  const router = useRouter();

  const cookieEmail = getCookie('loginEmail');

  const { mutate: submitSignup, isPending: isPending } = useSignupMutation();

  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    let timeoutId;

    if (isPending) {
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
  }, [isPending]);

  const [email, setEmail] = useState('');

  useEffect(() => {
    if (cookieEmail === null) {
      router.push('/signup');
    }

    setEmail(cookieEmail);
  }, [cookieEmail, router]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordCheck = checkPasswordRequirements(password, confirmPassword);
  const isPasswordValid = passwordCheck.isPasswordValid;

  const params = useSearchParams();

  useEffect(() => {
    if (!params.get('error')) {
      return;
    }

    switch (params.get('error')) {
      default:
        showError('An unknown error occurred, please try again or contact support if the problem persists', false);
    }
  }, [params]);

  const handleSubmit = () => {
    if (!isPasswordValid) {
      return;
    }

    submitSignup(
      { email, password },
      {
        onSuccess: () => {
          window.location.href = '/';
        },
      }
    );
  };

  return (
    <ExternalLayoutMinimal>
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col gap-8 justify-center items-center w-96">
          <h1 className="text-4xl font-bold">Create a password</h1>

          <div className="w-full flex flex-col gap-8">
            <div className="flex flex-col gap-4 w-full">
              <div className="relative w-full">
                <Input
                  type="email"
                  value={email}
                  name="email"
                  placeholder="Email address"
                  className="text-muted-foreground"
                  readOnly
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-[20px]"
                  onClick={() => router.push('/signup')}
                >
                  Edit
                </Button>
              </div>
              <Input
                type="password"
                placeholder="Password*"
                name="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Confirm password*"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>

            <PasswordRequirements requirements={passwordCheck} />

            <Button className="w-full text-center" disabled={!isPasswordValid || isPending} onClick={handleSubmit}>
              {isPending && showLoader && <Loader2 className="w-4 h-4 animate-spin" />}
              Create account
            </Button>
          </div>
        </div>
      </div>
    </ExternalLayoutMinimal>
  );
}
