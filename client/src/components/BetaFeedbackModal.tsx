import React, { useState } from 'react';
import { Bug, Lightbulb, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

type FeedbackKind = 'bug' | 'suggestion';
type Props = { open: boolean; onOpenChange: (open: boolean) => void };

export default function BetaFeedbackModal({ open, onOpenChange }: Props) {
  const [kind, setKind] = useState<FeedbackKind>('bug');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const close = () => {
    onOpenChange(false);
    setStatus('idle');
    setError('');
    setMessage('');
  };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const note = message.trim();
    if (note.length < 4) { setError('Please add a few words so we can understand your note.'); return; }
    setStatus('sending');
    setError('');
    try {
      const response = await fetch('/api/beta-feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, message: note, context: 'Parent Settings · beta' }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.message || 'Feedback is resting for a moment. Please try again soon.');
      setStatus('sent');
    } catch (cause) {
      setStatus('error');
      setError(cause instanceof Error ? cause.message : 'Feedback is resting for a moment. Please try again soon.');
    }
  };

  return <Dialog open={open} onOpenChange={(next) => next ? onOpenChange(true) : close()}>
    <DialogContent className="max-h-[min(720px,calc(100dvh-1.5rem))] overflow-y-auto border-[#D8C7A8] bg-[#FFF9EF] p-4 sm:p-5" showCloseButton={status !== 'sending'}>
      <DialogHeader className="text-left"><p className="font-body text-[10px] font-bold uppercase tracking-[.14em] text-[#A85C41]">Grown-up beta feedback</p><DialogTitle className="font-display text-xl text-[#2D2418]">Help the sanctuary grow gently</DialogTitle><DialogDescription className="font-body text-sm leading-relaxed text-[#5C4D3C]">Share a bug or an idea from your own point of view. Please do not include a child’s name, photo, voice, or private details.</DialogDescription></DialogHeader>
      {status === 'sent' ? <div className="rounded-2xl border border-[#B9D9C2] bg-[#EAF4EF] p-4 text-center"><p className="font-display text-lg font-bold text-[#27563B]">Thank you for helping.</p><p className="mt-1 font-body text-sm text-[#355A43]">Your note is safely on its way to the grown-up team.</p><button type="button" onClick={close} className="mt-4 min-h-12 w-full rounded-xl bg-[#3D7A58] px-4 font-body text-sm font-bold text-white active:scale-[.98]">All set</button></div> : <form onSubmit={submit} className="space-y-3">
        <fieldset><legend className="font-body text-sm font-bold text-[#49392C]">What would you like to share?</legend><div className="mt-2 grid grid-cols-2 gap-2"><button type="button" onClick={() => setKind('bug')} aria-pressed={kind === 'bug'} className={`min-h-12 rounded-xl border px-3 font-body text-sm font-bold active:scale-[.98] ${kind === 'bug' ? 'border-[#D75B50] bg-[#FCE6DF] text-[#7D302A]' : 'border-[#D8C7A8] bg-white text-[#5D3D2A]'}`}><Bug size={16} className="mr-1 inline" aria-hidden="true" />Something went wrong</button><button type="button" onClick={() => setKind('suggestion')} aria-pressed={kind === 'suggestion'} className={`min-h-12 rounded-xl border px-3 font-body text-sm font-bold active:scale-[.98] ${kind === 'suggestion' ? 'border-[#7EAA82] bg-[#EAF4EF] text-[#27563B]' : 'border-[#D8C7A8] bg-white text-[#5D3D2A]'}`}><Lightbulb size={16} className="mr-1 inline" aria-hidden="true" />An idea</button></div></fieldset>
        <label className="block"><span className="font-body text-sm font-bold text-[#49392C]">Your note</span><textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={1200} rows={5} placeholder="Tell us what you noticed…" className="mt-2 min-h-28 w-full resize-y rounded-xl border border-[#CBB99B] bg-white px-3 py-2.5 font-body text-base text-[#2D2418] placeholder:text-[#806C59] focus:border-[#D75B50] focus:outline-none focus:ring-2 focus:ring-[#E66B5B]/25" /></label>
        {error && <p role="alert" className="rounded-xl bg-[#FCE6DF] px-3 py-2 font-body text-sm font-bold text-[#8C4130]">{error}</p>}
        <button type="submit" disabled={status === 'sending'} className="min-h-12 w-full rounded-xl bg-[#D75B50] px-4 font-body text-sm font-bold text-white shadow-sm active:scale-[.98] disabled:opacity-60"><Send size={16} className="mr-1.5 inline" aria-hidden="true" />{status === 'sending' ? 'Sending gently…' : 'Send feedback'}</button>
      </form>}
    </DialogContent>
  </Dialog>;
}
