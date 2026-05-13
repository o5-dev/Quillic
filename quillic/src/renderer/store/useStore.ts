import { create } from 'zustand';
import { Chat, Message, AttachedFile } from '@shared/types';

interface AppState {
  // Theme
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;

  // Layout
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  rightOpen: boolean;
  setRightOpen: (open: boolean) => void;
  rightTab: 'files' | 'git' | 'skills';
  setRightTab: (tab: 'files' | 'git' | 'skills') => void;
  terminalOpen: boolean;
  setTerminalOpen: (open: boolean) => void;

  // Panel sizes
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  rightWidth: number;
  setRightWidth: (width: number) => void;
  terminalHeight: number;
  setTerminalHeight: (height: number) => void;

  // Chats
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;

  // Input
  input: string;
  setInput: (input: string) => void;
  attachments: AttachedFile[];
  setAttachments: (files: AttachedFile[]) => void;
  addAttachment: (file: AttachedFile) => void;
  removeAttachment: (index: number) => void;

  // AI
  streaming: boolean;
  setStreaming: (streaming: boolean) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  thinkMode: boolean;
  setThinkMode: (enabled: boolean) => void;
  webMode: boolean;
  setWebMode: (enabled: boolean) => void;

  // Project
  projectPath: string | null;
  setProjectPath: (path: string | null) => void;
  projectSelected: boolean;
  setProjectSelected: (selected: boolean) => void;

  // File editor
  openFile: { name: string; path: string; content: string } | null;
  setOpenFile: (file: { name: string; path: string; content: string } | null) => void;

  // Modals
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  showWIP: string | null;
  setShowWIP: (title: string | null) => void;

  // Slash commands
  slashOpen: boolean;
  setSlashOpen: (open: boolean) => void;
  slashQuery: string;
  setSlashQuery: (query: string) => void;
}

export const useStore = create<AppState>((set) => ({
  // Theme
  theme: 'dark',
  setTheme: (theme) => set({ theme }),

  // Layout
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  rightOpen: true,
  setRightOpen: (open) => set({ rightOpen: open }),
  rightTab: 'files',
  setRightTab: (tab) => set({ rightTab: tab }),
  terminalOpen: false,
  setTerminalOpen: (open) => set({ terminalOpen: open }),

  // Panel sizes
  sidebarWidth: 224,
  setSidebarWidth: (width) => set({ sidebarWidth: width }),
  rightWidth: 272,
  setRightWidth: (width) => set({ rightWidth: width }),
  terminalHeight: 180,
  setTerminalHeight: (height) => set({ terminalHeight: height }),

  // Chats
  chats: [],
  setChats: (chats) => set({ chats }),
  activeChatId: null,
  setActiveChatId: (id) => set({ activeChatId: id }),
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),

  // Input
  input: '',
  setInput: (input) => set({ input }),
  attachments: [],
  setAttachments: (files) => set({ attachments: files }),
  addAttachment: (file) => set((state) => ({ attachments: [...state.attachments, file] })),
  removeAttachment: (index) =>
    set((state) => ({
      attachments: state.attachments.filter((_, i) => i !== index),
    })),

  // AI
  streaming: false,
  setStreaming: (streaming) => set({ streaming }),
  selectedModel: 'deepseek/deepseek-r1:free',
  setSelectedModel: (model) => set({ selectedModel: model }),
  thinkMode: false,
  setThinkMode: (enabled) => set({ thinkMode: enabled }),
  webMode: false,
  setWebMode: (enabled) => set({ webMode: enabled }),

  // Project
  projectPath: null,
  setProjectPath: (path) => set({ projectPath: path }),
  projectSelected: false,
  setProjectSelected: (selected) => set({ projectSelected: selected }),

  // File editor
  openFile: null,
  setOpenFile: (file) => set({ openFile: file }),

  // Modals
  showSettings: false,
  setShowSettings: (show) => set({ showSettings: show }),
  showWIP: null,
  setShowWIP: (title) => set({ showWIP: title }),

  // Slash commands
  slashOpen: false,
  setSlashOpen: (open) => set({ slashOpen: open }),
  slashQuery: '',
  setSlashQuery: (query) => set({ slashQuery: query }),
}));