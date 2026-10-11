import { ShieldCheck, Star } from "@phosphor-icons/react/dist/ssr";

/* Server-safe bits shared by the testimonials list + editor. */

export function GenuineNote() {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl bg-accent-soft px-4 py-3 text-sm text-ink/75 ring-1 ring-accent/20">
      <ShieldCheck weight="light" className="mt-0.5 h-5 w-5 shrink-0 text-accent-deep" />
      <p>
        <span className="font-medium text-ink">Only publish genuine customer feedback.</span> Copy reviews word-for-word from real buyers
        (marketplace reviews, Instagram DMs, WhatsApp) and note the source. Invented testimonials mislead customers and can breach consumer-protection rules.
      </p>
    </div>
  );
}

export function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5 text-accent" aria-label={`${n} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} weight={i <= n ? "fill" : "light"} className="h-3.5 w-3.5" />
      ))}
    </span>
  );
}
