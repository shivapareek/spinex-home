"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";

/** Subtle fade-up on viewport entry. */
export function Reveal({ children, delay = 0, className, y = 24 }: { children: React.ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.6, delay, ease: [0.32, 0.72, 0, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode; dark?: boolean }) {
  return <span className="eyebrow">{children}</span>;
}

/** Section heading with optional "view all" link on the right. */
export function SectionHead({ eyebrow, title, sub, href, cta = "View all" }: { eyebrow?: string; title: string; sub?: string; href?: string; cta?: string }) {
  return (
    <div className="mb-8 flex flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="text-[28px] font-semibold leading-tight md:text-4xl">{title}</h2>
        {sub && <p className="mt-2 text-[15px] text-muted">{sub}</p>}
      </div>
      {href && (
        <Link href={href} className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink">
          {cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export function ArrowLink({ href, children, dark }: { href: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <Link href={href} className={dark ? "btn bg-white text-ink hover:bg-white/90" : "btn-primary"}>
      {children} <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
