export interface Chat {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
  model_id: string;
  provider_id: string;
  project_folder: string | null;
  is_archived: number;
}

export interface Message {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_calls?: ToolCall[];
  tool_results?: ToolResult[];
  thinking_content?: string;
  attached_files?: AttachedFile[];
  model_id?: string;
  provider_id?: string;
  tokens_used?: number;
  created_at: number;
}

export interface ToolCall {
  name: string;
  args: any;
  status: 'running' | 'done' | 'failed';
  duration?: number;
  result?: any;
}

export interface ToolResult {
  tool_call_id: string;
  result: any;
}

export interface AttachedFile {
  name: string;
  path: string;
  lang: string;
  content: string;
}

export interface Provider {
  id: string;
  name: string;
  placeholder: string;
  url: string;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  free: boolean;
  tags: string[];
}

export interface Skill {
  id: string;
  filename: string;
  name: string;
  description: string;
  content: string;
  created_at: number;
}

export interface FileNode {
  name: string;
  path: string;
  children?: FileNode[];
  modified?: boolean;
  content?: string;
}

export interface GitStatus {
  staged: string[];
  modified: string[];
  untracked: string[];
  branch: string;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}