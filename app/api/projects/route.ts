import { NextRequest } from 'next/server';
import { requireAuth, createSuccessResponse, createErrorResponse } from '@/lib/server-utils';
import { db } from '@/lib/db/models';
import { projectSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const projectsCollection = await db.projects();
    
    const projects = await projectsCollection
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    // Map _id to id for frontend compatibility
    const mappedProjects = projects.map(project => ({
      ...project,
      id: project._id?.toString(),
      _id: undefined,
    }));

    return createSuccessResponse(mappedProjects);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return createErrorResponse('Unauthorized', 401);
    }
    console.error('Failed to fetch projects:', error);
    return createErrorResponse('Failed to fetch projects', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    
    const validation = projectSchema.safeParse(body);
    if (!validation.success) {
      return createErrorResponse('Invalid project data', 400);
    }

    const projectsCollection = await db.projects();
    const now = new Date();
    
    const project = {
      ...validation.data,
      userId: session.user.id,
      createdAt: now,
      updatedAt: now,
    };

    const result = await projectsCollection.insertOne(project);
    
    return createSuccessResponse(
      { ...project, id: result.insertedId.toString() },
      201
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return createErrorResponse('Unauthorized', 401);
    }
    return createErrorResponse('Failed to create project', 500);
  }
}
