import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { requireAuth, createSuccessResponse, createErrorResponse } from '@/lib/server-utils';
import { db } from '@/lib/db/models';
import { projectSchema } from '@/lib/validations';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return createErrorResponse('Invalid project ID', 400);
    }

    const projectsCollection = await db.projects();
    const project = await projectsCollection.findOne({
      _id: new ObjectId(id) as any,
      userId: session.user.id,
    });

    if (!project) {
      return createErrorResponse('Project not found', 404);
    }

    // Map _id to id for frontend compatibility
    const mappedProject = {
      ...project,
      id: project._id?.toString(),
      _id: undefined,
    };

    return createSuccessResponse(mappedProject);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return createErrorResponse('Unauthorized', 401);
    }
    return createErrorResponse('Failed to fetch project', 500);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    
    if (!ObjectId.isValid(id)) {
      return createErrorResponse('Invalid project ID', 400);
    }

    const validation = projectSchema.safeParse(body);
    if (!validation.success) {
      return createErrorResponse('Invalid project data', 400);
    }

    const projectsCollection = await db.projects();
    const result = await projectsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) as any, userId: session.user.id },
      { 
        $set: { 
          ...validation.data,
          updatedAt: new Date(),
        } 
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return createErrorResponse('Project not found', 404);
    }

    // Map _id to id for frontend compatibility
    const mappedProject = {
      ...result,
      id: result._id?.toString(),
      _id: undefined,
    };

    return createSuccessResponse(mappedProject);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return createErrorResponse('Unauthorized', 401);
    }
    return createErrorResponse('Failed to update project', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return createErrorResponse('Invalid project ID', 400);
    }

    const projectsCollection = await db.projects();
    const result = await projectsCollection.deleteOne({
      _id: new ObjectId(id) as any,
      userId: session.user.id,
    });

    if (result.deletedCount === 0) {
      return createErrorResponse('Project not found', 404);
    }

    return createSuccessResponse({ deleted: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return createErrorResponse('Unauthorized', 401);
    }
    return createErrorResponse('Failed to delete project', 500);
  }
}
