import { useState, useEffect, useRef, useCallback } from 'react';
import Titlebar from './components/Titlebar';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import RightPanel from './components/RightPanel';
import SettingsModal from './components/SettingsModal';
import WIPModal from './components/WIPModal';
import { useStore } from './store/useStore';
import { Chat, Message } from '@shared/types';

export default function App() {
  const {
    theme,
    sidebarOpen,
    rightOpen,
    rightTab,
    terminalOpen,
    sidebarWidth,
    rightWidth,
    terminalHeight,
    setSidebarWidth,
    setRightWidth,
    setTerminalHeight,
    activeChatId,
    chats,
    setChats,
    setActiveChatId,
    showSettings,
    setShowSettings,
    showWIP,
    setShowWIP,
  } = useStore();

  const [resizingLeft, setResizingLeft] = useState(false);
  const [resizingRight, setResizingRight] = useState(false);
  const [resizingTerm, setResizingTerm] = useState(false);

  // Resize handlers
  const startResizeLeft = useCallback((e: React.MouseEvent) => {
    setResizingLeft(true);
    e.preventDefault();
  }, []);

  const startResizeRight = useCallback((e: React.MouseEvent) => {
    setResizingRight(true);
    e.preventDefault();
  }, []);

  const startResizeTerm = useCallback((e: React.MouseEvent) => {
    setResizingTerm(true);
    e.preventDefault();
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (resizingLeft) {
        const newWidth = Math.max(150, Math.min(380, e.clientX));
        setSidebarWidth(newWidth);
      }
      if (resizingRight) {
        const windowWidth = window.innerWidth;
        const newWidth = Math.max(180, Math.min(480, windowWidth - e.clientX));
        setRightWidth(newWidth);
      }
      if (resizingTerm) {
        const windowHeight = window.innerHeight;
        const newHeight = Math.max(80, Math.min(400, windowHeight - e.clientY));
        setTerminalHeight(newHeight);
      }
    };

    const onUp = () => {
      setResizingLeft(false);
      setResizingRight(false);
      setResizingTerm(false);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [resizingLeft, resizingRight, resizingTerm, setSidebarWidth, setRightWidth, setTerminalHeight]);

  // Load chats on mount
  useEffect(() => {
    const loadChats = async () => {
      try {
        const loadedChats = await window.electronAPI.getChats();
        setChats(loadedChats);
        if (loadedChats.length > 0 && !activeChatId) {
          setActiveChatId(loadedChats[0].id);
        }
      } catch (error) {
        console.error('Failed to load chats:', error);
      }
    };

    loadChats();
  }, [setChats, setActiveChatId, activeChatId]);

  return (
    <div
      className="w-screen h-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--bg0)', color: 'var(--tx)' }}
      data-theme={theme}
    >
      <Titlebar />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <>
            <Sidebar />
            <div
              className="resize-handle"
              onMouseDown={startResizeLeft}
              style={{ width: 4, background: 'transparent', flexShrink: 0 }}
            />
          </>
        )}

        {/* Chat Area */}
        <ChatArea />

        {/* Right Panel */}
        {rightOpen && (
          <>
            <div
              className="resize-handle"
              onMouseDown={startResizeRight}
              style={{ width: 4, background: 'transparent', flexShrink: 0 }}
            />
            <RightPanel />
          </>
        )}
      </div>

      {/* Modals */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showWIP && <WIPModal title={showWIP} onClose={() => setShowWIP(null)} />}
    </div>
  );
}