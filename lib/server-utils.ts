import { headers } from 'next/headers';
import { auth } from './auth';

export async function getSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    return null;
  }
}

export async function requireAuth() {
  const session = await getSession();
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  
  return session;
}

export function createSuccessResponse<T>(data: T, status: number = 200) {
  return Response.json({ success: true, data }, { status });
}

export function createErrorResponse(message: string, status: number = 400) {
  return Response.json(
    { success: false, error: message },
    { status }
  );
}
