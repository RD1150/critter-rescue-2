import React from 'react';
import CritterAvatar from './CritterAvatar';
import type { CritterData } from '../game/data';
import type { SanctuarySeason } from '../game/store';

const SEASON_LABELS: Record<SanctuarySeason, string> = { spring: 'Spring petal day', summer: 'Summer firefly evening', autumn: 'Autumn leaf dance', winter: 'Winter moon hush' };

export default function PrintableAdoptionCard({ critter, season }: { critter: CritterData; season: SanctuarySeason }) {
  return <section id="printable-adoption-card" className="print-only"><div className="print-card-frame"><header><p>Critter Rescue · Family Keepsake</p><h1>{critter.name}’s Adoption Card</h1><span>{SEASON_LABELS[season]}</span></header><div className="print-card-avatar"><CritterAvatar type={critter.type} size={112} expression="happy" /></div><p className="print-card-personality">{critter.personality}</p><div className="print-card-grid"><div><b>Pocket detail</b><p>A tiny stitched trail symbol.</p></div><div><b>Care idea</b><p>A gentle hello and one cozy spot.</p></div></div><footer>Our family promised {critter.name} a kind welcome, one calm moment, and room for happy memories.</footer></div></section>;
}
