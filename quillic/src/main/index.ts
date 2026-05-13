import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { IPC } from '../shared/ipc-channels';
import { Database } from './database/database';
import { SettingsStore } from './store/settings-store';
import { AIHandler } from './ai/ai-handler';
import { FileSystemHandler } from './handlers/file-system-handler';
import { ShellHandler } from './handlers/shell-handler';
import { GitHandler } from './handlers/git-handler';
import { ObsidianHandler } from './handlers/obsidian-handler';
import { SkillsHandler } from './handlers/skills-handler';
import log from 'electron-log';

// Configure logging
log.transports.file.level = 'info';
log.transports.console.level = 'debug';

let mainWindow: BrowserWindow | null = null;
let database: Database;
let settingsStore: SettingsStore;
let aiHandler: AIHandler;
let fileSystemHandler: FileSystemHandler;
let shellHandler: ShellHandler;
let gitHandler: GitHandler;
let obsidianHandler: ObsidianHandler;
let skillsHandler: SkillsHandler;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#1F1F1E',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize app
async function initialize() {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'quillic.db');
  const skillsPath = path.join(userDataPath, 'skills');

  // Ensure skills directory exists
  if (!fs.existsSync(skillsPath)) {
    fs.mkdirSync(skillsPath, { recursive: true });
  }

  // Initialize database
  database = new Database(dbPath);
  await database.initialize();

  // Initialize settings store
  settingsStore = new SettingsStore();

  // Initialize handlers
  aiHandler = new AIHandler(settingsStore);
  fileSystemHandler = new FileSystemHandler();
  shellHandler = new ShellHandler();
  gitHandler = new GitHandler();
  obsidianHandler = new ObsidianHandler(settingsStore);
  skillsHandler = new SkillsHandler(skillsPath);

  // Register IPC handlers
  registerIPCHandlers();

  log.info('Quillic initialized successfully');
}

