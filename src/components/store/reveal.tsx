"use client";

import Link from "next/link";
import { motion } from "framer-motion";

/** Heavy fade-up on viewport entry (IntersectionObserver via framer whileInView). */
export function Reveal({ children, delay = 0, className, y = 48 }: { children: React.ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.95, delay, ease: [0.32, 0.72, 0, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Eyebrow({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span className={`eyebrow ${dark ? "bg-white/[0.06] text-gold-bright ring-1 ring-gold/25" : "bg-maroon/[0.07] text-maroon ring-1 ring-maroon/10"}`}>
      <span className={`h-1 w-1 rounded-full ${dark ? "bg-gold-bright" : "bg-maroon"}`} />
      {children}
    </span>
  );
}

export function ArrowLink({ href, children, dark }: { href: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <Link href={href} className={`group inline-flex h-12 items-center gap-3 rounded-full pl-6 pr-1.5 text-sm font-medium transition active:scale-[0.98] ${dark ? "bg-ivory text-ink hover:bg-gold-bright" : "bg-ink text-ivory hover:bg-maroon"}`}>
      {children}
      <span className={`grid h-9 w-9 place-items-center rounded-full transition-transform duration-500 ease-silk group-hover:-translate-y-px group-hover:translate-x-1 ${dark ? "bg-ink text-gold-bright" : "bg-gold text-ink"}`}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17 17 7M8 7h9v9" /></svg>
      </span>
    </Link>
  );
}
