import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Lock } from 'lucide-react';
import { useStore } from '../store/useStore';

const PROVIDERS = [
  { id: 'openrouter', name: 'OpenRouter', placeholder: 'sk-or-v1-…' },
  { id: 'nvidia', name: 'NVIDIA NIM', placeholder: 'nvapi-…' },
  { id: 'huggingface', name: 'HuggingFace', placeholder: 'hf_…' },
];

const MODELS = [
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1', provider: 'openrouter', free: true, tags: ['Reasoning', '671B'] },
  { id: 'deepseek/deepseek-chat-v3-5:free', name: 'DeepSeek V3', provider: 'openrouter', free: true, tags: ['Coding', '685B'] },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B', provider: 'openrouter', free: true, tags: ['Fast', '70B'] },
  { id: 'google/gemma-3-12b-it:free', name: 'Gemma 3 12B', provider: 'openrouter', free: true, tags: ['Reasoning', '12B'] },
  { id: 'microsoft/phi-4-mini-instruct:free', name: 'Phi-4 Mini', provider: 'openrouter', free: true, tags: ['Coding', '14B'] },
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B', provider: 'openrouter', free: true, tags: ['Fast', '7B'] },
  { id: 'meta/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', provider: 'nvidia', free: true, tags: ['Fast', '70B'] },
  { id: 'deepseek-ai/deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill', provider: 'nvidia', free: true, tags: ['Reasoning', '70B'] },
  { id: 'qwen/qwen2.5-72b-instruct', name: 'Qwen 2.5 72B', provider: 'nvidia', free: true, tags: ['Coding', '72B'] },
  { id: 'microsoft/phi-3.5-mini-instruct', name: 'Phi 3.5 Mini', provider: 'nvidia', free: true, tags: ['Fast', '3.8B'] },
  { id: 'meta-llama/Llama-3.1-8B-Instruct', name: 'Llama 3.1 8B', provider: 'huggingface', free: true, tags: ['Fast', '8B'] },
  { id: 'mistralai/Mistral-7B-Instruct-v0.3', name: 'Mistral 7B v0.3', provider: 'huggingface', free: true, tags: ['Fast', '7B'] },
  { id: 'bigcode/starcoder2-15b', name: 'StarCoder2 15B', provider: 'huggingface', free: true, tags: ['Coding', '15B'] },
];

export default function ModelDropdown() {
  const { selectedModel, setSelectedModel } = useStore();
  const [open, setOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState<Record<string, boolean>>({});
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadApiKeys = async () => {
      const keys: Record<string, boolean> = {};
      for (const provider of PROVIDERS) {
        const key = await window.electronAPI.getSetting(`api_key_${provider.id}`);
        keys[provider.id] = !!key;
      }
      setApiKeys(keys);
    };

    loadApiKeys();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sel = MODELS.find((m) => m.id === selectedModel);
  const prov = PROVIDERS.find((p) => p.id === sel?.provider);

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      Reasoning: '#c084fc',
      Coding: 'var(--success)',
      Fast: 'var(--warning)',
    };
    return colors[tag] || 'var(--mt)';
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 h-[30px] px-2.5 rounded cursor-pointer transition-all"
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--bg5)',
          color: 'var(--tx2)',
          fontSize: 12.5,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--ac)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--bg5)';
        }}
      >
        <span
          className="px-1 py-0.5 rounded text-xs font-semibold"
          style={{
            background: 'var(--ac-dim)',
            color: 'var(--ac)',
          }}
        >
          {prov?.name?.slice(0, 2).toUpperCase() || 'OR'}
        </span>
        <span>{sel?.name || 'Select model'}</span>
        <ChevronDown size={11} />
      </button>

      {open && (
        <div
          className="fade-in absolute top-[calc(100%+4px)] left-0 z-50 rounded overflow-hidden"
          style={{
            width: 300,
            background: 'var(--bg1)',
            border: '1px solid var(--bg5)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            maxHeight: 380,
            overflowY: 'auto',
          }}
        >
          {PROVIDERS.map((p) => {
            const models = MODELS.filter((m) => m.provider === p.id);
            const hasKey = apiKeys[p.id];

            return (
              <div key={p.id}>
                <div
                  className="px-3 py-2 text-xs flex items-center gap-1.5"
                  style={{
                    color: 'var(--mt)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    borderBottom: '1px solid var(--bg5)',
                  }}
                >
                  {p.name}
                  {!hasKey && (
                    <span
                      className="px-1 py-0.5 rounded text-[9.5px]"
                      style={{
                        color: 'var(--error)',
                        background: 'rgba(248,113,113,0.1)',
                      }}
                    >
                      No API key
                    </span>
                  )}
                </div>

                {models.map((m) => {
                  const locked = !hasKey;

                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        if (!locked) {
                          setSelectedModel(m.id);
                          setOpen(false);
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-all"
                      style={{
                        opacity: locked ? 0.45 : 1,
                        background: selectedModel === m.id ? 'var(--bg3)' : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!locked) {
                          e.currentTarget.style.background = 'var(--bg3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedModel !== m.id) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                      title={locked ? `Add your ${p.name} API key in Settings` : ''}
                    >
                      {locked && <Lock size={12} style={{ color: 'var(--mt)' }} />}
                      <span className="text-sm flex-1" style={{ color: 'var(--tx)' }}>
                        {m.name}
                      </span>
                      <div className="flex gap-0.5 flex-shrink-0">
                        {m.free && (
                          <span
                            className="px-1 py-0.5 rounded text-[9.5px]"
                            style={{
                              background: 'rgba(74,222,128,0.1)',
                              color: 'var(--success)',
                            }}
                          >
                            free
                          </span>
                        )}
                        {m.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-1 py-0.5 rounded text-[9.5px]"
                            style={{
                              background: 'var(--bg4)',
                              color: getTagColor(tag),
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}