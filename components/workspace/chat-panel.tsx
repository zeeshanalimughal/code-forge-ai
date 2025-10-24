'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Sparkles, ArrowLeft, FileCode, CheckCircle2, FilePlus, FileEdit } from 'lucide-react';
import { useChat } from 'ai/react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

interface ChatPanelProps {
  projectId: string;
  projectName: string;
  projectDescription?: string;
  onFilesUpdate: (files: any[]) => void;
}

interface Message {
  id: string;
  role: string;
  content: string;
}

export function ChatPanel({ projectId, projectName, projectDescription, onFilesUpdate }: ChatPanelProps) {
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [processedBlocks, setProcessedBlocks] = useState<Set<string>>(new Set());
  const [existingFiles, setExistingFiles] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/ai/chat',
    body: { projectId },
  });

  useEffect(() => {
    // Load chat history and existing files
    const loadHistory = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/messages`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.data.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
          })));
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    const loadExistingFiles = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/files`);
        if (response.ok) {
          const result = await response.json();
          // Handle response structure: { success: true, data: [...] }
          const files = result.data || [];
          
          if (Array.isArray(files) && files.length > 0) {
            const filePaths = new Set<string>(files.map((f: any) => f.path as string));
            setExistingFiles(filePaths);
          } else {
            // New project with no files
            setExistingFiles(new Set<string>());
          }
        }
      } catch (error) {
        console.error('Failed to load existing files:', error);
        // Set empty on error to prevent crashes
        setExistingFiles(new Set<string>());
      }
    };

    loadHistory();
    loadExistingFiles();
  }, [projectId, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getLanguageFromPath = (path: string) => {
    const ext = path.split('.').pop();
    const langMap: Record<string, string> = {
      tsx: 'typescript',
      ts: 'typescript',
      jsx: 'javascript',
      js: 'javascript',
      css: 'css',
      html: 'html',
      json: 'json',
      md: 'markdown',
    };
    return langMap[ext || ''] || 'typescript';
  };

  const saveFiles = useCallback(async (codeBlocks: any[]) => {
    if (codeBlocks.length === 0) return;
    
    try {
      const response = await fetch(`/api/projects/${projectId}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: codeBlocks }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Handle response structure: { success: true, data: { files: [...] } }
        const savedFiles = result.data?.files || result.data || [];
        
        if (savedFiles.length > 0) {
          onFilesUpdate(savedFiles);
          
          // Update existing files tracking
          setExistingFiles(prev => {
            const updated = new Set(prev);
            savedFiles.forEach((file: any) => updated.add(file.path));
            return updated;
          });
        }
      } else {
        // Removed console.error
      }
    } catch (error) {
      // Removed console.error
      console.error('Error saving files:', error);
    }
  }, [projectId, onFilesUpdate]);

  const extractCodeBlocks = useCallback((content: string) => {
    const blocks = [];
    
    // First try: Match format with filename: prefix
    const filenameRegex = /```filename:\s*([^\n]+)\n([\s\S]*?)```/gi;
    let match;
    
    while ((match = filenameRegex.exec(content)) !== null) {
      const [, filename, code] = match;
      if (filename && code) {
        blocks.push({
          path: filename.trim(),
          content: code.trim(),
        });
      }
    }

    // Second try: If no filename blocks found, extract any code blocks and auto-generate filenames
    if (blocks.length === 0) {
      const anyCodeRegex = /```(\w+)?\n?([\s\S]*?)```/g;
      const usedNames = new Set<string>();
      
      while ((match = anyCodeRegex.exec(content)) !== null) {
        const [, language, code] = match;
        if (code && code.trim()) {
          // Try to extract component name from code
          const componentMatch = code.match(/function\s+(\w+)/);
          let filename = 'App.tsx';
          
          if (componentMatch && componentMatch[1]) {
            // Use the component name as filename
            const componentName = componentMatch[1];
            filename = `${componentName}.tsx`;
          } else if (language) {
            const langLower = language.toLowerCase();
            if (langLower === 'html') filename = 'index.html';
            else if (langLower === 'css') filename = 'styles.css';
            else if (langLower === 'javascript' || langLower === 'js') filename = 'Component.jsx';
            else if (langLower === 'typescript' || langLower === 'tsx') filename = 'Component.tsx';
            else if (langLower === 'json') filename = 'data.json';
          }
          
          // Ensure unique filenames
          let finalFilename = filename;
          let counter = 1;
          while (usedNames.has(finalFilename)) {
            const ext = filename.split('.').pop();
            const name = filename.replace(`.${ext}`, '');
            finalFilename = `${name}${counter}.${ext}`;
            counter++;
          }
          
          usedNames.add(finalFilename);
          blocks.push({
            path: finalFilename,
            content: code.trim(),
          });
        }
      }
      
    }

    return blocks;
  }, []);

  // Real-time file extraction as AI streams - optimized with useMemo
  const lastMessage = useMemo(() => 
    messages[messages.length - 1], 
    [messages]
  );

  useEffect(() => {
    if (!lastMessage || lastMessage.role !== 'assistant') return;

    const codeBlocks = extractCodeBlocks(lastMessage.content);
    
    // Save files as they appear in the stream
    const processBlocks = async () => {
      for (const block of codeBlocks) {
        const blockId = `${block.path}-${block.content.length}`;
        if (!processedBlocks.has(blockId)) {
          setProcessedBlocks(prev => new Set(prev).add(blockId));
          await saveFiles([block]);
        }
      }
    };
    
    processBlocks();
  }, [lastMessage, processedBlocks, saveFiles, extractCodeBlocks]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    handleSubmit(e);
  };

  if (isLoadingHistory) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderMessage = (content: string, isUser: boolean) => {
    if (isUser) {
      return <div className="text-sm whitespace-pre-wrap">{content}</div>;
    }

    // For AI messages, render markdown and show file creation progress
    const hasCode = content.includes('```');
    
    if (hasCode) {
      // Extract code blocks to show file creation
      const codeBlocks = extractCodeBlocks(content);
      
      // Remove ALL code blocks from content for markdown rendering (hide code)
      let textContent = content;
      
      // Remove all types of code blocks
      textContent = textContent.replace(/```filename:[\s\S]*?```/g, '');
      textContent = textContent.replace(/```[a-zA-Z]*\n[\s\S]*?```/g, '');
      textContent = textContent.replace(/```[\s\S]*?```/g, '');
      textContent = textContent.trim();
      
      return (
        <div className="space-y-3">
          {/* Render markdown content */}
          {textContent && (
            <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-xl font-bold mb-3 mt-4 text-foreground">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-bold mb-2.5 mt-3.5 text-foreground">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-semibold mb-2 mt-3 text-foreground">{children}</h3>,
                  h4: ({ children }) => <h4 className="text-sm font-semibold mb-2 mt-2.5 text-foreground">{children}</h4>,
                  ul: ({ children }) => <ul className="list-disc list-outside ml-5 space-y-1.5 my-3">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-outside ml-5 space-y-1.5 my-3">{children}</ol>,
                  li: ({ children }) => <li className="text-sm leading-relaxed pl-1">{children}</li>,
                  p: ({ children }) => <p className="my-2.5 leading-relaxed text-sm">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                  em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
                  blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/40 pl-4 my-3 italic text-muted-foreground">{children}</blockquote>,
                  hr: () => <hr className="my-4 border-border" />,
                  code: () => null, // Hide all inline code
                  pre: () => null, // Hide all code blocks
                }}
              >
                {textContent}
              </ReactMarkdown>
            </div>
          )}
          
          {/* Show file creation/update progress */}
          {codeBlocks.length > 0 && (
            <div className="space-y-1.5 bg-muted/30 rounded-lg p-3 border border-border/50">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                <FileCode className="h-3.5 w-3.5" />
                <span>
                  {codeBlocks.filter(b => !existingFiles.has(b.path)).length > 0 && 
                    `${codeBlocks.filter(b => !existingFiles.has(b.path)).length} new`}
                  {codeBlocks.filter(b => !existingFiles.has(b.path)).length > 0 && 
                   codeBlocks.filter(b => existingFiles.has(b.path)).length > 0 && ', '}
                  {codeBlocks.filter(b => existingFiles.has(b.path)).length > 0 && 
                    `${codeBlocks.filter(b => existingFiles.has(b.path)).length} updated`}
                </span>
              </div>
              {codeBlocks.map((block, index) => {
                const isNew = !existingFiles.has(block.path);
                return (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    {isNew ? (
                      <FilePlus className="h-3 w-3 text-green-500 shrink-0" />
                    ) : (
                      <FileEdit className="h-3 w-3 text-blue-500 shrink-0" />
                    )}
                    <code className="font-mono text-muted-foreground">{block.path}</code>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {isNew ? 'new' : 'updated'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // Regular text message with markdown
    return (
      <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 className="text-xl font-bold mb-3 mt-4 text-foreground">{children}</h1>,
            h2: ({ children }) => <h2 className="text-lg font-bold mb-2.5 mt-3.5 text-foreground">{children}</h2>,
            h3: ({ children }) => <h3 className="text-base font-semibold mb-2 mt-3 text-foreground">{children}</h3>,
            h4: ({ children }) => <h4 className="text-sm font-semibold mb-2 mt-2.5 text-foreground">{children}</h4>,
            ul: ({ children }) => <ul className="list-disc list-outside ml-5 space-y-1.5 my-3">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-outside ml-5 space-y-1.5 my-3">{children}</ol>,
            li: ({ children }) => <li className="text-sm leading-relaxed pl-1">{children}</li>,
            p: ({ children }) => <p className="my-2.5 leading-relaxed text-sm">{children}</p>,
            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
            em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
            blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/40 pl-4 my-3 italic text-muted-foreground">{children}</blockquote>,
            hr: () => <hr className="my-4 border-border" />,
            code: () => null, // Hide all inline code
            pre: () => null, // Hide all code blocks
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background/50">
      {/* Modern Chat Header with Project Info */}
      <div className="flex flex-col border-b bg-gradient-to-r from-blue-500/5 to-purple-500/5">
        {/* Top row: Back button and Project Info */}
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/projects">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2.5 flex-1">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{projectName}</div>
              {projectDescription && (
                <div className="text-[10px] text-muted-foreground truncate">{projectDescription}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-2xl opacity-20"></div>
              <div className="relative rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-600/10 p-6 mb-4 border border-blue-500/20">
                <Sparkles className="h-10 w-10 text-blue-600 mx-auto" />
              </div>
            </div>
            <h3 className="text-lg font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Start Building
            </h3>
            <p className="text-sm text-muted-foreground max-w-[250px] leading-relaxed">
              Describe what you want to build and I&apos;ll generate instant-preview code
            </p>
          </div>
        ) : (
          messages.map((message: Message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`rounded-2xl px-3.5 py-2 max-w-[90%] ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm'
                }`}
              >
                {renderMessage(message.content, message.role === 'user')}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-3.5 py-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">Generating...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Modern Input */}
      <div className="border-t p-3 bg-gradient-to-t from-background/80 to-background/40 backdrop-blur-xl">
        <form onSubmit={onSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Describe what you want to build..."
            className="min-h-[60px] max-h-[100px] resize-none text-sm bg-background/60 border-border/50 focus-visible:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e);
              }
            }}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input.trim()}
            className="h-[60px] w-11 shrink-0 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-[9px] text-muted-foreground/60 mt-1.5 text-center">
          ↵ Send • Shift+↵ New line
        </p>
      </div>
    </div>
  );
}
