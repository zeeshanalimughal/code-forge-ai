'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2, ExternalLink, Code2, Eye, Download, Save, ChevronRight, ChevronDown, File, Folder } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';

interface PreviewPanelProps {
  files: any[];
  projectId?: string;
}

export function PreviewPanel({ files, projectId }: PreviewPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [liveFiles, setLiveFiles] = useState<any[]>(files);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previousUrlRef = useRef<string>('');
  const { theme } = useTheme();

  // Build folder tree structure
  const buildFileTree = (files: any[]) => {
    const tree: any = { folders: {}, files: [] };
    
    files.forEach(file => {
      const parts = file.path.split('/');
      if (parts.length === 1) {
        tree.files.push(file);
      } else {
        let current = tree;
        for (let i = 0; i < parts.length - 1; i++) {
          const folderName = parts[i];
          if (!current.folders[folderName]) {
            current.folders[folderName] = { folders: {}, files: [] };
          }
          current = current.folders[folderName];
        }
        current.files.push(file);
      }
    });
    
    return tree;
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileTree = (tree: any, basePath = '') => {
    const folders = Object.keys(tree.folders).sort();
    const files = tree.files.sort((a: any, b: any) => a.path.localeCompare(b.path));

    return (
      <>
        {folders.map(folderName => {
          const folderPath = basePath ? `${basePath}/${folderName}` : folderName;
          const isExpanded = expandedFolders.has(folderPath);
          
          return (
            <div key={folderPath}>
              <button
                onClick={() => toggleFolder(folderPath)}
                className="w-full text-left px-2 py-1 text-xs rounded hover:bg-accent transition-colors flex items-center gap-1"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-3 w-3 flex-shrink-0" />
                )}
                <Folder className="h-3 w-3 flex-shrink-0 text-blue-500" />
                <span className="truncate">{folderName}</span>
              </button>
              {isExpanded && (
                <div className="ml-4 border-l border-border/50">
                  {renderFileTree(tree.folders[folderName], folderPath)}
                </div>
              )}
            </div>
          );
        })}
        {files.map((file: any) => (
          <button
            key={file.path}
            onClick={() => setSelectedFile(file)}
            className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-accent transition-colors flex items-center gap-1 ${
              selectedFile?.path === file.path ? 'bg-accent font-medium' : ''
            }`}
          >
            <div className="w-3" />
            <File className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
            <span className="truncate font-mono">{file.path.split('/').pop()}</span>
          </button>
        ))}
      </>
    );
  };

  // Update live files when base files change
  useEffect(() => {
    setLiveFiles(files);
  }, [files]);

  // Update edited content when selected file changes
  useEffect(() => {
    if (selectedFile) {
      setEditedContent(selectedFile.content);
      setHasChanges(false);
    }
  }, [selectedFile]);

  // Auto-select first file when files change
  useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      setSelectedFile(files[0]);
    } else if (files.length === 0) {
      setSelectedFile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files.length]); // Only depend on files.length to avoid cascading renders

  useEffect(() => {
    const generatePreview = async () => {
      if (liveFiles.length === 0) {
        setPreviewUrl('');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError('');

      try {
        // Find HTML file or create a basic HTML structure
        const htmlFile = liveFiles.find((f) => f.path.endsWith('.html'));
        let htmlContent = '';

        if (htmlFile) {
          htmlContent = htmlFile.content;
        } else {
          // Generate basic HTML with React app
          const jsxFiles = liveFiles.filter((f) => 
            f.path.endsWith('.tsx') || 
            f.path.endsWith('.jsx') || 
            f.path.endsWith('.ts') || 
            f.path.endsWith('.js')
          );
          const cssFiles = liveFiles.filter((f) => f.path.endsWith('.css'));
          
          // Combine all JSX/JS content
          const jsContent = jsxFiles.map(f => {
            let content = f.content;
            // Remove import statements as they won't work in browser
            content = content.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '');
            content = content.replace(/export\s+default\s+/g, '');
            content = content.replace(/export\s+/g, '');
            return content;
          }).join('\n\n');
          
          htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone@7/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  ${cssFiles.map(f => `<style>${f.content}</style>`).join('\n')}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef } = React;
    
    // Simple hash-based router hook
    function useHashRoute() {
      const [route, setRoute] = useState(window.location.hash.slice(1) || '/');
      
      useEffect(() => {
        const handleHashChange = () => {
          setRoute(window.location.hash.slice(1) || '/');
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
      }, []);
      
      return route;
    }
    
    // Link component for navigation
    function Link({ to, children, className, ...props }) {
      return (
        <a 
          href={'#' + to} 
          className={className}
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = to;
          }}
          {...props}
        >
          {children}
        </a>
      );
    }
    
    // Navigate function
    function useNavigate() {
      return (path) => {
        window.location.hash = path;
      };
    }
    
    ${jsContent}
    
    // Router wrapper component
    function AppWithRouter() {
      const route = useHashRoute();
      
      // Route matching
      if (route === '/login' && typeof LoginPage !== 'undefined') {
        return <LoginPage />;
      }
      if (route === '/about' && typeof About !== 'undefined') {
        return <About />;
      }
      if (route === '/contact' && typeof Contact !== 'undefined') {
        return <Contact />;
      }
      if (route === '/signup' && typeof SignupPage !== 'undefined') {
        return <SignupPage />;
      }
      
      // Default to App or home
      return typeof App !== 'undefined' ? <App /> : <div>No route found</div>;
    }
    
    // Auto-render
    const rootElement = document.getElementById('root');
    const root = ReactDOM.createRoot(rootElement);
    
    if (typeof App !== 'undefined') {
      // Check if we have page components
      const hasPages = typeof LoginPage !== 'undefined' || typeof About !== 'undefined' || typeof Contact !== 'undefined' || typeof SignupPage !== 'undefined';
      
      if (hasPages) {
        // Multi-page app with routing
        root.render(<AppWithRouter />);
      } else {
        // Single page app
        root.render(<App />);
      }
    } else if (typeof Home !== 'undefined') {
      root.render(<Home />);
    } else if (typeof Main !== 'undefined') {
      root.render(<Main />);
    } else {
      root.render(<div style={{ padding: '20px', textAlign: 'center' }}>No main component found. Please create an App, Home, or Main component.</div>);
    }
  </script>
</body>
</html>
          `;
        }

        // Create blob URL for preview
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        // Clean up old URL
        if (previousUrlRef.current) {
          URL.revokeObjectURL(previousUrlRef.current);
        }
        
        previousUrlRef.current = url;
        setPreviewUrl(url);
        console.log('Preview URL generated successfully:', url);
        setIsLoading(false);
      } catch (err) {
        console.error('Preview generation error:', err);
        setError('Failed to generate preview');
        setIsLoading(false);
      }
    };

    generatePreview();

    // Cleanup on unmount
    return () => {
      if (previousUrlRef.current) {
        URL.revokeObjectURL(previousUrlRef.current);
      }
    };
  }, [liveFiles, refreshTrigger]);

  const handleRefresh = () => {
    // Trigger preview regeneration without page reload
    setRefreshTrigger(prev => prev + 1);
  };

  const handleOpenExternal = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const handleExportZip = async () => {
    if (files.length === 0) return;

    try {
      // Dynamically import JSZip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Add all files to zip
      files.forEach(file => {
        zip.file(file.path, file.content);
      });

      // Generate zip file
      const blob = await zip.generateAsync({ type: 'blob' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'project-files.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export ZIP:', error);
      alert('Failed to export files. Please try again.');
    }
  };

  const handleSaveCode = async () => {
    if (!selectedFile || !projectId || !hasChanges) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: selectedFile.path,
          content: editedContent,
          language: selectedFile.language,
        }),
      });

      if (response.ok) {
        // Update the file in both local and live state
        selectedFile.content = editedContent;
        setHasChanges(false);
        
        // Update the base files array through parent
        const updatedFiles = files.map(f => 
          f.path === selectedFile.path 
            ? { ...f, content: editedContent }
            : f
        );
        setLiveFiles(updatedFiles);
      } else {
        alert('Failed to save file');
      }
    } catch (error) {
      alert('Failed to save file');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCodeChange = (newContent: string | undefined) => {
    if (newContent === undefined) return;
    
    setEditedContent(newContent);
    setHasChanges(newContent !== selectedFile?.content);
    
    // Update live preview without saving
    if (selectedFile) {
      const updatedFiles = liveFiles.map(f => 
        f.path === selectedFile.path 
          ? { ...f, content: newContent }
          : f
      );
      setLiveFiles(updatedFiles);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background/50">
      {/* Modern Preview Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-green-500/5 to-emerald-500/5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/50 animate-pulse"></div>
            <span className="text-sm font-semibold">Live Preview</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            size="sm" 
            variant={viewMode === 'preview' ? 'default' : 'ghost'}
            onClick={() => setViewMode('preview')}
            disabled={files.length === 0}
            className="h-7 px-2 text-xs"
          >
            <Eye className="h-3 w-3" />
            Preview
          </Button>
          <Button 
            size="sm" 
            variant={viewMode === 'code' ? 'default' : 'ghost'}
            onClick={() => setViewMode('code')}
            disabled={files.length === 0}
            className="h-7 px-2 text-xs"
          >
            <Code2 className="h-3 w-3" />
            Code
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          {viewMode === 'code' && hasChanges && (
            <Button 
              size="sm" 
              variant="default"
              onClick={handleSaveCode}
              disabled={isSaving}
              className="h-7 px-2 text-xs"
            >
              {isSaving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Save className="h-3 w-3" />
              )}
              Save
            </Button>
          )}
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleRefresh}
            disabled={files.length === 0 || viewMode === 'code'}
            className="h-7 px-2 text-xs hover:bg-green-500/10"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleOpenExternal} 
            disabled={!previewUrl || viewMode === 'code'}
            className="h-7 px-2 text-xs hover:bg-green-500/10"
          >
            <ExternalLink className="h-3 w-3" />
            Open
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleExportZip}
            disabled={files.length === 0}
            className="h-7 px-2 text-xs hover:bg-green-500/10"
          >
            <Download className="h-3 w-3" />
            Export ZIP
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {viewMode === 'code' ? (
          <div className="h-full flex">
            {/* File Tree */}
            <div className="w-64 border-r bg-background overflow-y-auto">
              <div className="p-2">
                <div className="text-[10px] font-semibold text-muted-foreground px-2 py-2 uppercase tracking-wider">
                  Explorer ({files.length} files)
                </div>
                <div className="space-y-0.5">
                  {renderFileTree(buildFileTree(files))}
                </div>
              </div>
            </div>
            {/* Code Editor */}
            <div className="flex-1 flex flex-col" style={{ backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff' }}>
              {selectedFile ? (
                <>
                  <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
                    <div className="text-xs text-muted-foreground font-mono">{selectedFile.path}</div>
                    {hasChanges && (
                      <span className="text-xs text-orange-500">● Unsaved changes</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <Editor
                      height="100%"
                      language={selectedFile.path.endsWith('.tsx') || selectedFile.path.endsWith('.ts') ? 'typescript' : 
                               selectedFile.path.endsWith('.jsx') || selectedFile.path.endsWith('.js') ? 'javascript' :
                               selectedFile.path.endsWith('.css') ? 'css' :
                               selectedFile.path.endsWith('.html') ? 'html' : 'typescript'}
                      value={editedContent}
                      onChange={handleCodeChange}
                      theme={theme === 'dark' ? 'vs-dark' : 'light'}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        wordWrap: 'on',
                        padding: { top: 16, bottom: 16 },
                      }}
                      beforeMount={(monaco) => {
                        // Disable ALL validation for TypeScript/JavaScript to remove red squiggles
                        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                          noSemanticValidation: true,
                          noSyntaxValidation: true, // Disable syntax validation too
                          noSuggestionDiagnostics: true,
                        });
                        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                          noSemanticValidation: true,
                          noSyntaxValidation: true, // Disable syntax validation too
                          noSuggestionDiagnostics: true,
                        });
                        
                        // Configure compiler options for JSX
                        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                          jsx: monaco.languages.typescript.JsxEmit.React,
                          jsxFactory: 'React.createElement',
                          reactNamespace: 'React',
                          allowNonTsExtensions: true,
                          allowJs: true,
                          checkJs: false,
                          target: monaco.languages.typescript.ScriptTarget.Latest,
                          module: monaco.languages.typescript.ModuleKind.ESNext,
                          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                          noLib: true,
                          lib: [],
                        });
                        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                          jsx: monaco.languages.typescript.JsxEmit.React,
                          jsxFactory: 'React.createElement',
                          reactNamespace: 'React',
                          allowNonTsExtensions: true,
                          allowJs: true,
                          checkJs: false,
                          target: monaco.languages.typescript.ScriptTarget.Latest,
                          module: monaco.languages.typescript.ModuleKind.ESNext,
                          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                          noLib: true,
                          lib: [],
                        });
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select a file to edit
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full bg-white overflow-auto">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Spinning up preview...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-destructive mb-2">{error}</p>
              <Button onClick={handleRefresh}>Try Again</Button>
            </div>
          </div>
        ) : files.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <div className="text-center max-w-sm">
              <p className="mb-2">No files to preview yet</p>
              <p className="text-sm">
                Chat with AI to generate code or create files manually
              </p>
            </div>
          </div>
        ) : previewUrl ? (
          <iframe
            ref={iframeRef}
            src={previewUrl}
            className="w-full h-full border-0 min-h-full"
            title="Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
