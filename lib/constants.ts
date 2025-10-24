export const APP_NAME = 'CodeForge AI';
export const APP_DESCRIPTION = 'Build beautiful applications 10x faster with AI-powered code generation';

export const ROUTES = {
  HOME: '/',
  PROJECTS: '/projects',
  SETTINGS: '/settings',
  API: {
    AUTH: '/api/auth',
  },
} as const;

export const AUTH_PROVIDERS = {
  GITHUB: 'github',
} as const;

export const SESSION_COOKIE_NAME = 'codeforge_session';
