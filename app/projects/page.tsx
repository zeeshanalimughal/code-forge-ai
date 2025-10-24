'use client';

import { Plus, Folder, Calendar, MoreVertical, Trash2, Edit, Sparkles, Code2, Clock } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProjects } from '@/hooks/use-projects';
import { formatDate } from '@/lib/utils';
import { CreateProjectDialog } from '@/components/create-project-dialog';
import { useLateEffect } from '@/hooks/useLateEffect';

export default function ProjectsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { projects, isLoading, deleteProject, refetch } = useProjects();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await deleteProject(id);
      refetch();
    }
  };
useLateEffect(() => {
  if (!isCreateDialogOpen) refetch();
}, [isCreateDialogOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <Code2 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Projects</h1>
            </div>
            <p className="text-muted-foreground mt-2 text-lg">
              Build and manage your AI-powered applications
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            New Project
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse border-2">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full blur-2xl" />
                  <div className="relative rounded-full bg-gradient-to-br from-blue-600/10 to-purple-600/10 p-8">
                    <Sparkles className="h-16 w-16 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">Start Building with AI</h3>
                <p className="text-muted-foreground mb-8 max-w-md text-lg">
                  Create your first project and experience the power of AI-driven development.
                </p>
                <Button size="lg" onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create Your First Project
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className="group cursor-pointer border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300 overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div onClick={() => window.location.href = `/projects/${project.id}/workspace`} className="relative">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-md group-hover:from-blue-600/20 group-hover:to-purple-600/20 transition-colors">
                            <Code2 className="h-4 w-4 text-blue-600" />
                          </div>
                          <CardTitle className="line-clamp-1 text-lg">{project.name}</CardTitle>
                        </div>
                        <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                          {project.description || 'No description provided'}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(project.id);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{formatDate(project.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Open</span>
                        <span>→</span>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
