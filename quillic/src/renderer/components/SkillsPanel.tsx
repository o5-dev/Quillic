import { useState, useEffect } from 'react';
import { Layers, Upload } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Skill } from '@shared/types';
import Toggle from './Toggle';

export default function SkillsPanel() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const loadedSkills = await window.electronAPI.listSkills();
      setSkills(loadedSkills);
    } catch (error) {
      console.error('Failed to load skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (skillId: string, active: boolean) => {
    // In a real app, this would update the skill's active state
    setSkills(skills.map((s) => (s.id === skillId ? { ...s, active } : s)));
  };

  const handleUpload = async () => {
    try {
      const result = await window.electronAPI.openFile({
        filters: [{ name: 'Markdown', extensions: ['md'] }],
      });

      if (result.canceled || result.filePaths.length === 0) return;

      const filePath = result.filePaths[0];
      const content = await window.electronAPI.readFile(filePath);
      const filename = filePath.split(/[/\\]/).pop() || 'skill.md';

      await window.electronAPI.addSkill(filename, content);
      await loadSkills();
    } catch (error) {
      console.error('Failed to upload skill:', error);
    }
  };

  const handleRemove = async (skillId: string) => {
    if (!confirm('Are you sure you want to remove this skill?')) return;

    try {
      await window.electronAPI.removeSkill(skillId);
      await loadSkills();
    } catch (error) {
      console.error('Failed to remove skill:', error);
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto p-2">
        <div
          className="text-xs mb-3 leading-6"
          style={{ color: 'var(--mt)' }}
        >
          Active skills shape how the AI responds. Upload{' '}
          <span className="mono" style={{ color: 'var(--ac)' }}>
            .md
          </span>{' '}
          files.
        </div>

        {loading ? (
          <div className="p-6 text-center text-sm" style={{ color: 'var(--mt)' }}>
            Loading skills…
          </div>
        ) : skills.length === 0 ? (
          <div className="p-6 text-center text-sm" style={{ color: 'var(--mt)' }}>
            No skills loaded yet.
          </div>
        ) : (
          skills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center gap-2.5 rounded p-2.5 mb-1.5"
              style={{
                background: 'var(--bg2)',
                border: '1px solid var(--bg5)',
              }}
            >
              <Layers size={14} style={{ color: 'var(--ac)' }} />
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: 'var(--tx)' }}>
                  {skill.name}
                </div>
                <div className="text-xs" style={{ color: 'var(--mt)' }}>
                  {skill.description}
                </div>
              </div>
              <Toggle
                value={true}
                onChange={(v) => handleToggle(skill.id, v)}
              />
            </div>
          ))
        )}
      </div>

      {/* Upload button */}
      <button
        onClick={handleUpload}
        className="w-full h-9 rounded text-sm cursor-pointer flex items-center justify-center gap-1.5 mt-1 transition-all"
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
        <Upload size={13} />
        Upload skill (.md)
      </button>
    </div>
  );
}