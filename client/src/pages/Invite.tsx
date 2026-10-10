import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import { ArrowLeft, CheckCircle2, KeyRound, Route as RouteIcon } from "lucide-react";
import { useState } from "react";
import { Link, useRoute } from "wouter";

export default function Invite() {
  const [, params] = useRoute("/invite/:token");
  const token = params?.token ?? "";
  const me = trpc.auth.me.useQuery();
  const accept = trpc.clients.acceptInvitation.useMutation();
  const [accepted, setAccepted] = useState(false);

  const handleAccept = async () => {
    await accept.mutateAsync({ token });
    setAccepted(true);
  };

  return (
    <main className="min-h-screen bg-[#f6f4ee] px-5 py-10 text-[#12232a]">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="mb-12 inline-flex items-center gap-2 text-sm font-semibold text-[#55717a] hover:text-[#0f766e]"><ArrowLeft size={16} /> Back to VisionRoute</Link>
        <section className="rounded-[2rem] border border-[#dae3dd] bg-white p-8 shadow-[0_20px_70px_rgba(17,38,43,.09)] sm:p-11">
          <div className="mb-8 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0f766e] text-white"><RouteIcon size={22} /></div><span className="text-lg font-bold tracking-tight">VisionRoute</span></div>
          {accepted ? (
            <div className="space-y-5"><CheckCircle2 className="text-[#0f766e]" size={46} /><p className="eyebrow">Invitation accepted</p><h1 className="text-3xl font-semibold tracking-tight">You’re on the route.</h1><p className="leading-7 text-[#587078]">Your client workspace is ready. Complete your intake so your coach can review and approve a clear route.</p><Link href="/" className="vr-button inline-flex">Open my workspace</Link></div>
          ) : (
            <div className="space-y-6"><p className="eyebrow">Secure client invitation</p><h1 className="text-3xl font-semibold tracking-tight">Join your coaching workspace.</h1><p className="leading-7 text-[#587078]">This invitation is tied to the email address your coach used. Sign in with that account to securely join the right coaching business.</p>{!me.data ? <button onClick={startLogin} className="vr-button w-full"><KeyRound size={18} /> Sign in to accept</button> : <button onClick={handleAccept} disabled={accept.isPending} className="vr-button w-full">{accept.isPending ? "Joining workspace…" : "Accept invitation"}</button>}{accept.error && <p className="rounded-xl bg-[#fff1ec] p-3 text-sm text-[#a0442b]">{accept.error.message}</p>}</div>
          )}
        </section>
      </div>
    </main>
  );
}
