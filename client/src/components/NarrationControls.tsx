// Hearthlight Field Journal — compact, accessible narration controls.
import React, { useEffect, useState } from 'react';
import { isNarrationEnabled, narrationSupported, setNarrationEnabled, speakNarration } from '../game/narration';

interface Props {
  text?: string;
  tone?: 'critter' | 'guide';
  compact?: boolean;
}

export default function NarrationControls({ text, tone = 'guide', compact = false }: Props) {
  const [supported] = useState(() => narrationSupported());
  const [enabled, setEnabled] = useState(() => isNarrationEnabled());
  useEffect(() => {
    const refresh = () => setEnabled(isNarrationEnabled());
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);
  if (!supported) return null;
  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setNarrationEnabled(next);
    if (next && text) speakNarration(text, tone);
  };
  return (
    <div className={`flex items-center gap-1 ${compact ? '' : 'justify-center'}`}>
      {text && <button type="button" onClick={() => speakNarration(text, tone)} className="rounded-lg px-2 py-1 text-xs font-body transition-transform active:scale-95" style={{ color: '#5C4D3C', background: '#F7EBD8', border: '1px solid #D5C3A8' }} aria-label="Read this message aloud">🔊</button>}
      <button type="button" onClick={toggle} className="rounded-lg px-2 py-1 text-[10px] font-body transition-transform active:scale-95" style={{ color: enabled ? '#A43E35' : '#5C4D3C', background: enabled ? '#FBE1DC' : '#F7EBD8', border: `1px solid ${enabled ? '#E66B5B' : '#D5C3A8'}` }} aria-pressed={enabled} aria-label={enabled ? 'Turn narration off' : 'Turn narration on'}>
        {enabled ? 'Voice on' : 'Voice off'}
      </button>
    </div>
  );
}
