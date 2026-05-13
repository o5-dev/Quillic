import { spawn, ChildProcess } from 'child_process';
import log from 'electron-log';

export interface ShellResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  durationMs: number;
}

export class ShellHandler {
  private currentProcess: ChildProcess | null = null;
  private abortController: AbortController | null = null;

  async runCommand(
    command: string,
    cwd?: string,
    timeoutMs: number = 30000
  ): Promise<ShellResult> {
    const startTime = Date.now();
    this.abortController = new AbortController();

    return new Promise((resolve, reject) => {
      // Parse command into parts
      const parts = command.split(' ');
      const cmd = parts[0];
      const args = parts.slice(1);

      this.currentProcess = spawn(cmd, args, {
        cwd: cwd || process.cwd(),
        shell: true,
      });

      let stdout = '';
      let stderr = '';

      this.currentProcess.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      this.currentProcess.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      // Set timeout
      const timeout = setTimeout(() => {
        this.abort();
        reject(new Error(`Command timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      this.currentProcess.on('close', (code) => {
        clearTimeout(timeout);
        const duration = Date.now() - startTime;
        resolve({
          stdout,
          stderr,
          exitCode: code,
          durationMs: duration,
        });
        this.currentProcess = null;
      });

      this.currentProcess.on('error', (error) => {
        clearTimeout(timeout);
        log.error('Shell command error:', error);
        reject(error);
        this.currentProcess = null;
      });

      // Handle abort signal
      this.abortController.signal.addEventListener('abort', () => {
        if (this.currentProcess) {
          this.currentProcess.kill('SIGTERM');
        }
      });
    });
  }

  abort(): void {
    if (this.currentProcess) {
      this.currentProcess.kill('SIGTERM');
      this.currentProcess = null;
    }
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}