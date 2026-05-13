import { ShellHandler } from './shell-handler';
import { GitStatus } from '../../shared/types';
import log from 'electron-log';

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
}

export class GitHandler {
  private shellHandler: ShellHandler;

  constructor() {
    this.shellHandler = new ShellHandler();
  }

  private async runGitCommand(args: string[], cwd: string): Promise<string> {
    try {
      const result = await this.shellHandler.runCommand(`git ${args.join(' ')}`, cwd);
      if (result.exitCode !== 0) {
        throw new Error(result.stderr || 'Git command failed');
      }
      return result.stdout.trim();
    } catch (error: any) {
      log.error('Git command error:', error);
      throw error;
    }
  }

  async getStatus(repoPath: string): Promise<GitStatus> {
    try {
      const branch = await this.runGitCommand(['rev-parse', '--abbrev-ref', 'HEAD'], repoPath);

      const statusOutput = await this.runGitCommand(['status', '--porcelain'], repoPath);
      const lines = statusOutput.split('\n').filter(Boolean);

      const staged: string[] = [];
      const modified: string[] = [];
      const untracked: string[] = [];

      for (const line of lines) {
        const status = line.substring(0, 2);
        const filePath = line.substring(3);

        if (status.startsWith('M') || status.startsWith('A') || status.startsWith('D')) {
          staged.push(filePath);
        }
        if (status.includes('M') && !status.startsWith('M')) {
          modified.push(filePath);
        }
        if (status.includes('??')) {
          untracked.push(filePath);
        }
      }

      return {
        branch,
        staged,
        modified,
        untracked,
      };
    } catch (error: any) {
      if (error.message.includes('not a git repository')) {
        throw new Error('Not a git repository');
      }
      throw error;
    }
  }

  async commit(repoPath: string, message: string): Promise<void> {
    await this.runGitCommand(['commit', '-m', message], repoPath);
  }

  async push(repoPath: string, remote?: string, branch?: string): Promise<void> {
    const args = ['push'];
    if (remote) args.push(remote);
    if (branch) args.push(branch);
    await this.runGitCommand(args, repoPath);
  }

  async pull(repoPath: string): Promise<void> {
    await this.runGitCommand(['pull'], repoPath);
  }

  async getLog(repoPath: string, limit: number = 10): Promise<GitCommit[]> {
    const output = await this.runGitCommand(
      ['log', `-${limit}`, '--pretty=format:%H|%s|%an|%ai'],
      repoPath
    );

    const lines = output.split('\n').filter(Boolean);
    return lines.map(line => {
      const [hash, message, author, date] = line.split('|');
      return { hash, message, author, date };
    });
  }

  async getDiff(repoPath: string, file?: string): Promise<string> {
    const args = ['diff'];
    if (file) args.push('--', file);
    return await this.runGitCommand(args, repoPath);
  }

  async add(repoPath: string, files: string[]): Promise<void> {
    await this.runGitCommand(['add', ...files], repoPath);
  }

  async checkout(repoPath: string, branch: string, create?: boolean): Promise<void> {
    const args = ['checkout'];
    if (create) args.push('-b');
    args.push(branch);
    await this.runGitCommand(args, repoPath);
  }

  async clone(url: string, destination: string): Promise<void> {
    await this.shellHandler.runCommand(`git clone ${url} ${destination}`);
  }
}