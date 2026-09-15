import React from 'react';
import { playButton } from '../game/sounds';

export type ParentLegalPage = 'privacy' | 'terms' | 'faq';

interface Props {
  page: ParentLegalPage;
  onBack: () => void;
  onNavigate: (page: ParentLegalPage) => void;
}

const pageLabels: Record<ParentLegalPage, string> = {
  privacy: 'Privacy',
  terms: 'Terms',
  faq: 'FAQs',
};

function PageNavigation({ page, onNavigate }: Pick<Props, 'page' | 'onNavigate'>) {
  return <nav aria-label="Parent information pages" className="flex flex-wrap gap-2">
    {(Object.keys(pageLabels) as ParentLegalPage[]).map((key) => <button key={key} onClick={() => { playButton(); onNavigate(key); }} aria-current={page === key ? 'page' : undefined} className={`rounded-full px-3 py-2 font-body text-xs font-bold active:scale-95 ${page === key ? 'bg-[#3D7A58] text-white' : 'border border-[#D5C3A8] bg-[#FFF9EF] text-[#49392C]'}`}>{pageLabels[key]}</button>)}
  </nav>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="paper-card p-4" aria-labelledby={`${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-title`}>
    <h2 id={`${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-title`} className="font-display text-lg font-bold text-[#2D2418]">{title}</h2>
    <div className="mt-2 space-y-2 font-body text-sm leading-relaxed text-[#49392C]">{children}</div>
  </section>;
}

function PrivacyContent() {
  return <>
    <Section title="A calm, privacy-first game"><p>Critter Rescue is designed for young children and their families. The game does not ask children for names, birth dates, contact details, photos, voice recordings, or accounts. It has no child-facing advertising, social sharing, rankings, or purchases.</p></Section>
    <Section title="What stays on this device"><p>Rescue progress, sound and accessibility choices, local keepsakes, Cozy Block Studio creations, and parent-selected build ideas are saved in this browser or app on the device. They are not uploaded by these features. A grown-up can remove individual local creations or use the game reset controls.</p></Section>
    <Section title="Parent contact"><p>After a short grown-up math check, a parent or caregiver can send a support request, bug report, or idea. The form sends the chosen category, a grown-up email address, and the parent-entered message to the contact service so the team can reply or review it. Adults are asked not to include a child’s name, image, voice, birth date, or other private information.</p><p>Before a public store release, the operator will publish a final retention schedule, a monitored support contact, and a deletion-request process for adult-submitted contact messages.</p></Section>
    <Section title="Services and sharing"><p>The game uses pre-generated voice and art assets delivered from the project’s secure hosting. It does not make real-time AI requests during child play. We do not sell child data or use child data for behavioral advertising.</p></Section>
    <Section title="Parent choices and questions"><p>For the current private beta, use the math-gated grown-up contact form for non-sensitive questions and do not include child information. Before public release, this page will be updated with the operator’s legal name, support email, mailing address, final data-retention schedule, and privacy-request instructions.</p></Section>
  </>;
}

function TermsContent() {
  return <>
    <Section title="Working draft for parent review"><p>These Terms of Use are a working draft for the Critter Rescue beta, not a substitute for legal advice. They must be reviewed and completed with the operator’s legal name, contact details, governing law, and final release terms before public distribution.</p></Section>
    <Section title="Family use"><p>Critter Rescue is a calm play experience for children with parent or guardian involvement. A grown-up is responsible for deciding whether the app is appropriate for their family, supervising any parent-only areas, and using the app in line with applicable law.</p></Section>
    <Section title="License and respectful use"><p>We grant a limited, personal, non-transferable right to use the beta game for family testing. Do not copy, sell, rent, reverse engineer, disrupt, or use the game to collect or share personal information about children. Do not submit private child information through the parent contact form.</p></Section>
    <Section title="Local creations and feedback"><p>Cozy Block Studio creations and parent-authored build ideas stay on the device unless a grown-up chooses to submit a separate parent contact message. You keep responsibility for the text a grown-up enters, and the team may use non-sensitive feedback to improve the game.</p></Section>
    <Section title="Changes and availability"><p>The beta may change, pause, or be removed as the game is improved. Features may vary by device and release. The app currently has no child-facing purchases, rewards for purchases, advertising, or social sharing.</p></Section>
    <Section title="Privacy"><p>Please read the Privacy Policy for the current data-practice description. Before public launch, the completed Terms will state a monitored support route and the governing legal terms for the released product.</p></Section>
  </>;
}

