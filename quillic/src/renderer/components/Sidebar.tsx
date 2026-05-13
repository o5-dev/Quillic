import { useState, useEffect } from 'react';
import { Plus, Search, Settings, Sun, Moon, Zap, Layers } from 'lucide-react';
import { useStore } from '../store/useStore';
import IconBtn from './IconBtn';
import { v4 as uuidv4 } from 'uuid';

export default function Sidebar() {
  const {
    sidebarWidth,
    chats,
    setChats,
    activeChatId,
    setActiveChatId,
    theme,
    setTheme,
    setShowSettings,
    setShowWIP,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleNewChat = async () => {
    const newChat = {
      id: uuidv4(),
      title: 'New conversation',
      created_at: Date.now(),
      updated_at: Date.now(),
      model_id: null,
      provider_id: null,
      project_folder: null,
      is_archived: 0,
    };

    try {
      const createdChat = await window.electronAPI.createChat(newChat);
      setChats([createdChat, ...chats]);
      setActiveChatId(createdChat.id);
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const handleRename = async (chatId: string) => {
    if (!renameValue.trim()) {
      setRenaming(null);
      return;
    }

    try {
      await window.electronAPI.updateChat(chatId, { title: renameValue.trim() });
      setChats(chats.map((c) => (c.id === chatId ? { ...c, title: renameValue.trim() } : c)));
      setRenaming(null);
    } catch (error) {
      console.error('Failed to rename chat:', error);
    }
  };

  const handleDelete = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this chat?')) {
      return;
    }

    try {
      await window.electronAPI.deleteChat(chatId);
      setChats(chats.filter((c) => c.id !== chatId));

      if (activeChatId === chatId) {
        setActiveChatId(chats.length > 1 ? chats[1].id : null);
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group chats by time
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const twoDays = 2 * oneDay;

  const todayChats = filteredChats.filter((c) => now - c.updated_at < oneDay);
  const yesterdayChats = filteredChats.filter(
    (c) => now - c.updated_at >= oneDay && now - c.updated_at < twoDays
  );
  const earlierChats = filteredChats.filter((c) => now - c.updated_at >= twoDays);

  const formatTime = (timestamp: number) => {
    const diff = now - timestamp;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hr ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        width: sidebarWidth,
        background: 'var(--bg1)',
        borderRight: '1px solid var(--bg5)',
      }}
    >
      {/* New chat and search */}
      <div className="p-2.5 pb-2" style={{ borderBottom: '1px solid var(--bg5)', flexShrink: 0 }}>
        <button
          onClick={handleNewChat}
          className="w-full h-[34px] rounded flex items-center justify-center gap-1.5 transition-all"
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--bg5)',
            color: 'var(--tx2)',
            fontSize: 13,
            fontWeight: 500,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg4)';
            e.currentTarget.style.color = 'var(--tx)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg2)';
            e.currentTarget.style.color = 'var(--tx2)';
          }}
        >
          <Plus size={14} />
          New chat
        </button>

        <div className="relative mt-2">
          <Search
            size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--mt)' }}
          />
          <input
            type="text"
            placeholder="Search chats…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[30px] rounded pl-7 pr-2.5 text-sm outline-none"
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--bg5)',
              color: 'var(--tx)',
            }}
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto p-1.5">
        {filteredChats.length === 0 && (
          <div className="p-5 text-center" style={{ color: 'var(--mt)', fontSize: 13 }}>
            No conversations yet. Start a new chat.
          </div>
        )}

        {todayChats.length > 0 && (
          <div>
            <div
              className="px-1.5 py-2 text-xs font-medium tracking-wide"
              style={{
                color: 'var(--mt)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Today
            </div>
            {todayChats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={activeChatId === chat.id}
                onClick={() => setActiveChatId(chat.id)}
                onDoubleClick={() => {
                  setRenaming(chat.id);
                  setRenameValue(chat.title);
                }}
                onRename={handleRename}
                onDelete={handleDelete}
                renaming={renaming}
                renameValue={renameValue}
                setRenameValue={setRenameValue}
                setRenaming={setRenaming}
                formatTime={formatTime}
              />
            ))}
          </div>
        )}

        {yesterdayChats.length > 0 && (
          <div>
            <div
              className="px-1.5 py-2 text-xs font-medium tracking-wide"
              style={{
                color: 'var(--mt)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Yesterday
            </div>
            {yesterdayChats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={activeChatId === chat.id}
                onClick={() => setActiveChatId(chat.id)}
                onDoubleClick={() => {
                  setRenaming(chat.id);
                  setRenameValue(chat.title);
                }}
                onRename={handleRename}
                onDelete={handleDelete}
                renaming={renaming}
                renameValue={renameValue}
                setRenameValue={setRenameValue}
                setRenaming={setRenaming}
                formatTime={formatTime}
              />
            ))}
          </div>
        )}

        {earlierChats.length > 0 && (
          <div>
            <div
              className="px-1.5 py-2 text-xs font-medium tracking-wide"
              style={{
                color: 'var(--mt)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Earlier
            </div>
            {earlierChats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={activeChatId === chat.id}
                onClick={() => setActiveChatId(chat.id)}
                onDoubleClick={() => {
                  setRenaming(chat.id);
                  setRenameValue(chat.title);
                }}
                onRename={handleRename}
                onDelete={handleDelete}
                renaming={renaming}
                renameValue={renameValue}
                setRenameValue={setRenameValue}
                setRenaming={setRenaming}
                formatTime={formatTime}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom buttons */}
      <div
        className="p-2 flex gap-0.5 items-center"
        style={{ borderTop: '1px solid var(--bg5)' }}
      >
        <IconBtn
          icon={Settings}
          title="Settings (Ctrl+,)"
          onClick={() => setShowSettings(true)}
        />
        <IconBtn
          icon={theme === 'dark' ? Sun : Moon}
          title="Toggle theme (Ctrl+L)"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        />
        <IconBtn icon={Zap} title="Agent Mode" onClick={() => setShowWIP('Agent Mode')} />
        <IconBtn icon={Layers} title="Skills" onClick={() => setShowSettings(true)} />
      </div>
    </div>
  );
}

interface ChatItemProps {
  chat: any;
  isActive: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onRename: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  renaming: string | null;
  renameValue: string;
  setRenameValue: (value: string) => void;
  setRenaming: (id: string | null) => void;
  formatTime: (timestamp: number) => string;
}

function ChatItem({
  chat,
  isActive,
  onClick,
  onDoubleClick,
  onRename,
  onDelete,
  renaming,
  renameValue,
  setRenameValue,
  setRenaming,
  formatTime,
}: ChatItemProps) {
  const [hover, setHover] = useState(false);

  if (renaming === chat.id) {
    return (
      <input
        type="text"
        value={renameValue}
        onChange={(e) => setRenameValue(e.target.value)}
        autoFocus
        onBlur={() => onRename(chat.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onRename(chat.id);
          if (e.key === 'Escape') setRenaming(null);
        }}
        className="w-full rounded px-2 py-1.5 text-sm outline-none"
        style={{
          background: 'var(--bg3)',
          border: '1px solid var(--ac)',
          color: 'var(--tx)',
        }}
      />
    );
  }

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onContextMenu={(e) => {
        e.preventDefault();
        onDelete(chat.id, e);
      }}
      className="px-2 py-1.5 rounded mb-0.5 cursor-pointer transition-all"
      style={{
        background: isActive ? 'var(--bg4)' : 'transparent',
        color: isActive ? 'var(--tx)' : 'var(--tx2)',
      }}
    >
      <div
        className="text-sm whitespace-nowrap overflow-hidden text-ellipsis"
        style={{ lineHeight: 1.4 }}
      >
        {chat.title}
      </div>
      <div className="text-xs mt-0.5" style={{ color: 'var(--mt)' }}>
        {formatTime(chat.updated_at)}
      </div>
    </div>
  );
}