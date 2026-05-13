import OpenAI from 'openai';
import { IPC } from '../../shared/ipc-channels';
import { SettingsStore } from '../store/settings-store';
import { Message } from '../../shared/types';
import { BrowserWindow } from 'electron';
import log from 'electron-log';

export class AIHandler {
  private settingsStore: SettingsStore;
  private abortController: AbortController | null = null;
  private currentWindow: BrowserWindow | null = null;

  constructor(settingsStore: SettingsStore) {
    this.settingsStore = settingsStore;
  }

  private getMainWindow(): BrowserWindow | null {
    if (!this.currentWindow) {
      const windows = BrowserWindow.getAllWindows();
      this.currentWindow = windows[0] || null;
    }
    return this.currentWindow;
  }

  private getProviderConfig(provider: string): { baseURL: string; apiKey: string } | null {
    const apiKey = this.settingsStore.getAPIKey(provider);
    if (!apiKey) return null;

    switch (provider) {
      case 'openrouter':
        return { baseURL: 'https://openrouter.ai/api/v1', apiKey };
      case 'nvidia':
        return { baseURL: 'https://integrate.api.nvidia.com/v1', apiKey };
      case 'huggingface':
        return { baseURL: 'https://api-inference.huggingface.co/v1', apiKey };
      default:
        return null;
    }
  }

  async sendMessage(
    chatId: string,
    messages: Message[],
    model: string,
    provider: string
  ): Promise<void> {
    const config = this.getProviderConfig(provider);
    if (!config) {
      this.sendError(`No API key configured for ${provider}`);
      return;
    }

    this.abortController = new AbortController();

    try {
      const openai = new OpenAI({
        baseURL: config.baseURL,
        apiKey: config.apiKey,
      });

      // Convert messages to OpenAI format
      const openaiMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const stream = await openai.chat.completions.create({
        model,
        messages: openaiMessages,
        stream: true,
      }, {
        signal: this.abortController.signal,
      });

      let fullContent = '';

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          fullContent += delta;
          this.sendToken(delta);
        }
      }

      this.sendDone();

      log.info(`AI response completed for chat ${chatId}`);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        log.info('AI request aborted');
      } else {
        log.error('AI request error:', error);
        this.sendError(error.message || 'Failed to get AI response');
      }
    }
  }

  private sendToken(token: string): void {
    const window = this.getMainWindow();
    if (window && !window.isDestroyed()) {
      window.webContents.send(IPC.AI_STREAM_TOKEN, token);
    }
  }

  private sendDone(): void {
    const window = this.getMainWindow();
    if (window && !window.isDestroyed()) {
      window.webContents.send(IPC.AI_STREAM_DONE);
    }
  }

  private sendError(error: string): void {
    const window = this.getMainWindow();
    if (window && !window.isDestroyed()) {
      window.webContents.send(IPC.AI_STREAM_ERROR, error);
    }
  }

  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}