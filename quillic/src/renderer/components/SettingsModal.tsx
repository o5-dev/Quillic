import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../store/useStore';
import IconBtn from './IconBtn';
import Toggle from './Toggle';
import Btn from './Btn';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { theme, setTheme } = useStore();
  const [tab, setTab] = useState('general');
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [localKeys, setLocalKeys] = useState<Record<string, string>>({});
  const [savedMsg, setSavedMsg] = useState<Record<string, boolean>>({});

  const PROVIDERS = [
    { id: 'openrouter', name: 'OpenRouter', placeholder: 'sk-or-v1-…', url: 'https://openrouter.ai/keys' },
    { id: 'nvidia', name: 'NVIDIA NIM', placeholder: 'nvapi-…', url: 'https://integrate.api.nvidia.com' },
    { id: 'huggingface', name: 'HuggingFace', placeholder: 'hf_…', url: 'https://huggingface.co/settings/tokens' },
  ];

  const TABS = [
    { id: 'general', label: 'General' },
    { id: 'providers', label: 'Providers' },
    { id: 'skills', label: 'Skills' },
    { id: 'project', label: 'Project' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'shortcuts', label: 'Shortcuts' },
    { id: 'about', label: 'About' },
  ];

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    const keys: Record<string, string> = {};
    for (const provider of PROVIDERS) {
      const key = await window.electronAPI.getSetting(`api_key_${provider.id}`);
      keys[provider.id] = key || '';
    }
    setApiKeys(keys);
    setLocalKeys({ ...keys });
  };

  const saveKey = async (providerId: string) => {
    try {
      await window.electronAPI.setSetting(`api_key_${providerId}`, localKeys[providerId]);
      setApiKeys({ ...apiKeys, [providerId]: localKeys[providerId] });
      setSavedMsg({ ...savedMsg, [providerId]: true });
      setTimeout(() => setSavedMsg({ ...savedMsg, [providerId]: false }), 2000);
    } catch (error) {
      console.error('Failed to save API key:', error);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9000]"
      style={{
        background: 'rgba(0,0,0,0.72)',
        animation: 'fadeIn 0.15s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="rounded flex flex-col overflow-hidden"
        style={{
          width: 720,
          height: 540,
          background: 'var(--bg1)',
          border: '1px solid var(--bg5)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5.5 py-4 pb-3.5"
          style={{ borderBottom: '1px solid var(--bg5)', flexShrink: 0 }}
        >
          <span className="text-base font-semibold" style={{ color: 'var(--tx)' }}>
            Settings
          </span>
          <IconBtn icon={X} onClick={onClose} />
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div
            className="flex-shrink-0 overflow-y-auto p-3"
            style={{
              width: 148,
              borderRight: '1px solid var(--bg5)',
            }}
          >
            {TABS.map((t) => (
              <div
                key={t.id}
                onClick={() => setTab(t.id)}
                className="px-2.5 py-1.5 rounded cursor-pointer text-sm transition-all mb-0.5"
                style={{
                  background: tab === t.id ? 'var(--bg3)' : 'transparent',
                  color: tab === t.id ? 'var(--tx)' : 'var(--mt)',
                }}
                onMouseEnter={(e) => {
                  if (tab !== t.id) {
                    e.currentTarget.style.background = 'var(--bg2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (tab !== t.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {t.label}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 min-w-0">
            {tab === 'general' && (
              <div>
                <Row label="Theme">
                  <div className="flex gap-1.5">
                    <Btn
                      small
                      variant={theme === 'dark' ? 'accent' : 'outline'}
                      onClick={() => setTheme('dark')}
                    >
                      Dark
                    </Btn>
                    <Btn
                      small
                      variant={theme === 'light' ? 'accent' : 'outline'}
                      onClick={() => setTheme('light')}
                    >
                      Light
                    </Btn>
                  </div>
                </Row>
                <Row label="Send on Enter">
                  <Toggle value={true} onChange={() => {}} />
                </Row>
                <Row label="Auto-title chats">
                  <Toggle value={true} onChange={() => {}} />
                </Row>
                <Row label="Markdown rendering">
                  <Toggle value={true} onChange={() => {}} />
                </Row>
                <Row label="Extended thinking default">
                  <Toggle value={false} onChange={() => {}} />
                </Row>
                <Row label="Show token counts" hint="Per-message token display">
                  <Toggle value={true} onChange={() => {}} />
                </Row>
                <Row label="Require folder on new chat">
                  <Toggle value={true} onChange={() => {}} />
                </Row>
                <Row label="Chat history">
                  <div className="flex gap-1.5">
                    <Btn small variant="outline" icon={undefined}>
                      Export
                    </Btn>
                    <Btn small variant="danger" icon={undefined}>
                      Clear all
                    </Btn>
                  </div>
                </Row>
              </div>
            )}

            {tab === 'providers' && (
              <div>
                {PROVIDERS.map((p) => (
                  <div
                    key={p.id}
                    className="rounded p-3.5 mb-3.5"
                    style={{
                      background: 'var(--bg2)',
                      border: '1px solid var(--bg5)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="text-sm font-semibold" style={{ color: 'var(--tx)' }}>
                        {p.name}
                      </div>
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: localKeys[p.id] ? 'var(--success)' : 'var(--bg6)',
                        }}
                      />
                    </div>

                    <div className="flex gap-1.5">
                      <div className="flex-1 relative">
                        <input
                          type={showKeys[p.id] ? 'text' : 'password'}
                          value={localKeys[p.id] || ''}
                          onChange={(e) =>
                            setLocalKeys({ ...localKeys, [p.id]: e.target.value })
                          }
                          placeholder={p.placeholder}
                          className="w-full rounded px-2.5 py-1.5 text-xs outline-none mono"
                          style={{
                            background: 'var(--bg3)',
                            border: '1px solid var(--bg5)',
                            color: 'var(--tx)',
                            paddingRight: 36,
                          }}
                        />
                        <button
                          onClick={() =>
                            setShowKeys({ ...showKeys, [p.id]: !showKeys[p.id] })
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--mt)',
                            cursor: 'pointer',
                          }}
                        >
                          {showKeys[p.id] ? '🙈' : '👁️'}
                        </button>
                      </div>
                      <Btn
                        small
                        variant={savedMsg[p.id] ? 'outline' : 'accent'}
                        onClick={() => saveKey(p.id)}
                      >
                        {savedMsg[p.id] ? 'Saved ✓' : 'Save'}
                      </Btn>
                    </div>

                    <div className="text-xs mt-1.5" style={{ color: 'var(--mt)' }}>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--info)' }}
                      >
                        Get API key →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'skills' && (
              <div>
                <div
                  className="text-sm mb-3.5 leading-6"
                  style={{ color: 'var(--tx2)' }}
                >
                  Skills are Markdown files that instruct the AI on your coding style
                  and workflows. Upload{' '}
                  <span className="mono" style={{ color: 'var(--ac)' }}>
                    .md
                  </span>{' '}
                  files to personalise responses.
                </div>

                <div className="p-6 text-center text-sm" style={{ color: 'var(--mt)' }}>
                  No skills loaded yet. Upload a skill file below.
                </div>

                <button
                  className="w-full h-10 rounded text-sm cursor-pointer flex items-center justify-center gap-1.5 mt-1 transition-all"
                  style={{
                    border: '1.5px dashed var(--bg5)',
                    background: 'none',
                    color: 'var(--mt)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--ac)';
                    e.currentTarget.style.color = 'var(--ac)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--bg5)';
                    e.currentTarget.style.color = 'var(--mt)';
                  }}
                >
                  <Upload size={14} />
                  Upload skill file (.md)
                </button>
              </div>
            )}

            {tab === 'project' && (
              <div>
                <Row label="Default project folder">
                  <Btn small variant="outline" icon={undefined}>
                    Browse…
                  </Btn>
                </Row>
                <Row label="Auto-refresh file tree">
                  <Toggle value={true} onChange={() => {}} />
                </Row>

                <div className="text-sm font-medium mb-2" style={{ color: 'var(--tx)' }}>
                  Excluded patterns
                </div>
                <textarea
                  defaultValue="node_modules/**\n.git/**\n.next/**\ndist/**\n*.pyc\n__pycache__/**"
                  className="w-full rounded p-2.5 text-xs outline-none resize-none mono"
                  style={{
                    background: 'var(--bg2)',
                    border: '1px solid var(--bg5)',
                    color: 'var(--tx2)',
                    height: 100,
                  }}
                />
              </div>
            )}

            {tab === 'integrations' && (
              <div>
                <div
                  className="rounded p-3.5 mb-3.5"
                  style={{
                    background: 'var(--bg2)',
                    border: '1px solid var(--bg5)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-4.5 h-4 rounded flex items-center justify-center text-[10px] font-bold"
                      style={{
                        background: '#7c3aed',
                        color: '#fff',
                      }}
                    >
                      O
                    </div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--tx)' }}>
                      Obsidian Vault
                    </div>
                  </div>

                  <div className="text-xs mb-2.5" style={{ color: 'var(--mt)' }}>
                    Connect your vault so the AI can read and search your notes.
                  </div>

                  <div className="flex gap-1.5">
                    <input
                      placeholder="/home/user/Documents/MyVault"
                      className="flex-1 rounded px-2.5 py-1.5 text-xs outline-none mono"
                      style={{
                        background: 'var(--bg3)',
                        border: '1px solid var(--bg5)',
                        color: 'var(--tx)',
                      }}
                    />
                    <Btn small variant="outline" icon={undefined}>
                      Browse
                    </Btn>
                    <Btn small variant="outline" icon={undefined}>
                      Connect
                    </Btn>
                  </div>
                </div>

                <div
                  className="rounded p-3.5"
                  style={{
                    background: 'var(--bg2)',
                    border: '1px solid var(--bg5)',
                  }}
                >
                  <div className="text-sm font-semibold mb-1" style={{ color: 'var(--tx)' }}>
                    GitHub
                  </div>
                  <div className="text-xs mb-2.5" style={{ color: 'var(--mt)' }}>
                    Personal Access Token for git operations
                  </div>

                  <div className="flex gap-1.5">
                    <input
                      type="password"
                      placeholder="ghp_…"
                      className="flex-1 rounded px-2.5 py-1.5 text-xs outline-none mono"
                      style={{
                        background: 'var(--bg3)',
                        border: '1px solid var(--bg5)',
                        color: 'var(--tx)',
                      }}
                    />
                    <Btn small variant="accent" icon={undefined}>
                      Save
                    </Btn>
                  </div>
                </div>
              </div>
            )}

            {tab === 'shortcuts' && (
              <div>
                {[
                  ['Ctrl+N', 'New chat'],
                  ['Ctrl+W', 'Delete current chat'],
                  ['Ctrl+/', 'Focus input'],
                  ['Ctrl+P', 'Quick file open'],
                  ['Ctrl+Shift+F', 'Content search'],
                  ['Ctrl+`', 'Toggle terminal'],
                  ['Ctrl+B', 'Toggle sidebar'],
                  ['Ctrl+K', 'Clear chat'],
                  ['Ctrl+,', 'Settings'],
                  ['Ctrl+L', 'Toggle theme'],
                  ['Escape', 'Stop / cancel'],
                  ['Enter', 'Send'],
                  ['Shift+Enter', 'New line'],
                  ['Ctrl+Z', 'Undo last AI file write'],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between py-2 border-b"
                    style={{ borderColor: 'var(--bg5)', fontSize: 13 }}
                  >
                    <span style={{ color: 'var(--tx2)' }}>{v}</span>
                    <kbd
                      className="mono text-xs px-2 py-0.5 rounded"
                      style={{
                        background: 'var(--bg3)',
                        border: '1px solid var(--bg5)',
                        color: 'var(--tx)',
                      }}
                    >
                      {k}
                    </kbd>
                  </div>
                ))}
              </div>
            )}

            {tab === 'about' && (
              <div className="text-center pt-5">
                <div
                  className="w-14 h-14 rounded flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: 'var(--ac-dim)',
                    border: '1px solid var(--ac-border)',
                    fontSize: 22,
                    fontWeight: 700,
                    color: 'var(--ac)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  Q
                </div>
                <div className="text-xl font-semibold mb-1.5" style={{ color: 'var(--tx)' }}>
                  Quillic.ai
                </div>
                <div className="text-sm mb-1" style={{ color: 'var(--mt)' }}>
                  Version 1.0.0 · Electron 30
                </div>
                <div className="text-xs mb-5" style={{ color: 'var(--mt)' }}>
                  Node 20.x · React 18
                </div>
                <Btn variant="accent" icon={undefined}>
                  Check for updates
                </Btn>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-4.5">
      <div>
        <div className="text-sm" style={{ color: 'var(--tx)', fontWeight: 500 }}>
          {label}
        </div>
        {hint && (
          <div className="text-xs mt-0.5" style={{ color: 'var(--mt)' }}>
            {hint}
          </div>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}