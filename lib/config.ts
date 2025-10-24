export const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'CodeForge AI',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  auth: {
    secret: process.env.BETTER_AUTH_SECRET,
    url: process.env.BETTER_AUTH_URL,
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
  },
  database: {
    uri: process.env.MONGODB_URI,
    name: process.env.MONGODB_DB_NAME || 'codeforge-ai',
  },
} as const;

// Validate required environment variables
export function validateConfig() {
  const required = [
    'MONGODB_URI',
    'BETTER_AUTH_SECRET',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file.'
    );
  }
}
