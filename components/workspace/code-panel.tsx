'use client';

import { useState, useEffect } from 'react';
import { FileTree } from './file-tree';
import { CodeEditor } from './code-editor';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';

interface CodePanelProps {
  projectId: string;
  files: any[];
  setFiles: (files: any[]) => void;
  selectedFile: any | null;
  setSelectedFile: (file: any | null) => void;
}

export function CodePanel({
  projectId,
  files,
  setFiles,
  selectedFile,
  setSelectedFile,
}: CodePanelProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/files`);
        if (response.ok) {
          const data = await response.json();
          setFiles(data.data);
          if (data.data.length > 0 && !selectedFile) {
            setSelectedFile(data.data[0]);
          }
        }
      } catch (error) {
        console.error('Failed to load files:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFiles();
  }, [projectId, setFiles, selectedFile, setSelectedFile]);

  const handleFileSelect = (file: any) => {
    setSelectedFile(file);
  };

  const handleFileCreate = async () => {
    const fileName = prompt('Enter file name (e.g., components/Button.tsx):');
    if (!fileName) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: fileName,
          content: '',
          language: 'typescript',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newFiles = [...files, data.data];
        setFiles(newFiles);
        setSelectedFile(data.data);
      }
    } catch (error) {
      console.error('Failed to create file:', error);
    }
  };

  const handleFileUpdate = async (content: string) => {
    if (!selectedFile) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: selectedFile.path,
          content,
          language: selectedFile.language,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedFiles = files.map((f) =>
          f.path === selectedFile.path ? data.data : f
        );
        setFiles(updatedFiles);
        setSelectedFile(data.data);
      }
    } catch (error) {
      console.error('Failed to update file:', error);
    }
  };

  const handleFileDelete = async (file: any) => {
    if (!confirm(`Delete ${file.path}?`)) return;

    try {
      const response = await fetch(
        `/api/projects/${projectId}/files?path=${encodeURIComponent(file.path)}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        const updatedFiles = files.filter((f) => f.path !== file.path);
        setFiles(updatedFiles);
        if (selectedFile?.path === file.path) {
          setSelectedFile(updatedFiles[0] || null);
        }
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* File Tree */}
      <div className="w-64 border-r flex flex-col">
        <div className="flex items-center justify-between p-2 border-b">
          <span className="text-sm font-medium">Files</span>
          <Button size="icon" variant="ghost" onClick={handleFileCreate}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <FileTree
            files={files}
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            onFileDelete={handleFileDelete}
          />
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1">
        {selectedFile ? (
          <CodeEditor
            file={selectedFile}
            onSave={handleFileUpdate}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <p className="mb-2">No file selected</p>
              <Button onClick={handleFileCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create File
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
