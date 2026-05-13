import * as fs from 'fs';
import * as path from 'path';
import { SettingsStore } from '../store/settings-store';
import log from 'electron-log';

export interface ObsidianNote {
  path: string;
  title: string;
  content: string;
  tags: string[];
  frontmatter: Record<string, any>;
  backlinks: string[];
}

export class ObsidianHandler {
  private settingsStore: SettingsStore;
  private notes: Map<string, ObsidianNote> = new Map();
  private watcher: fs.FSWatcher | null = null;

  constructor(settingsStore: SettingsStore) {
    this.settingsStore = settingsStore;
  }

  private getVaultPath(): string | null {
    const vaultPath = this.settingsStore.get('obsidianVaultPath') as string;
    const enabled = this.settingsStore.get('obsidianVaultEnabled') as boolean;

    if (!enabled || !vaultPath) {
      return null;
    }

    if (!fs.existsSync(vaultPath)) {
      log.warn(`Obsidian vault path does not exist: ${vaultPath}`);
      return null;
    }

    return vaultPath;
  }

  private parseFrontmatter(content: string): { frontmatter: Record<string, any>; content: string } {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
      return { frontmatter: {}, content };
    }

    const frontmatter: Record<string, any> = {};
    const lines = match[1].split('\n');

    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        frontmatter[key] = value;
      }
    }

    return { frontmatter, content: match[2] };
  }

  private extractTags(content: string): string[] {
    const tagRegex = /#(\w+)/g;
    const tags: string[] = [];
    let match;

    while ((match = tagRegex.exec(content)) !== null) {
      tags.push(match[1]);
    }

    return tags;
  }

  private extractTitle(content: string, filePath: string): string {
    // Try to get title from frontmatter
    const { frontmatter } = this.parseFrontmatter(content);
    if (frontmatter.title) {
      return frontmatter.title;
    }

    // Try to get first heading
    const headingRegex = /^#\s+(.+)$/m;
    const headingMatch = content.match(headingRegex);
    if (headingMatch) {
      return headingMatch[1].trim();
    }

    // Use filename
    return path.basename(filePath, '.md');
  }

  private indexVault(): void {
    const vaultPath = this.getVaultPath();
    if (!vaultPath) {
      this.notes.clear();
      return;
    }

    this.notes.clear();

    const indexDirectory = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip .obsidian folder
          if (entry.name === '.obsidian') {
            continue;
          }
          indexDirectory(fullPath);
        } else if (entry.name.endsWith('.md')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const { frontmatter, content: noteContent } = this.parseFrontmatter(content);
            const tags = this.extractTags(content);
            const title = this.extractTitle(content, fullPath);

            this.notes.set(fullPath, {
              path: fullPath,
              title,
              content: noteContent,
              tags,
              frontmatter,
              backlinks: [],
            });
          } catch (error) {
            log.error(`Error indexing note ${fullPath}:`, error);
          }
        }
      }
    };

    try {
      indexDirectory(vaultPath);
      log.info(`Indexed ${this.notes.size} notes from Obsidian vault`);
    } catch (error) {
      log.error('Error indexing Obsidian vault:', error);
    }
  }

  private startWatcher(): void {
    const vaultPath = this.getVaultPath();
    if (!vaultPath) {
      return;
    }

    if (this.watcher) {
      this.watcher.close();
    }

    try {
      this.watcher = fs.watch(vaultPath, { recursive: true }, (eventType, filename) => {
        if (filename && filename.endsWith('.md')) {
          log.info(`Obsidian vault changed: ${filename}`);
          this.indexVault();
        }
      });

      log.info('Started watching Obsidian vault');
    } catch (error) {
      log.error('Error starting Obsidian watcher:', error);
    }
  }

  connect(): void {
    this.indexVault();
    this.startWatcher();
  }

  disconnect(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    this.notes.clear();
  }

  search(query: string, maxResults: number = 10): ObsidianNote[] {
    const results: ObsidianNote[] = [];
    const lowerQuery = query.toLowerCase();

    for (const note of this.notes.values()) {
      const titleMatch = note.title.toLowerCase().includes(lowerQuery);
      const contentMatch = note.content.toLowerCase().includes(lowerQuery);
      const tagMatch = note.tags.some(tag => tag.toLowerCase().includes(lowerQuery));

      if (titleMatch || contentMatch || tagMatch) {
        results.push(note);
        if (results.length >= maxResults) {
          break;
        }
      }
    }

    return results;
  }

  readNote(notePath: string): ObsidianNote | null {
    const note = this.notes.get(notePath);
    return note || null;
  }

  listNotes(folder?: string, tag?: string): ObsidianNote[] {
    let results = Array.from(this.notes.values());

    if (folder) {
      results = results.filter(note => note.path.startsWith(folder));
    }

    if (tag) {
      results = results.filter(note => note.tags.includes(tag));
    }

    return results;
  }

  getGraph(): { nodes: ObsidianNote[]; edges: Array<{ from: string; to: string }> } {
    const nodes = Array.from(this.notes.values());
    const edges: Array<{ from: string; to: string }> = [];

    // Build backlinks
    for (const note of nodes) {
      const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
      let match;

      while ((match = wikiLinkRegex.exec(note.content)) !== null) {
        const linkTitle = match[1];
        const linkedNote = nodes.find(n =>
          n.title.toLowerCase() === linkTitle.toLowerCase() ||
          n.path.toLowerCase().includes(linkTitle.toLowerCase())
        );

        if (linkedNote) {
          edges.push({ from: note.path, to: linkedNote.path });
        }
      }
    }

    return { nodes, edges };
  }
}