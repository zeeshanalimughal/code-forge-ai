'use client';

import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signIn } from '@/lib/auth-client';
import { AUTH_PROVIDERS } from '@/lib/constants';

export function AuthButton() {
  const handleSignIn = async () => {
    await signIn.social({
      provider: AUTH_PROVIDERS.GITHUB,
      callbackURL: '/projects',
    });
  };

  return (
    <Button onClick={handleSignIn} size="lg" className="gap-2">
      <Github className="h-5 w-5" />
      Continue with GitHub
    </Button>
  );
}
