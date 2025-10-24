'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { AuthProvider } from './auth-provider';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </NextThemesProvider>
  );
}
