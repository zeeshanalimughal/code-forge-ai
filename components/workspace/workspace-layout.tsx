'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChatPanel } from './chat-panel';
import { PreviewPanel } from './preview-panel';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

interface WorkspaceLayoutProps {
  project: any;
}

export function WorkspaceLayout({ project }: WorkspaceLayoutProps) {
  const [files, setFiles] = useState<any[]>([]);

  // Load existing files on mount
  useEffect(() => {
    const loadFiles = async () => {
      try {
        const response = await fetch(`/api/projects/${project.id}/files`);
        if (response.ok) {
          const data = await response.json();
          setFiles(data.data || []);
        }
      } catch (error) {
        console.error('Failed to load files:', error);
      }
    };

    loadFiles();
  }, [project.id]);

  // Callback to update files - merges new files with existing ones
  const handleFilesUpdate = useCallback((newFiles: any[]) => {
    if (!newFiles || !Array.isArray(newFiles) || newFiles.length === 0) {
      return;
    }
    
    setFiles(currentFiles => {
      const fileMap = new Map(currentFiles.map(f => [f.path, f]));
      
      // Update or add new files
      newFiles.forEach(newFile => {
        fileMap.set(newFile.path, newFile);
      });
      
      return Array.from(fileMap.values());
    });
  }, []);

  return (
    <div className="h-[calc(100vh-4.3rem)] w-screen overflow-hidden bg-gradient-to-br from-background to-muted/20">
      {/* Resizable Panels - Full Screen */}
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Chat Panel - Resizable */}
        <ResizablePanel defaultSize={28} minSize={20} maxSize={40}>
          <ChatPanel 
            projectId={project.id} 
            projectName={project.name}
            projectDescription={project.description}
            onFilesUpdate={handleFilesUpdate} 
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Preview Panel - Resizable */}
        <ResizablePanel defaultSize={72} minSize={60}>
          <PreviewPanel files={files} projectId={project.id} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
