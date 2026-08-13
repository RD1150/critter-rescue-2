// Hearthlight Field Journal — collection cards and rescued-friend records.
import { CritterType, getRescuedCritters, STARTER_COMPANIONS, ZONES } from '../game/data';
import CritterAvatar from '../components/CritterAvatar';
import AudioAccessibilityPanel from '../components/AudioAccessibilityPanel';
import { hasCharacterAudio, playCharacterAudio, playCharacterStory, CharacterMoment } from '../game/characterAudio';
import { playButton } from '../game/sounds';

interface Props {
  zoneTaskProgress: Record<string, number>;
  selectedCompanion: CritterType;
  onClose: () => void;
}

export default function CritterJournalScreen({ zoneTaskProgress, selectedCompanion, onClose }: Props) {
  const rescued = getRescuedCritters(zoneTaskProgress);
  const replay = (name: string, moment: CharacterMoment) => { playButton(); playCharacterAudio(name, moment); };
  return (
    <div className="game-screen forest-bg flex flex-col">
      <div className="relative z-20 flex items-center justify-between px-4 pt-safe pt-4 pb-2">
        <div><h2 className="font-display text-2xl font-bold text-white drop-shadow">Critter Journal</h2><p className="font-body text-[10px] text-white/65">A pocket book of every friend</p></div>
        <button onClick={() => { playButton(); onClose(); }} className="paper-card px-3 py-1.5 text-sm font-body text-[#2D2418] active:scale-95">Close</button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <section className="mt-2">
          <div className="flex items-end justify-between mb-2"><h3 className="font-display font-bold text-white text-lg drop-shadow">Plushie Companion Cards</h3><span className="font-body text-[10px] text-white/65">Six to collect</span></div>
          <div className="grid grid-cols-2 gap-2">
            {STARTER_COMPANIONS.map((companion) => {
              const active = companion.type === selectedCompanion;
              return (
                <div key={companion.type} className={`paper-card p-2.5 relative overflow-hidden ${active ? 'ring-2 ring-[#E66B5B]' : 'opacity-90'}`} style={{ borderTop: active ? '3px solid #E66B5B' : undefined }}>
                  {active && <div className="absolute right-2 top-2 rounded-full bg-[#E66B5B] text-white font-body text-[8px] px-1.5 py-0.5">Your guide</div>}
                  <div className="flex gap-2 items-center"><CritterAvatar type={companion.type} size={44} expression="happy" /><div className="min-w-0"><p className="font-display font-bold text-[#2D2418] text-sm">{companion.name}</p><p className="font-body text-[9px] text-[#E66B5B]">{companion.badge}</p></div></div>
                  <p className="font-body text-[10px] text-[#5C4D3C] leading-snug mt-1.5">{companion.note}</p>
                </div>
              );
            })}
          </div>
        </section>

        {rescued.length === 0 ? (
          <div className="paper-card p-6 text-center mt-4"><p className="font-display italic text-[#5C4D3C]">No rescues yet. Head out and find a friend!</p></div>
        ) : (
          <section className="mt-4"><h3 className="font-display font-bold text-white text-lg mb-2 drop-shadow">Rescued Friends</h3><div className="grid grid-cols-2 gap-3">
            {rescued.map((critter, index) => <div key={`${critter.name}-${index}`} className="paper-card p-3 flex flex-col items-center gap-2 animate-rise-in" style={{ animationDelay: `${index * 40}ms` }}><CritterAvatar type={critter.type} size={64} expression="happy" animate /><p className="font-display font-bold text-[#2D2418] text-base">{critter.name}</p><p className="text-[#5C4D3C] text-xs font-body italic text-center">{critter.personality}</p><p className="text-[#5C4D3C] text-xs font-body text-center leading-snug">{critter.thanksLine}</p>{(['intro', 'help', 'thanks'] as CharacterMoment[]).some((moment) => hasCharacterAudio(critter.name, moment)) && <div className="flex flex-wrap justify-center gap-1 pt-0.5"><button onClick={() => { playButton(); void playCharacterStory(critter.name); }} className="rounded-full px-2 py-1 text-[9px] font-body font-bold text-white active:scale-95" style={{ background: '#E66B5B' }}>▶ Hear story</button>{(['intro', 'help', 'thanks'] as CharacterMoment[]).map((moment) => hasCharacterAudio(critter.name, moment) && <button key={moment} onClick={() => replay(critter.name, moment)} className="rounded-full px-2 py-1 text-[9px] font-body text-[#5C4D3C] active:scale-95" style={{ background: '#F7EBD8', border: '1px solid #D5C3A8' }}>🔊 {moment === 'intro' ? 'Hi' : moment === 'help' ? 'Help' : 'Thanks'}</button>)}</div>}</div>)}
          </div></section>
        )}

        <AudioAccessibilityPanel />

        <section className="mt-4"><h3 className="font-display font-bold text-white text-lg mb-2 drop-shadow">Zone Progress</h3><div className="flex flex-col gap-2">
          {ZONES.map((zone) => { const done = zoneTaskProgress[zone.id] ?? 0; return <div key={zone.id} className="paper-card px-4 py-3 flex items-center gap-3"><span className="text-2xl">{zone.emoji}</span><div className="flex-1"><p className="font-display font-bold text-[#2D2418] text-sm">{zone.name}</p><div className="flex gap-1 mt-1">{Array.from({ length: zone.totalTasks }).map((_, index) => <div key={index} className={`w-2 h-2 rounded-full ${index < done ? 'bg-[#E66B5B]' : 'bg-[#E8E4DC]'}`} />)}</div></div><span className="font-display font-bold text-[#E66B5B] text-sm">{done}/{zone.totalTasks}</span></div>; })}
        </div></section>
      </div>
    </div>
  );
}
