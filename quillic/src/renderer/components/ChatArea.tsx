import { useState, useEffect, useRef, useCallback } from 'react';
import { Folder, FolderOpen, ArrowUp, CircleSquare, Paperclip, Globe, Terminal, Brain, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';
import IconBtn from './IconBtn';
import ModelDropdown from './ModelDropdown';
import MessageBubble from './MessageBubble';
import ProjectPicker from './ProjectPicker';
import SlashPicker from './SlashPicker';
import FileChip from './FileChip';
import TerminalPanel from './TerminalPanel';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@shared/types';

const GREETINGS = [
  'What do you want to build today?',
  'What can I help you code?',
  'What are we working on?',
  'Ready to build something.',
  "What's the task?",
  'How can I help your project?',
];

const PROMPTS = [
  'Build a REST API with authentication',
  'Explain this codebase',
  'Write unit tests',
  'Set up Docker + CI/CD',
  'Debug and fix this error',
  'Refactor for performance',
  'Create a CLI tool',
  'Design a database schema',
  'Add WebSocket support',
  'Generate TypeScript types from JSON',
  'Optimise this SQL query',
  'Add error handling and logging',
  'Set up Alembic migrations',
  'Create a React hook for data fetching',
  'Review code for security issues',
  'Write a GitHub Actions workflow',
  'Add pagination to this API',
  'Explain this regex pattern',
  'Convert this to async/await',
  'Write API documentation',
];

export default function ChatArea() {
  const {
    activeChatId,
    messages,
    setMessages,
    input,
    setInput,
    attachments,
    setAttachments,
    streaming,
    setStreaming,
    selectedModel,
    setSelectedModel,
    thinkMode,
    setThinkMode,
    webMode,
    setWebMode,
    projectPath,
    projectSelected,
    setProjectSelected,
    setProjectPath,
    openFile,
    setOpenFile,
    rightOpen,
    setRightOpen,
    terminalOpen,
    setTerminalOpen,
    terminalHeight,
    setTerminalHeight,
    slashOpen,
    setSlashOpen,
    slashQuery,
    setSlashQuery,
  } = useStore();

  const [greeting, setGreeting] = useState('');
  const [prompts, setPrompts] = useState<string[]>([]);
  const [resizingTerm, setResizingTerm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize greeting and prompts
  useEffect(() => {
    setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
    setPrompts([...PROMPTS].sort(() => Math.random() - 0.5).slice(0, 6));
  }, [activeChatId]);

  // Load messages when chat changes
  useEffect(() => {
    if (activeChatId) {
      loadMessages();
    }
  }, [activeChatId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'b') {
          e.preventDefault();
          // Toggle sidebar - handled by store
        }
        if (e.key === '`') {
          e.preventDefault();
          setTerminalOpen(!terminalOpen);
        }
        if (e.key === 'l') {
          e.preventDefault();
          // Toggle theme - handled by store
        }
        if (e.key === '/') {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
      if (e.key === 'Escape') {
        setSlashOpen(false);
        if (streaming) {
          abortStream();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [streaming, terminalOpen, setTerminalOpen]);

  const loadMessages = async () => {
    if (!activeChatId) return;

    try {
      const loadedMessages = await window.electronAPI.getMessages(activeChatId);
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const abortStream = useCallback(() => {
    window.electronAPI.abortAI();
    setStreaming(false);
  }, [setStreaming]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if ((!text && attachments.length === 0) || streaming || !activeChatId) return;

    // Create user message
    const userMessage: Message = {
      id: uuidv4(),
      chat_id: activeChatId,
      role: 'user',
      content: text,
      attached_files: attachments.length > 0 ? attachments : undefined,
      created_at: Date.now(),
    };

    // Save user message
    try {
      await window.electronAPI.saveMessage(userMessage);
      setMessages((prev) => [...prev, userMessage]);
    } catch (error) {
      console.error('Failed to save message:', error);
    }

    // Clear input
    setInput('');
    setAttachments([]);
    setSlashOpen(false);
    setStreaming(true);

    // Create assistant message placeholder
    const assistantMessage: Message = {
      id: uuidv4(),
      chat_id: activeChatId,
      role: 'assistant',
      content: '',
      created_at: Date.now(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    // Send to AI
    try {
      const allMessages = [...messages, userMessage];

      // Set up event listeners for streaming
      const handleToken = (token: string) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id ? { ...m, content: m.content + token } : m
          )
        );
      };

      const handleDone = async () => {
        setStreaming(false);

        // Save the complete assistant message
        const updatedMessages = await window.electronAPI.getMessages(activeChatId);
        setMessages(updatedMessages);

        // Update chat title if it's still "New conversation"
        const currentChat = await window.electronAPI.getChats().then((chats) =>
          chats.find((c: any) => c.id === activeChatId)
        );

        if (currentChat && currentChat.title === 'New conversation' && text) {
          const title = text.slice(0, 42) + (text.length > 42 ? '…' : '');
          await window.electronAPI.updateChat(activeChatId, { title });
        }

        // Clean up listeners
        window.electronAPI.removeAllListeners('ai:stream-token');
        window.electronAPI.removeAllListeners('ai:stream-done');
        window.electronAPI.removeAllListeners('ai:stream-error');
      };

      const handleError = (error: string) => {
        setStreaming(false);
        console.error('AI stream error:', error);

        // Clean up listeners
        window.electronAPI.removeAllListeners('ai:stream-token');
        window.electronAPI.removeAllListeners('ai:stream-done');
        window.electronAPI.removeAllListeners('ai:stream-error');
      };

      window.electronAPI.onAIStreamToken(handleToken);
      window.electronAPI.onAIStreamDone(handleDone);
      window.electronAPI.onAIStreamError(handleError);

      // Send message to AI
      await window.electronAPI.sendMessage(
        activeChatId,
        allMessages,
        selectedModel,
        'openrouter'
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      setStreaming(false);
    }
  }, [
    input,
    attachments,
    streaming,
    activeChatId,
    messages,
    selectedModel,
    setInput,
    setAttachments,
    setSlashOpen,
    setStreaming,
    setMessages,
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    if (value.startsWith('/')) {
      setSlashOpen(true);
      setSlashQuery(value.slice(1));
    } else {
      setSlashOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    if (e.key === 'Escape') {
      setSlashOpen(false);
    }
  };

  const handleAttach = async () => {
    try {
      const result = await window.electronAPI.openFile({
        filters: [
          { name: 'All Files', extensions: ['*'] },
          { name: 'Code Files', extensions: ['js', 'ts', 'tsx', 'jsx', 'py', 'rs', 'go', 'java', 'c', 'cpp', 'h', 'cs'] },
          { name: 'Text Files', extensions: ['txt', 'md', 'json', 'yaml', 'yml', 'xml', 'toml'] },
          { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'] },
        ],
      });

      if (result.canceled || result.filePaths.length === 0) return;

      const filePath = result.filePaths[0];
      const content = await window.electronAPI.readFile(filePath);
      const fileName = filePath.split(/[/\\]/).pop() || 'unknown';

      const ext = fileName.split('.').pop() || 'txt';

      setAttachments([
        ...attachments,
        {
          name: fileName,
          path: filePath,
          lang: ext,
          content,
        },
      ]);
    } catch (error) {
      console.error('Failed to attach file:', error);
    }
  };

  const handleSelectProject = async () => {
    try {
      const result = await window.electronAPI.openFolder();

      if (result.canceled || result.filePaths.length === 0) return;

      const folderPath = result.filePaths[0];
      setProjectPath(folderPath);
      setProjectSelected(true);

      // Update chat with project folder
      if (activeChatId) {
        await window.electronAPI.updateChat(activeChatId, { project_folder: folderPath });
      }
    } catch (error) {
      console.error('Failed to select project folder:', error);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const startResizeTerm = (e: React.MouseEvent) => {
    setResizingTerm(true);
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (resizingTerm) {
        const windowHeight = window.innerHeight;
        const newHeight = Math.max(80, Math.min(400, windowHeight - e.clientY));
        setTerminalHeight(newHeight);
      }
    };

    const onUp = () => {
      setResizingTerm(false);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [resizingTerm, setTerminalHeight]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* Topbar */}
      <div
        className="h-[46px] flex items-center px-3 gap-2 flex-shrink-0"
        style={{ background: 'var(--bg1)', borderBottom: '1px solid var(--bg5)' }}
      >
        <IconBtn icon={Folder} title="Toggle sidebar (Ctrl+B)" />
        <ModelDropdown />
        {projectSelected && projectPath && (
          <div
            className="flex items-center gap-1.5 h-7 px-2.5 rounded cursor-pointer"
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--bg5)',
              color: 'var(--mt)',
              fontSize: 11,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--ac)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--bg5)';
            }}
          >
            <Folder size={11} style={{ color: 'var(--ac)' }} />
            <span className="mono">{projectPath.split(/[/\\]/).pop()}</span>
          </div>
        )}
        <div className="flex-1" />
        {streaming && (
          <span
            className="text-xs flex items-center gap-1.5"
            style={{
              color: 'var(--mt)',
              animation: 'shimmer 1.4s ease-in-out infinite',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: 'var(--ac)',
                animation: 'pulse 1s ease-in-out infinite',
              }}
            />
            Generating…
          </span>
        )}
        <IconBtn icon={FolderOpen} title="Toggle file panel" active={rightOpen} />
      </div>

      {!projectSelected ? (
        <ProjectPicker onSelect={handleSelectProject} />
      ) : (
        <>
          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-9 py-7 flex flex-col gap-5"
            style={{ userSelect: 'text' }}
          >
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 mt-15">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: 'var(--ac-dim)',
                    border: '1px solid var(--ac-border)',
                    fontSize: 22,
                    fontWeight: 700,
                    color: 'var(--ac)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  Q
                </div>
                <div className="text-lg font-medium" style={{ color: 'var(--tx2)' }}>
                  {greeting}
                </div>
                <div className="flex gap-2 flex-wrap justify-center max-w-[460px]">
                  {prompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handlePromptClick(prompt)}
                      className="px-4 py-1.5 rounded-full text-sm cursor-pointer transition-all"
                      style={{
                        border: '1px solid var(--bg5)',
                        background: 'var(--bg2)',
                        color: 'var(--tx2)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--ac)';
                        e.currentTarget.style.color = 'var(--tx)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--bg5)';
                        e.currentTarget.style.color = 'var(--tx2)';
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onRegenerate={
                    idx === messages.length - 1 && msg.role === 'assistant' && !streaming
                      ? () => {}
                      : undefined
                  }
                  onOpenFile={(file) => {
                    setOpenFile(file);
                    setRightOpen(true);
                  }}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Slash picker */}
          {slashOpen && (
            <div className="px-4">
              <SlashPicker
                query={slashQuery}
                onSelect={(cmd) => {
                  setInput(cmd + ' ');
                  setSlashOpen(false);
                  inputRef.current?.focus();
                }}
              />
            </div>
          )}

          {/* Input area */}
          <div className="p-2 pb-3 flex-shrink-0">
            <div
              className="rounded overflow-visible transition-all"
              style={{
                background: 'var(--bg1)',
                border: '1px solid var(--bg5)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
              }}
            >
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 pt-2">
                  {attachments.map((file, i) => (
                    <FileChip
                      key={i}
                      file={file}
                      onClick={() => {
                        setOpenFile(file);
                        setRightOpen(true);
                      }}
                      onRemove={() => {
                        setAttachments(attachments.filter((_, j) => j !== i));
                      }}
                    />
                  ))}
                </div>
              )}

              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Message Quillic… or type / for commands"
                className="w-full bg-transparent border-none px-3.5 pt-2.5 pb-1 text-sm outline-none resize-none"
                style={{
                  color: 'var(--tx)',
                  lineHeight: 1.55,
                  height: 54,
                  maxHeight: 200,
                  overflowY: 'auto',
                }}
              />

              {/* Toolbar */}
              <div className="flex items-center gap-0.5 px-2 pb-2 pt-1 relative">
                <IconBtn icon={Paperclip} title="Attach file" onClick={handleAttach} />
                <IconBtn
                  icon={Globe}
                  title="Web search"
                  active={webMode}
                  onClick={() => setWebMode(!webMode)}
                />
                <IconBtn icon={FolderOpen} title="Set project folder" onClick={() => setProjectSelected(false)} />
                <div
                  className="w-px h-4 mx-1"
                  style={{ background: 'var(--bg5)' }}
                />
                <IconBtn
                  icon={Terminal}
                  title="Toggle terminal (Ctrl+`)"
                  active={terminalOpen}
                  onClick={() => setTerminalOpen(!terminalOpen)}
                />
                <IconBtn
                  icon={Brain}
                  title="Thinking mode"
                  active={thinkMode}
                  onClick={() => setThinkMode(!thinkMode)}
                />
                <IconBtn icon={Zap} title="Agent Mode (WIP)" onClick={() => {}} />

                {/* Send / Stop */}
                {streaming ? (
                  <button
                    onClick={abortStream}
                    className="ml-auto w-8 h-8 rounded flex items-center justify-center transition-all"
                    style={{
                      background: 'var(--bg5)',
                      color: 'var(--mt)',
                      border: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg6)';
                      e.currentTarget.style.color = 'var(--tx)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--bg5)';
                      e.currentTarget.style.color = 'var(--mt)';
                    }}
                  >
                    <CircleSquare size={15} />
                  </button>
                ) : (
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() && attachments.length === 0}
                    className="ml-auto w-8 h-8 rounded flex items-center justify-center transition-all"
                    style={{
                      background: input.trim() || attachments.length > 0 ? 'var(--ac)' : 'var(--bg4)',
                      color: input.trim() || attachments.length > 0 ? '#fff' : 'var(--mt)',
                      border: 'none',
                      cursor: input.trim() || attachments.length > 0 ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <ArrowUp size={15} />
                  </button>
                )}
              </div>
            </div>
            <div
              className="text-center text-xs mt-1.5"
              style={{ color: 'var(--bg6)' }}
            >
              Enter to send · Shift+Enter for newline · Ctrl+B sidebar · Ctrl+` terminal
            </div>
          </div>
        </>
      )}

      {/* Terminal */}
      {terminalOpen && projectSelected && (
        <>
          <div
            className="resize-handle-v"
            onMouseDown={startResizeTerm}
            style={{ height: 4, background: 'transparent', flexShrink: 0 }}
          />
          <TerminalPanel height={terminalHeight} />
        </>
      )}
    </div>
  );
}