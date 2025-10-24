import type { Session, User } from '@/lib/auth';

export type { Session, User };

export interface Project {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  bio?: string;
  website?: string;
  location?: string;
}
