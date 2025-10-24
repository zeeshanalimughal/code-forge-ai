import { NextRequest } from 'next/server';
import { requireAuth, createSuccessResponse, createErrorResponse } from '@/lib/server-utils';
import { db } from '@/lib/db/models';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id: projectId } = await params;
    
    const messagesCollection = await db.chatMessages();
    const messages = await messagesCollection
      .find({ projectId })
      .sort({ createdAt: 1 })
      .toArray();

    const mappedMessages = messages.map(msg => ({
      ...msg,
      id: msg._id?.toString(),
      _id: undefined,
    }));

    return createSuccessResponse(mappedMessages);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return createErrorResponse('Unauthorized', 401);
    }
    return createErrorResponse('Failed to fetch messages', 500);
  }
}
