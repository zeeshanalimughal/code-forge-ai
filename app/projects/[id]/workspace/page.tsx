'use client';

import { use, useState, useEffect } from 'react';
import { WorkspaceLayout } from '@/components/workspace/workspace-layout';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function WorkspacePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${resolvedParams.id}`);
        if (!response.ok) throw new Error('Failed to fetch project');
        const data = await response.json();
        setProject(data.data);
      } catch (error) {
        console.error('Error fetching project:', error);
        router.push('/projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [resolvedParams.id, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return <WorkspaceLayout project={project} />;
}
