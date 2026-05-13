import Store from 'electron-store';
import * as crypto from 'crypto';

const schema = {
  theme: {
    type: 'string',
    default: 'dark',
  },
  fontSize: {
    type: 'number',
    default: 13,
  },
  sendOnEnter: {
    type: 'boolean',
    default: true,
  },
  autoTitleChats: {
    type: 'boolean',
    default: true,
  },
  extendedThinkingDefault: {
    type: 'boolean',
    default: false,
  },
  requireProjectFolder: {
    type: 'boolean',
    default: true,
  },
  defaultProjectPath: {
    type: 'string',
    default: '',
  },
  autoRefreshFileTree: {
    type: 'boolean',
    default: true,
  },
  excludedPatterns: {
    type: 'array',
    default: ['node_modules/**', '.git/**', '.next/**', 'dist/**', '*.pyc', '__pycache__/**'],
  },
  obsidianVaultPath: {
    type: 'string',
    default: '',
  },
  obsidianVaultEnabled: {
    type: 'boolean',
    default: false,
  },
  obsidianIncludeAttachments: {
    type: 'boolean',
    default: false,
  },
  githubPAT: {
    type: 'string',
    default: '',
    encrypted: true,
  },
  sidebarWidth: {
    type: 'number',
    default: 224,
  },
  rightPanelWidth: {
    type: 'number',
    default: 272,
  },
  terminalHeight: {
    type: 'number',
    default: 180,
  },
};

export class SettingsStore {
  private store: Store;
  private encryptionKey: Buffer;

  constructor() {
    // Generate or retrieve encryption key
    this.encryptionKey = this.getOrCreateEncryptionKey();

    this.store = new Store({
      name: 'quillic-settings',
      schema,
      encryptionKey: 'quillic-secure-settings',
    });
  }

  private getOrCreateEncryptionKey(): Buffer {
    // In production, this should be stored securely
    // For now, we'll use a fixed key (in real app, use system keychain)
    return crypto.scryptSync('quillic-encryption-key', 'salt', 32);
  }

  private encrypt(value: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(value: string): string {
    const parts = value.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  get(key: string): any {
    const value = this.store.get(key);
    const field = schema[key as keyof typeof schema];

    if (field?.encrypted && value && typeof value === 'string') {
      try {
        return this.decrypt(value);
      } catch {
        return value;
      }
    }

    return value;
  }

  set(key: string, value: any): void {
    const field = schema[key as keyof typeof schema];

    if (field?.encrypted && value && typeof value === 'string') {
      value = this.encrypt(value);
    }

    this.store.set(key, value);
  }

  getAll(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const key in schema) {
      result[key] = this.get(key);
    }
    return result;
  }

  reset(): void {
    this.store.clear();
  }

  // API Keys (stored separately for security)
  getAPIKey(provider: string): string | null {
    const key = `api_key_${provider}`;
    const value = this.store.get(key);
    if (value && typeof value === 'string') {
      try {
        return this.decrypt(value);
      } catch {
        return null;
      }
    }
    return null;
  }

  setAPIKey(provider: string, key: string): void {
    const encrypted = this.encrypt(key);
    this.store.set(`api_key_${provider}`, encrypted);
  }

  removeAPIKey(provider: string): void {
    this.store.delete(`api_key_${provider}`);
  }

  hasAPIKey(provider: string): boolean {
    return this.getAPIKey(provider) !== null;
  }
}