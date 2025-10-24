import type { Db, Collection, Document, ObjectId } from 'mongodb';
import { getDatabase } from '../mongodb';

export interface ProjectDocument extends Document {
  _id?: ObjectId;
  name: string;
  description?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserMetadataDocument extends Document {
  _id?: ObjectId;
  userId: string;
  bio?: string;
  website?: string;
  location?: string;
  updatedAt: Date;
}

export interface ProjectFileDocument extends Document {
  _id?: ObjectId;
  projectId: string;
  path: string;
  content: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessageDocument extends Document {
  _id?: ObjectId;
  projectId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

class DatabaseModels {
  private db: Db | null = null;

  private async getDb(): Promise<Db> {
    if (!this.db) {
      this.db = await getDatabase();
    }
    return this.db;
  }

  async projects(): Promise<Collection<ProjectDocument>> {
    const db = await this.getDb();
    return db.collection<ProjectDocument>('projects');
  }

  async userMetadata(): Promise<Collection<UserMetadataDocument>> {
    const db = await this.getDb();
    return db.collection<UserMetadataDocument>('userMetadata');
  }

  async projectFiles(): Promise<Collection<ProjectFileDocument>> {
    const db = await this.getDb();
    return db.collection<ProjectFileDocument>('projectFiles');
  }

  async chatMessages(): Promise<Collection<ChatMessageDocument>> {
    const db = await this.getDb();
    return db.collection<ChatMessageDocument>('chatMessages');
  }

  async ensureIndexes(): Promise<void> {
    const projectsCollection = await this.projects();
    await projectsCollection.createIndex({ userId: 1, createdAt: -1 });
    await projectsCollection.createIndex({ userId: 1, name: 1 });

    const userMetadataCollection = await this.userMetadata();
    await userMetadataCollection.createIndex({ userId: 1 }, { unique: true });

    const projectFilesCollection = await this.projectFiles();
    await projectFilesCollection.createIndex({ projectId: 1, path: 1 }, { unique: true });
    await projectFilesCollection.createIndex({ projectId: 1, updatedAt: -1 });

    const chatMessagesCollection = await this.chatMessages();
    await chatMessagesCollection.createIndex({ projectId: 1, createdAt: -1 });
  }
}

export const db = new DatabaseModels();
