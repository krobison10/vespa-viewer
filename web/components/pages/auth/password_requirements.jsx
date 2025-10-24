'use client';

import { Check, Circle } from 'lucide-react';

import { Text } from '@/components/common/text';

export function PasswordRequirements({ requirements }) {
  const { isLongEnough, hasUppercase, hasLowercase, hasNumber, hasSpecialChar, passwordsMatch } = requirements;

  return (
    <div className="w-full flex flex-col gap-2 rounded-md border-[1px] p-3">
      <Text>Password requirements</Text>

      <div className="flex items-center justify-start gap-2">
        {isLongEnough ? <Check className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-muted" />}
        <Text>At least 8 characters</Text>
      </div>

      <div className="flex items-center justify-start gap-2">
        {hasUppercase ? <Check className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-muted" />}
        <Text>Uppercase letter</Text>
      </div>

      <div className="flex items-center justify-start gap-2">
        {hasLowercase ? <Check className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-muted" />}
        <Text>Lowercase letter</Text>
      </div>

      <div className="flex items-center justify-start gap-2">
        {hasNumber ? <Check className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-muted" />}
        <Text>Number</Text>
      </div>

      <div className="flex items-center justify-start gap-2">
        {hasSpecialChar ? <Check className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-muted" />}
        <Text>Special character</Text>
      </div>

      <div className="flex items-center justify-start gap-2">
        {passwordsMatch ? <Check className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-muted" />}
        <Text>Passwords match</Text>
      </div>
    </div>
  );
}

export function checkPasswordRequirements(password, confirmPassword) {
  const isLongEnough = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const isPasswordValid = isLongEnough && hasUppercase && hasLowercase && hasNumber && hasSpecialChar && passwordsMatch;

  return { isPasswordValid, isLongEnough, hasUppercase, hasLowercase, hasNumber, hasSpecialChar, passwordsMatch };
}