function FAQContent() {
  const faqs = [
    ['What is Critter Rescue?', 'A calm preschool rescue game with picture-led planning, matching, sorting, early time play, care moments, and open-ended block building. There are no timers, scores, rankings, or streaks.'],
    ['How do we start a rescue?', 'Choose a large trail card in camp, then follow one small picture-led action at a time. A child can explore at their own pace and return to camp whenever they need.'],
    ['Can my child use spoken directions?', 'Yes. Nutty’s directions are optional, tap-to-play only, and never start on their own. A grown-up can turn spoken directions, captions, volume, large icons, and Reduce Motion on or off in Parent Settings.'],
    ['Are Cozy Block Studio builds shared online?', 'No. Saved creations, custom parent prompts, and prompt choices are stored only on the current device. A grown-up can open or remove saved builds at any time.'],
    ['Who can add new build ideas?', 'Only a grown-up using Parent Settings can create, select, hide, or remove a short local build idea. Children see only ideas a grown-up has chosen, plus the permanent Build my own option.'],
    ['Is there a Holiday Edition?', 'Yes. A grown-up can choose it in Parent Settings. Children see calm, neutral trails about lights, sharing, and kindness rather than holiday shopping or pressure.'],
    ['Are there ads, purchases, or social features?', 'No. The game currently has no child-facing advertising, purchases, social sharing, public profiles, chat, photo uploads, or voice recording.'],
    ['How does parent contact work?', 'After the grown-up math check, a parent can send a support request, bug report, or idea. The form asks for a grown-up email and a short message, and asks adults not to include child private information.'],
    ['How can a parent get help?', 'After the grown-up math check, use the contact form for non-sensitive questions. Before public release, this page will list a monitored support email and formal privacy-request route.'],
  ] as const;
  return <section className="space-y-3" aria-label="Frequently asked questions">{faqs.map(([question, answer]) => <details key={question} className="paper-card group p-4"><summary className="cursor-pointer font-display text-base font-bold text-[#2D2418] marker:text-[#3D7A58]">{question}</summary><p className="mt-3 font-body text-sm leading-relaxed text-[#49392C]">{answer}</p></details>)}</section>;
}

export default function ParentLegalScreen({ page, onBack, onNavigate }: Props) {
  const heading = page === 'privacy' ? 'Privacy Policy' : page === 'terms' ? 'Terms of Use' : 'Parent FAQs';
  return <div className="game-screen forest-bg overflow-y-auto px-4 pb-8">
    <header className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 pb-4 pt-[max(2rem,env(safe-area-inset-top))]"><div><p className="font-body text-[10px] font-bold uppercase tracking-[.14em] text-white/70">Grown-up information</p><h1 className="font-display text-2xl font-bold text-white">{heading}</h1></div><button onClick={() => { playButton(); onBack(); }} className="paper-card shrink-0 px-3 py-2 font-body text-sm text-[#2D2418] active:scale-95">Back to Parent Settings</button></header>
    <main className="mx-auto w-full max-w-2xl space-y-4"><div className="rounded-2xl border border-[#E2C9AB] bg-[#FFF8E8] p-4"><p className="font-body text-xs font-bold uppercase tracking-[.14em] text-[#A85C41]">Last updated September 15, 2026</p><p className="mt-1 font-body text-sm leading-relaxed text-[#49392C]">These pages are written for grown-ups. Before a public store release, have a qualified attorney review and complete the operator, support, retention, and jurisdiction details.</p><div className="mt-3"><PageNavigation page={page} onNavigate={onNavigate} /></div></div>{page === 'privacy' ? <PrivacyContent /> : page === 'terms' ? <TermsContent /> : <FAQContent />}</main>
  </div>;
}
