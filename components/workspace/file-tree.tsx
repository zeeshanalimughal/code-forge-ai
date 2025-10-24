'use client';

import { File, Folder, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FileTreeProps {
  files: any[];
  selectedFile: any | null;
  onFileSelect: (file: any) => void;
  onFileDelete: (file: any) => void;
}

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
  file?: any;
}

export function FileTree({ files, selectedFile, onFileSelect, onFileDelete }: FileTreeProps) {
  // Build tree structure from flat file list
  const buildTree = (files: any[]): TreeNode[] => {
    const root: TreeNode[] = [];
    const folders = new Map<string, TreeNode>();

    files.forEach((file) => {
      const parts = file.path.split('/');
      let currentPath = '';

      parts.forEach((part: string, index: number) => {
        const isLast = index === parts.length - 1;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (isLast) {
          // It's a file
          const fileNode: TreeNode = {
            name: part,
            path: currentPath,
            type: 'file',
            file,
          };

          if (parts.length === 1) {
            root.push(fileNode);
          } else {
            const parentPath = parts.slice(0, -1).join('/');
            const parent = folders.get(parentPath);
            if (parent) {
              parent.children = parent.children || [];
              parent.children.push(fileNode);
            }
          }
        } else {
          // It's a folder
          if (!folders.has(currentPath)) {
            const folderNode: TreeNode = {
              name: part,
              path: currentPath,
              type: 'folder',
              children: [],
            };

            folders.set(currentPath, folderNode);

            if (index === 0) {
              root.push(folderNode);
            } else {
              const parentPath = parts.slice(0, index).join('/');
              const parent = folders.get(parentPath);
              if (parent) {
                parent.children = parent.children || [];
                parent.children.push(folderNode);
              }
            }
          }
        }
      });
    });

    return root;
  };

  const tree = buildTree(files);

  const TreeItem = ({ node }: { node: TreeNode }) => {
    if (node.type === 'file') {
      const isSelected = selectedFile?.path === node.file.path;

      return (
        <div
          className={`flex items-center gap-2 px-2 py-1 text-sm cursor-pointer hover:bg-accent rounded-sm ${
            isSelected ? 'bg-accent' : ''
          }`}
          onClick={() => onFileSelect(node.file)}
        >
          <File className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1 truncate">{node.name}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileDelete(node.file);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-center gap-2 px-2 py-1 text-sm">
          <Folder className="h-4 w-4 flex-shrink-0" />
          <span className="font-medium">{node.name}</span>
        </div>
        <div className="ml-4">
          {node.children?.map((child, index) => (
            <TreeItem key={index} node={child} />
          ))}
        </div>
      </div>
    );
  };

  if (files.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground text-center">
        No files yet. Create one to get started.
      </div>
    );
  }

  return (
    <div className="p-2 space-y-1">
      {tree.map((node, index) => (
        <TreeItem key={index} node={node} />
      ))}
    </div>
  );
}
