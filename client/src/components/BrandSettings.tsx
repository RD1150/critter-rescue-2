import { trpc } from "@/lib/trpc";
import type { Terminology } from "@shared/visionroute";
import { ImagePlus, Palette, Save, Sparkles } from "lucide-react";
import { FormEvent } from "react";
import { toast } from "sonner";

type TenantBrand = {
  id: string;
  organizationName: string;
  portalName: string;
  website?: string | null;
  logoUrl?: string | null;
  brandColor: string;
  welcomeMessage?: string | null;
  terminology: unknown;
};

const termKeys: Array<keyof Terminology> = ["goal", "action", "milestone", "checkIn", "reroute", "capacity", "nextAction"];
const labels: Record<keyof Terminology, string> = {
  goal: "Goal label",
  action: "Action label",
  milestone: "Milestone label",
  checkIn: "Check-in label",
  reroute: "Reroute label",
  capacity: "Capacity/readiness label",
  nextAction: "Next-action prompt",
};

export default function BrandSettings({ tenant, terminology }: { tenant: TenantBrand; terminology: Terminology }) {
  const utils = trpc.useUtils();
  const update = trpc.workspace.update.useMutation({
    onSuccess: async () => {
      await utils.workspace.bootstrap.invalidate();
      toast.success("Portal branding settings updated.");
    },
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextTerminology = Object.fromEntries(termKeys.map(key => [key, String(form.get(key) || terminology[key])])) as Terminology;
    await update.mutateAsync({
      tenantId: tenant.id,
      organizationName: String(form.get("organizationName")),
      portalName: String(form.get("portalName")),
      website: String(form.get("website") || ""),
      logoUrl: String(form.get("logoUrl") || ""),
      brandColor: String(form.get("brandColor")),
      welcomeMessage: String(form.get("welcomeMessage") || ""),
      terminology: nextTerminology,
    });
  };

  return <section className="vr-card max-w-4xl p-7 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">Portal branding</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.05em]">Make the workspace yours.</h2><p className="mt-3 max-w-2xl leading-7 text-[#5b777b]">Branding and terminology are self-service tenant configuration. They change the portal your clients see without creating a separate codebase.</p></div><div className="rounded-2xl bg-[#e5f3ed] p-3 text-[#0f766e]"><Palette size={23} /></div></div>
    <form onSubmit={submit} className="mt-8 space-y-8"><div className="grid gap-5 sm:grid-cols-2"><label><span className="field-label">Organization name</span><input className="field" name="organizationName" defaultValue={tenant.organizationName} required /></label><label><span className="field-label">Portal name</span><input className="field" name="portalName" defaultValue={tenant.portalName} required /></label><label><span className="field-label">Website (optional)</span><input className="field" name="website" type="url" defaultValue={tenant.website || ""} placeholder="https://" /></label><label><span className="field-label">Brand color</span><div className="flex gap-3"><input className="h-11 w-12 rounded-lg border border-[#d6e0da] p-1" name="brandColor" type="color" defaultValue={tenant.brandColor} /><input className="field" aria-label="Brand color hex value" defaultValue={tenant.brandColor} readOnly /></div></label><label className="sm:col-span-2"><span className="field-label">Hosted logo URL (optional)</span><div className="flex gap-3"><input className="field" name="logoUrl" type="url" defaultValue={tenant.logoUrl || ""} placeholder="https://your-domain.com/logo.svg" /><ImagePlus className="mt-2 text-[#6d8589]" size={19} /></div><span className="mt-1.5 block text-xs text-[#71888b]">Use a stable HTTPS image URL. The portal falls back to the route mark if left blank.</span></label><label className="sm:col-span-2"><span className="field-label">Welcome message</span><textarea className="field min-h-23" name="welcomeMessage" defaultValue={tenant.welcomeMessage || ""} placeholder="A focused place to keep your route moving between sessions." /></label></div>
      <div className="border-t border-[#e1e9e3] pt-8"><div className="flex items-center gap-2"><Sparkles size={17} className="text-[#0f766e]" /><div><p className="font-bold">Terminology</p><p className="mt-1 text-sm text-[#668084]">Use your own language while retaining the same universal planning objects.</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{termKeys.map(key => <label key={key}><span className="field-label">{labels[key]}</span><input className="field" name={key} defaultValue={terminology[key]} required /></label>)}</div></div>
      {update.error && <p className="rounded-xl bg-[#fff0ed] p-3 text-sm text-[#a04438]">{update.error.message}</p>}<button disabled={update.isPending} className="vr-button"><Save size={16} /> {update.isPending ? "Saving portal settings…" : "Save portal branding"}</button>
    </form>
  </section>;
}
