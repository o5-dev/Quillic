import * as fs from 'fs';
import * as path from 'path';
import { FileNode } from '../../shared/types';
import log from 'electron-log';

export class FileSystemHandler {
  readFile(filePath: string): string {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error: any) {
      log.error('Error reading file:', error);
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  writeFile(filePath: string, content: string): void {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, content, 'utf-8');
    } catch (error: any) {
      log.error('Error writing file:', error);
      throw new Error(`Failed to write file: ${error.message}`);
    }
  }

  deleteFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error: any) {
      log.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  listFiles(dirPath: string, recursive: boolean = true): FileNode[] {
    try {
      if (!fs.existsSync(dirPath)) {
        return [];
      }

      const buildTree = (dir: string, relativePath: string = ''): FileNode[] => {
        const items: FileNode[] = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relPath = path.join(relativePath, entry.name);

          if (entry.isDirectory()) {
            if (recursive) {
              const children = buildTree(fullPath, relPath);
              items.push({
                name: entry.name,
                path: fullPath,
                children,
              });
            } else {
              items.push({
                name: entry.name,
                path: fullPath,
                children: [],
              });
            }
          } else {
            items.push({
              name: entry.name,
              path: fullPath,
            });
          }
        }

        return items.sort((a, b) => {
          // Folders first
          const aIsFolder = !!a.children;
          const bIsFolder = !!b.children;
          if (aIsFolder && !bIsFolder) return -1;
          if (!aIsFolder && bIsFolder) return 1;
          return a.name.localeCompare(b.name);
        });
      };

      return buildTree(dirPath);
    } catch (error: any) {
      log.error('Error listing files:', error);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  searchFiles(dirPath: string, pattern: string, fileGlob?: string): string[] {
    try {
      if (!fs.existsSync(dirPath)) {
        return [];
      }

      const results: string[] = [];
      const regex = new RegExp(pattern, 'i');

      const searchDir = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            // Skip common ignore directories
            if (['node_modules', '.git', '.next', 'dist', 'build'].includes(entry.name)) {
              continue;
            }
            searchDir(fullPath);
          } else {
            // Check file extension if glob provided
            if (fileGlob) {
              const ext = path.extname(entry.name);
              if (!ext.match(fileGlob.replace('*', '.*'))) {
                continue;
              }
            }

            try {
              const content = fs.readFileSync(fullPath, 'utf-8');
              if (regex.test(content)) {
                results.push(fullPath);
              }
            } catch {
              // Skip files that can't be read
            }
          }
        }
      };

      searchDir(dirPath);
      return results;
    } catch (error: any) {
      log.error('Error searching files:', error);
      throw new Error(`Failed to search files: ${error.message}`);
    }
  }

  createDirectory(dirPath: string, recursive: boolean = true): void {
    try {
      fs.mkdirSync(dirPath, { recursive });
    } catch (error: any) {
      log.error('Error creating directory:', error);
      throw new Error(`Failed to create directory: ${error.message}`);
    }
  }

  moveFile(source: string, destination: string): void {
    try {
      fs.renameSync(source, destination);
    } catch (error: any) {
      log.error('Error moving file:', error);
      throw new Error(`Failed to move file: ${error.message}`);
    }
  }

  copyFile(source: string, destination: string): void {
    try {
      fs.copyFileSync(source, destination);
    } catch (error: any) {
      log.error('Error copying file:', error);
      throw new Error(`Failed to copy file: ${error.message}`);
    }
  }
}