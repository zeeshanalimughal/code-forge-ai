import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import type { Project } from '@/types';
import type { ProjectInput } from '@/lib/validations';
import { useMounted } from './use-mounted';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useMounted();
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<{ success: boolean; data: Project[] }>('/api/projects');
      setProjects(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch projects'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted) fetchProjects();
  }, [isMounted]);

  const createProject = async (data: ProjectInput): Promise<Project> => {
    const response = await apiClient.post<{ success: boolean; data: Project }>('/api/projects', data);
    setProjects((prev) => [response.data, ...prev]);
    return response.data;
  };

  const updateProject = async (id: string, data: ProjectInput): Promise<Project> => {
    const response = await apiClient.put<{ success: boolean; data: Project }>(`/api/projects/${id}`, data);
    setProjects((prev) => prev.map((p) => (p.id === id ? response.data : p)));
    return response.data;
  };

  const deleteProject = async (id: string): Promise<void> => {
    await apiClient.delete(`/api/projects/${id}`);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    projects,
    isLoading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}