function registerIPCHandlers() {
  // Window controls
  ipcMain.on(IPC.WINDOW_MINIMIZE, () => {
    mainWindow?.minimize();
  });

  ipcMain.on(IPC.WINDOW_MAXIMIZE, () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.on(IPC.WINDOW_CLOSE, () => {
    mainWindow?.close();
  });

  // Database handlers
  ipcMain.handle(IPC.DB_GET_CHATS, async () => {
    return database.getChats();
  });

  ipcMain.handle(IPC.DB_CREATE_CHAT, async (_, chat: any) => {
    return database.createChat(chat);
  });

  ipcMain.handle(IPC.DB_UPDATE_CHAT, async (_, id: string, updates: any) => {
    return database.updateChat(id, updates);
  });

  ipcMain.handle(IPC.DB_DELETE_CHAT, async (_, id: string) => {
    return database.deleteChat(id);
  });

  ipcMain.handle(IPC.DB_GET_MESSAGES, async (_, chatId: string) => {
    return database.getMessages(chatId);
  });

  ipcMain.handle(IPC.DB_SAVE_MESSAGE, async (_, message: any) => {
    return database.saveMessage(message);
  });

  ipcMain.handle(IPC.DB_SEARCH_MESSAGES, async (_, query: string) => {
    return database.searchMessages(query);
  });

  // Settings handlers
  ipcMain.handle(IPC.SETTINGS_GET, async (_, key: string) => {
    return settingsStore.get(key);
  });

  ipcMain.handle(IPC.SETTINGS_SET, async (_, key: string, value: any) => {
    return settingsStore.set(key, value);
  });

  // AI handlers
  ipcMain.handle(IPC.AI_SEND_MESSAGE, async (_, chatId: string, messages: any[], model: string, provider: string) => {
    return aiHandler.sendMessage(chatId, messages, model, provider);
  });

  ipcMain.handle(IPC.AI_ABORT, () => {
    aiHandler.abort();
  });

  // File system handlers
  ipcMain.handle(IPC.FS_READ, async (_, filePath: string) => {
    return fileSystemHandler.readFile(filePath);
  });

  ipcMain.handle(IPC.FS_WRITE, async (_, filePath: string, content: string) => {
    return fileSystemHandler.writeFile(filePath, content);
  });

  ipcMain.handle(IPC.FS_DELETE, async (_, filePath: string) => {
    return fileSystemHandler.deleteFile(filePath);
  });

  ipcMain.handle(IPC.FS_LIST, async (_, dirPath: string, recursive?: boolean) => {
    return fileSystemHandler.listFiles(dirPath, recursive);
  });

  ipcMain.handle(IPC.FS_SEARCH, async (_, dirPath: string, pattern: string, fileGlob?: string) => {
    return fileSystemHandler.searchFiles(dirPath, pattern, fileGlob);
  });

  // Dialog handlers
  ipcMain.handle(IPC.DIALOG_OPEN_FILE, async (_, options?: any) => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openFile'],
      ...options,
    });
    return result;
  });

  ipcMain.handle(IPC.DIALOG_OPEN_FOLDER, async (_, options?: any) => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openDirectory'],
      ...options,
    });
    return result;
  });

  ipcMain.handle(IPC.DIALOG_SAVE_FILE, async (_, options?: any) => {
    const result = await dialog.showSaveDialog(mainWindow!, options);
    return result;
  });

  // Shell handlers
  ipcMain.handle(IPC.SHELL_RUN, async (_, command: string, cwd?: string, timeoutMs?: number) => {
    return shellHandler.runCommand(command, cwd, timeoutMs);
  });

  ipcMain.handle(IPC.SHELL_ABORT, () => {
    shellHandler.abort();
  });

  // Git handlers
  ipcMain.handle(IPC.GIT_STATUS, async (_, repoPath: string) => {
    return gitHandler.getStatus(repoPath);
  });

  ipcMain.handle(IPC.GIT_COMMIT, async (_, repoPath: string, message: string) => {
    return gitHandler.commit(repoPath, message);
  });

  ipcMain.handle(IPC.GIT_PUSH, async (_, repoPath: string, remote?: string, branch?: string) => {
    return gitHandler.push(repoPath, remote, branch);
  });

  ipcMain.handle(IPC.GIT_PULL, async (_, repoPath: string) => {
    return gitHandler.pull(repoPath);
  });

  ipcMain.handle(IPC.GIT_LOG, async (_, repoPath: string, limit?: number) => {
    return gitHandler.getLog(repoPath, limit);
  });

  ipcMain.handle(IPC.GIT_DIFF, async (_, repoPath: string, file?: string) => {
    return gitHandler.getDiff(repoPath, file);
  });

  ipcMain.handle(IPC.GIT_ADD, async (_, repoPath: string, files: string[]) => {
    return gitHandler.add(repoPath, files);
  });

  ipcMain.handle(IPC.GIT_CHECKOUT, async (_, repoPath: string, branch: string, create?: boolean) => {
    return gitHandler.checkout(repoPath, branch, create);
  });

  ipcMain.handle(IPC.GIT_CLONE, async (_, url: string, destination: string) => {
    return gitHandler.clone(url, destination);
  });

  // Obsidian handlers
  ipcMain.handle(IPC.OBSIDIAN_SEARCH, async (_, query: string, maxResults?: number) => {
    return obsidianHandler.search(query, maxResults);
  });

  ipcMain.handle(IPC.OBSIDIAN_READ, async (_, notePath: string) => {
    return obsidianHandler.readNote(notePath);
  });

  ipcMain.handle(IPC.OBSIDIAN_LIST, async (_, folder?: string, tag?: string) => {
    return obsidianHandler.listNotes(folder, tag);
  });

  // Skills handlers
  ipcMain.handle(IPC.SKILLS_LIST, async () => {
    return skillsHandler.listSkills();
  });

  ipcMain.handle(IPC.SKILLS_ADD, async (_, filename: string, content: string) => {
    return skillsHandler.addSkill(filename, content);
  });

  ipcMain.handle(IPC.SKILLS_REMOVE, async (_, id: string) => {
    return skillsHandler.removeSkill(id);
  });
}

// App lifecycle
app.whenReady().then(async () => {
  await initialize();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Cleanup
  database?.close();
  aiHandler?.abort();
  shellHandler?.abort();
});