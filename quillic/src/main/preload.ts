import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '../shared/ipc-channels';

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.send(IPC.WINDOW_MINIMIZE),
  maximize: () => ipcRenderer.send(IPC.WINDOW_MAXIMIZE),
  close: () => ipcRenderer.send(IPC.WINDOW_CLOSE),

  // Database
  getChats: () => ipcRenderer.invoke(IPC.DB_GET_CHATS),
  createChat: (chat: any) => ipcRenderer.invoke(IPC.DB_CREATE_CHAT, chat),
  updateChat: (id: string, updates: any) => ipcRenderer.invoke(IPC.DB_UPDATE_CHAT, id, updates),
  deleteChat: (id: string) => ipcRenderer.invoke(IPC.DB_DELETE_CHAT, id),
  getMessages: (chatId: string) => ipcRenderer.invoke(IPC.DB_GET_MESSAGES, chatId),
  saveMessage: (message: any) => ipcRenderer.invoke(IPC.DB_SAVE_MESSAGE, message),
  searchMessages: (query: string) => ipcRenderer.invoke(IPC.DB_SEARCH_MESSAGES, query),

  // Settings
  getSetting: (key: string) => ipcRenderer.invoke(IPC.SETTINGS_GET, key),
  setSetting: (key: string, value: any) => ipcRenderer.invoke(IPC.SETTINGS_SET, key, value),

  // AI
  sendMessage: (chatId: string, messages: any[], model: string, provider: string) =>
    ipcRenderer.invoke(IPC.AI_SEND_MESSAGE, chatId, messages, model, provider),
  abortAI: () => ipcRenderer.send(IPC.AI_ABORT),

  // File system
  readFile: (filePath: string) => ipcRenderer.invoke(IPC.FS_READ, filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke(IPC.FS_WRITE, filePath, content),
  deleteFile: (filePath: string) => ipcRenderer.invoke(IPC.FS_DELETE, filePath),
  listFiles: (dirPath: string, recursive?: boolean) => ipcRenderer.invoke(IPC.FS_LIST, dirPath, recursive),
  searchFiles: (dirPath: string, pattern: string, fileGlob?: string) =>
    ipcRenderer.invoke(IPC.FS_SEARCH, dirPath, pattern, fileGlob),

  // Dialogs
  openFile: (options?: any) => ipcRenderer.invoke(IPC.DIALOG_OPEN_FILE, options),
  openFolder: (options?: any) => ipcRenderer.invoke(IPC.DIALOG_OPEN_FOLDER, options),
  saveFile: (options?: any) => ipcRenderer.invoke(IPC.DIALOG_SAVE_FILE, options),

  // Shell
  runCommand: (command: string, cwd?: string, timeoutMs?: number) =>
    ipcRenderer.invoke(IPC.SHELL_RUN, command, cwd, timeoutMs),
  abortCommand: () => ipcRenderer.send(IPC.SHELL_ABORT),

  // Git
  gitStatus: (repoPath: string) => ipcRenderer.invoke(IPC.GIT_STATUS, repoPath),
  gitCommit: (repoPath: string, message: string) => ipcRenderer.invoke(IPC.GIT_COMMIT, repoPath, message),
  gitPush: (repoPath: string, remote?: string, branch?: string) =>
    ipcRenderer.invoke(IPC.GIT_PUSH, repoPath, remote, branch),
  gitPull: (repoPath: string) => ipcRenderer.invoke(IPC.GIT_PULL, repoPath),
  gitLog: (repoPath: string, limit?: number) => ipcRenderer.invoke(IPC.GIT_LOG, repoPath, limit),
  gitDiff: (repoPath: string, file?: string) => ipcRenderer.invoke(IPC.GIT_DIFF, repoPath, file),
  gitAdd: (repoPath: string, files: string[]) => ipcRenderer.invoke(IPC.GIT_ADD, repoPath, files),
  gitCheckout: (repoPath: string, branch: string, create?: boolean) =>
    ipcRenderer.invoke(IPC.GIT_CHECKOUT, repoPath, branch, create),
  gitClone: (url: string, destination: string) => ipcRenderer.invoke(IPC.GIT_CLONE, url, destination),

  // Obsidian
  obsidianSearch: (query: string, maxResults?: number) => ipcRenderer.invoke(IPC.OBSIDIAN_SEARCH, query, maxResults),
  obsidianRead: (notePath: string) => ipcRenderer.invoke(IPC.OBSIDIAN_READ, notePath),
  obsidianList: (folder?: string, tag?: string) => ipcRenderer.invoke(IPC.OBSIDIAN_LIST, folder, tag),

  // Skills
  listSkills: () => ipcRenderer.invoke(IPC.SKILLS_LIST),
  addSkill: (filename: string, content: string) => ipcRenderer.invoke(IPC.SKILLS_ADD, filename, content),
  removeSkill: (id: string) => ipcRenderer.invoke(IPC.SKILLS_REMOVE, id),

  // Event listeners
  onAIStreamToken: (callback: (token: string) => void) => {
    ipcRenderer.on(IPC.AI_STREAM_TOKEN, (_, token) => callback(token));
  },
  onAIStreamDone: (callback: () => void) => {
    ipcRenderer.on(IPC.AI_STREAM_DONE, () => callback());
  },
  onAIStreamError: (callback: (error: string) => void) => {
    ipcRenderer.on(IPC.AI_STREAM_ERROR, (_, error) => callback(error));
  },
  onFileWatchEvent: (callback: (event: string, path: string) => void) => {
    ipcRenderer.on(IPC.FS_WATCH_EVENT, (_, event, path) => callback(event, path));
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});

export type ElectronAPI = typeof window.electronAPI;