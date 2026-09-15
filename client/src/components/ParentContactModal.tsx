import React, { useState } from 'react';
import { Bug, Headphones, Lightbulb, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { resolveNativeNetworkUrl } from '@/lib/nativeRuntime';

type ContactKind = 'bug' | 'suggestion' | 'support';
type Props = { open: boolean; onOpenChange: (open: boolean) => void };

export default function ParentContactModal({ open, onOpenChange }: Props) {
  const [kind, setKind] = useState<ContactKind>('support');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [confirmNoChildData, setConfirmNoChildData] = useState(false);
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const close = () => { onOpenChange(false); setStatus('idle'); setError(''); setEmail(''); setMessage(''); setConfirmNoChildData(false); setWebsite(''); };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) { setError('Please enter an email address for the grown-up support reply.'); return; }
    if (trimmedMessage.length < 12) { setError('Please add a little more detail so we can understand the request.'); return; }
    if (!confirmNoChildData) { setError('Please confirm that your note does not include child private information.'); return; }
    setStatus('sending'); setError('');
    try {
      const response = await fetch(resolveNativeNetworkUrl('/api/parent-contact'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, email: trimmedEmail, message: trimmedMessage, confirmNoChildData: true, website }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.message || 'The contact form is resting for a moment. Please try again soon.');
      setStatus('sent');
    } catch (cause) { setStatus('error'); setError(cause instanceof Error ? cause.message : 'The contact form is resting for a moment. Please try again soon.'); }
  };

  return <Dialog open={open} onOpenChange={(next) => next ? onOpenChange(true) : close()}>
    <DialogContent className="max-h-[min(760px,calc(100dvh-1.5rem))] overflow-y-auto border-[#D8C7A8] bg-[#FFF9EF] p-4 sm:p-5" showCloseButton={status !== 'sending'}>
      <DialogHeader className="text-left"><p className="font-body text-[10px] font-bold uppercase tracking-[.14em] text-[#A85C41]">Grown-up contact</p><DialogTitle className="font-display text-xl text-[#2D2418]">Contact Critter Rescue support</DialogTitle><DialogDescription className="font-body text-sm leading-relaxed text-[#5C4D3C]">Use this parent-only form for support, a bug report, or an idea. Please do not include a child’s name, photo, voice, birth date, or other private information.</DialogDescription></DialogHeader>
      {status === 'sent' ? <div className="rounded-2xl border border-[#B9D9C2] bg-[#EAF4EF] p-4 text-center"><p className="font-display text-lg font-bold text-[#27563B]">Thank you for reaching out.</p><p className="mt-1 font-body text-sm text-[#355A43]">Your message has been recorded for the grown-up support team.</p><button type="button" onClick={close} className="mt-4 min-h-12 w-full rounded-xl bg-[#3D7A58] px-4 font-body text-sm font-bold text-white active:scale-[.98]">All set</button></div> : <form onSubmit={submit} className="space-y-3">
        <fieldset><legend className="font-body text-sm font-bold text-[#49392C]">How can we help?</legend><div className="mt-2 grid grid-cols-3 gap-2"><button type="button" onClick={() => setKind('support')} aria-pressed={kind === 'support'} className={`min-h-12 rounded-xl border px-2 font-body text-xs font-bold active:scale-[.98] ${kind === 'support' ? 'border-[#3D7A58] bg-[#EAF4EF] text-[#27563B]' : 'border-[#D8C7A8] bg-white text-[#5D3D2A]'}`}><Headphones size={15} className="mr-1 inline" aria-hidden="true" />Help</button><button type="button" onClick={() => setKind('bug')} aria-pressed={kind === 'bug'} className={`min-h-12 rounded-xl border px-2 font-body text-xs font-bold active:scale-[.98] ${kind === 'bug' ? 'border-[#D75B50] bg-[#FCE6DF] text-[#7D302A]' : 'border-[#D8C7A8] bg-white text-[#5D3D2A]'}`}><Bug size={15} className="mr-1 inline" aria-hidden="true" />Bug</button><button type="button" onClick={() => setKind('suggestion')} aria-pressed={kind === 'suggestion'} className={`min-h-12 rounded-xl border px-2 font-body text-xs font-bold active:scale-[.98] ${kind === 'suggestion' ? 'border-[#7EAA82] bg-[#EAF4EF] text-[#27563B]' : 'border-[#D8C7A8] bg-white text-[#5D3D2A]'}`}><Lightbulb size={15} className="mr-1 inline" aria-hidden="true" />Idea</button></div></fieldset>
        <label className="block"><span className="font-body text-sm font-bold text-[#49392C]">Grown-up email</span><input aria-label="Grown-up email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} className="mt-2 min-h-12 w-full rounded-xl border border-[#CBB99B] bg-white px-3 font-body text-base text-[#2D2418] focus:border-[#D75B50] focus:outline-none focus:ring-2 focus:ring-[#E66B5B]/25" /></label>
        <label className="block"><span className="font-body text-sm font-bold text-[#49392C]">Message</span><textarea aria-label="Parent contact message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={1200} rows={5} placeholder="Tell us what you need help with…" className="mt-2 min-h-28 w-full resize-y rounded-xl border border-[#CBB99B] bg-white px-3 py-2.5 font-body text-base text-[#2D2418] placeholder:text-[#806C59] focus:border-[#D75B50] focus:outline-none focus:ring-2 focus:ring-[#E66B5B]/25" /></label>
        <label className="flex items-start gap-2 rounded-xl bg-[#FFF0E7] p-3"><input aria-label="Confirm no child private information" type="checkbox" checked={confirmNoChildData} onChange={(event) => setConfirmNoChildData(event.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#D75B50]" /><span className="font-body text-xs leading-relaxed text-[#5C4D3C]">I am a parent or caregiver, and this message does not include child private information.</span></label>
        <label className="sr-only" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></label>
        {error && <p role="alert" className="rounded-xl bg-[#FCE6DF] px-3 py-2 font-body text-sm font-bold text-[#8C4130]">{error}</p>}
        <button type="submit" disabled={status === 'sending'} className="min-h-12 w-full rounded-xl bg-[#D75B50] px-4 font-body text-sm font-bold text-white shadow-sm active:scale-[.98] disabled:opacity-60"><Send size={16} className="mr-1.5 inline" aria-hidden="true" />{status === 'sending' ? 'Sending gently…' : 'Send parent message'}</button>
      </form>}
    </DialogContent>
  </Dialog>;
}
