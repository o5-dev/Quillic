import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Skill } from '../../shared/types';
import log from 'electron-log';

export class SkillsHandler {
  private skillsPath: string;
  private skills: Map<string, Skill> = new Map();
  private watcher: fs.FSWatcher | null = null;

  constructor(skillsPath: string) {
    this.skillsPath = skillsPath;
    this.loadSkills();
    this.startWatcher();
  }

  private loadSkills(): void {
    this.skills.clear();

    if (!fs.existsSync(this.skillsPath)) {
      return;
    }

    const files = fs.readdirSync(this.skillsPath);

    for (const file of files) {
      if (file.endsWith('.md')) {
        try {
          const filePath = path.join(this.skillsPath, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const skill = this.parseSkillFile(file, content);
          this.skills.set(skill.id, skill);
        } catch (error) {
          log.error(`Error loading skill ${file}:`, error);
        }
      }
    }

    log.info(`Loaded ${this.skills.size} skills`);
  }

  private parseSkillFile(filename: string, content: string): Skill {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    let name = path.basename(filename, '.md');
    let description = '';
    let skillContent = content;

    if (match) {
      const frontmatterLines = match[1].split('\n');
      for (const line of frontmatterLines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim();
          if (key === 'name') name = value;
          if (key === 'description') description = value;
        }
      }
      skillContent = match[2];
    }

    return {
      id: uuidv4(),
      filename,
      name,
      description,
      content: skillContent,
      created_at: Date.now(),
    };
  }

  private startWatcher(): void {
    if (this.watcher) {
      this.watcher.close();
    }

    try {
      this.watcher = fs.watch(this.skillsPath, (eventType, filename) => {
        if (filename && filename.endsWith('.md')) {
          log.info(`Skills directory changed: ${filename}`);
          this.loadSkills();
        }
      });

      log.info('Started watching skills directory');
    } catch (error) {
      log.error('Error starting skills watcher:', error);
    }
  }

  listSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  addSkill(filename: string, content: string): Skill {
    const skill = this.parseSkillFile(filename, content);
    const filePath = path.join(this.skillsPath, filename);

    // Write to file
    fs.writeFileSync(filePath, content, 'utf-8');

    // Update in-memory cache
    this.skills.set(skill.id, skill);

    return skill;
  }

  removeSkill(id: string): boolean {
    const skill = this.skills.get(id);
    if (!skill) {
      return false;
    }

    const filePath = path.join(this.skillsPath, skill.filename);

    // Delete file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from cache
    this.skills.delete(id);

    return true;
  }

  getSkill(id: string): Skill | null {
    return this.skills.get(id) || null;
  }

  getActiveSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  close(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }
}