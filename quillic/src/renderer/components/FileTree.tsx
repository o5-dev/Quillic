import { useState, useEffect } from 'react';
import { Search, Folder, FolderOpen, FileCode, FileText, Braces, FileType, Code, Palette, Terminal, BrandDocker, Lock, Image } from 'lucide-react';
import { useStore } from '../store/useStore';
import { FileNode } from '@shared/types';

const FILE_ICONS: Record<string, any> = {
  ts: FileCode,
  tsx: FileCode,
  js: FileCode,
  jsx: FileCode,
  py: FileCode,
  rs: FileCode,
  go: FileCode,
  html: Code,
  css: Palette,
  scss: Palette,
  json: Braces,
  md: FileText,
  sh: Terminal,
  yaml: FileType,
  yml: FileType,
  dockerfile: BrandDocker,
  env: Lock,
  png: Image,
  jpg: Image,
  jpeg: Image,
  gif: Image,
  svg: Image,
  webp: Image,
};

const FILE_COLORS: Record<string, string> = {
  ts: '#60A5FA',
  tsx: '#60A5FA',
  js: '#FBBF24',
  jsx: '#FBBF24',
  py: '#86EFAC',
  rs: '#FCA5A5',
  go: '#67e8f9',
  html: '#F97316',
  css: '#C084FC',
  scss: '#C084FC',
  json: '#FBBF24',
  md: '#B8B8B5',
  sh: '#4ADE80',
  yaml: '#86EFAC',
  yml: '#86EFAC',
  dockerfile: '#60A5FA',
};

const getFileIcon = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  return FILE_ICONS[ext] || FileCode;
};

const getFileColor = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  return FILE_COLORS[ext] || '#787771';
};

interface TreeNodeProps {
  node: FileNode;
  depth?: number;
  selected?: string;
  onSelect?: (node: FileNode) => void;
}

function TreeNode({ node, depth = 0, selected, onSelect }: TreeNodeProps) {
  const [open, setOpen] = useState(depth < 2);
  const isFolder = !!node.children;
  const isSelected = selected === node.path;

  const Icon = isFolder ? (open ? FolderOpen : Folder) : getFileIcon(node.name);
  const color = isFolder ? 'var(--ac)' : getFileColor(node.name);

  return (
    <div>
      <div
        onClick={() => {
          if (isFolder) {
            setOpen((o) => !o);
          } else if (onSelect) {
            onSelect(node);
          }
        }}
        className="flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer text-sm transition-all"
        style={{
          paddingLeft: 8 + depth * 14,
          background: isSelected ? 'var(--bg4)' : 'transparent',
          color: isSelected ? 'var(--tx)' : isFolder ? 'var(--tx2)' : 'var(--mt)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = 'var(--bg3)';
            e.currentTarget.style.color = 'var(--tx)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = isFolder ? 'var(--tx2)' : 'var(--mt)';
          }
        }}
      >
        <Icon size={13} style={{ color }} />
        <span className="overflow-hidden text-ellipsis">{node.name}</span>
        {node.modified && (
          <span
            className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: 'var(--warning)' }}
          />
        )}
      </div>

      {isFolder && open && node.children?.map((child, i) => (
        <TreeNode
          key={i}
          node={child}
          depth={depth + 1}
          selected={selected}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

export default function FileTree() {
  const { projectPath, projectSelected, openFile, setOpenFile } = useStore();
  const [tree, setTree] = useState<FileNode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (projectSelected && projectPath) {
      loadTree();
    }
  }, [projectSelected, projectPath]);

  const loadTree = async () => {
    if (!projectPath) return;

    try {
      const files = await window.electronAPI.listFiles(projectPath, true);
      setTree(files);
    } catch (error) {
      console.error('Failed to load file tree:', error);
    }
  };

  const handleSelect = async (node: FileNode) => {
    try {
      const content = await window.electronAPI.readFile(node.path);
      setOpenFile({
        name: node.name,
        path: node.path,
        content,
      });
    } catch (error) {
      console.error('Failed to read file:', error);
    }
  };

  const filteredTree = searchQuery
    ? filterTree(tree, searchQuery.toLowerCase())
    : tree;

  return (
    <>
      {/* Search */}
      <div
        className="p-1.5 pb-2"
        style={{ borderBottom: '1px solid var(--bg5)', flexShrink: 0 }}
      >
        <div className="relative">
          <Search
            size={12}
            className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--mt)' }}
          />
          <input
            type="text"
            placeholder="Filter files…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-7 rounded pl-7 pr-2 text-xs outline-none"
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--bg5)',
              color: 'var(--tx)',
            }}
          />
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-1.5">
        {!projectSelected ? (
          <div className="p-5 text-center text-sm" style={{ color: 'var(--mt)' }}>
            No project folder selected.
          </div>
        ) : filteredTree.length === 0 ? (
          <div className="p-5 text-center text-sm" style={{ color: 'var(--mt)' }}>
            {searchQuery ? 'No files match your search.' : 'No files yet.'}
          </div>
        ) : (
          filteredTree.map((node, i) => (
            <TreeNode
              key={i}
              node={node}
              selected={openFile?.path}
              onSelect={handleSelect}
            />
          ))
        )}
      </div>
    </>
  );
}

function filterTree(nodes: FileNode[], query: string): FileNode[] {
  const result: FileNode[] = [];

  for (const node of nodes) {
    if (node.children) {
      const filteredChildren = filterTree(node.children, query);
      if (filteredChildren.length > 0 || node.name.toLowerCase().includes(query)) {
        result.push({
          ...node,
          children: filteredChildren,
        });
      }
    } else if (node.name.toLowerCase().includes(query)) {
      result.push(node);
    }
  }

  return result;
}