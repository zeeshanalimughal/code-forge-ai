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
    
    const filesCollection = await db.projectFiles();
    const files = await filesCollection
      .find({ projectId })
      .sort({ path: 1 })
      .toArray();

    const mappedFiles = files.map(file => ({
      ...file,
      id: file._id?.toString(),
      _id: undefined,
    }));

    return createSuccessResponse(mappedFiles);
  } catch (error) {
    console.error('Failed to fetch files:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return createErrorResponse('Unauthorized', 401);
    }
    return createErrorResponse('Failed to fetch files', 500);
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id: projectId } = await params;
    const body = await request.json();
    
    // Handle both single file and bulk file saves
    const { path, content, language, files } = body;

    const filesCollection = await db.projectFiles();
    const now = new Date();
    
    // Bulk file save
    if (files && Array.isArray(files)) {
      const savePromises = files.map(async (file: any) => {
        return filesCollection.findOneAndUpdate(
          { projectId, path: file.path },
          {
            $set: {
              content: file.content,
              language: file.language || 'typescript',
              updatedAt: now,
            },
            $setOnInsert: {
              projectId,
              path: file.path,
              createdAt: now,
            },
          },
          { upsert: true, returnDocument: 'after' }
        );
      });

      const results = await Promise.all(savePromises);
      
      const mappedFiles = results.map(result => ({
        ...result,
        id: result?._id?.toString(),
        _id: undefined,
      }));

      return createSuccessResponse({ files: mappedFiles });
    }
    
    // Single file save
    if (!path || content === undefined) {
      return createErrorResponse('Path and content are required', 400);
    }

    const result = await filesCollection.findOneAndUpdate(
      { projectId, path },
      {
        $set: {
          content,
          language: language || 'typescript',
          updatedAt: now,
        },
        $setOnInsert: {
          projectId,
          path,
          createdAt: now,
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    const mappedFile = {
      ...result,
      id: result?._id?.toString(),
      _id: undefined,
    };

    return createSuccessResponse(mappedFile);
  } catch (error) {
    console.error('Failed to save file:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return createErrorResponse('Unauthorized', 401);
    }
    return createErrorResponse('Failed to save file', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return createErrorResponse('File path is required', 400);
    }

    const filesCollection = await db.projectFiles();
    const result = await filesCollection.deleteOne({ projectId, path });

    if (result.deletedCount === 0) {
      return createErrorResponse('File not found', 404);
    }

    return createSuccessResponse({ deleted: true });
  } catch (error) {
    console.error('Failed to delete file:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return createErrorResponse('Unauthorized', 401);
    }
    return createErrorResponse('Failed to delete file', 500);
  }
}
