"use client";

/**
 * Illustrated, animated scenes for the "See it in your space" visualizer.
 * All scenes share a 1600×1000 viewBox rendered with `slice`, and are composed so the
 * idol's anchor sits at x = 50% — that keeps placement correct in both landscape and
 * portrait crops. Anchor Y (fraction of height) and default scale come from the DB `scenes` table.
 */
import { useId } from "react";
import { cn } from "@/lib/utils";

export type BuiltInScene = "car" | "temple" | "desk" | "shelf";

export const SCENE_LOOK: Record<BuiltInScene | "photo" | "camera", { filter: string; shadow: string; glow?: string }> = {
  car: { filter: "brightness(1.03) saturate(1.05) contrast(1.02)", shadow: "rgba(0,0,0,0.6)", glow: "rgba(255,214,150,0.25)" },
  temple: { filter: "brightness(1.02) saturate(1.08) sepia(0.06)", shadow: "rgba(20,4,2,0.75)", glow: "rgba(255,170,70,0.45)" },
  desk: { filter: "brightness(1.02) saturate(1.02)", shadow: "rgba(60,36,18,0.45)" },
  shelf: { filter: "brightness(1) saturate(1.03) sepia(0.04)", shadow: "rgba(30,20,10,0.5)", glow: "rgba(255,200,140,0.18)" },
  photo: { filter: "none", shadow: "rgba(0,0,0,0.45)" },
  camera: { filter: "none", shadow: "rgba(0,0,0,0.4)" },
};

type P = { className?: string; animated?: boolean };
/** Round computed coordinates so SSR and client markup match exactly. */
const r = (n: number) => Math.round(n * 100) / 100;
const svgProps = { viewBox: "0 0 1600 1000", preserveAspectRatio: "xMidYMid slice", xmlns: "http://www.w3.org/2000/svg" } as const;

export function SceneArt({ kind, ...p }: P & { kind: BuiltInScene }) {
  if (kind === "car") return <CarScene {...p} />;
  if (kind === "temple") return <TempleScene {...p} />;
  if (kind === "desk") return <DeskScene {...p} />;
  return <ShelfScene {...p} />;
}

/* ───────────────────────────── Car dashboard ───────────────────────────── */
export function CarScene({ className, animated = true }: P) {
  const u = useId().replace(/:/g, "");
  return (
    <svg {...svgProps} className={cn("absolute inset-0 h-full w-full", className)} aria-hidden>
      <defs>
        <linearGradient id={`${u}car-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F2B978" />
          <stop offset=".45" stopColor="#F6D7A7" />
          <stop offset=".62" stopColor="#E9DCC6" />
        </linearGradient>
        <radialGradient id={`${u}car-sun`} cx="0.74" cy="0.3" r="0.45">
          <stop offset="0" stopColor="#FFF4D6" stopOpacity=".95" />
          <stop offset=".25" stopColor="#FFD58F" stopOpacity=".55" />
          <stop offset="1" stopColor="#FFD58F" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${u}car-road`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8A817A" />
          <stop offset="1" stopColor="#4C4642" />
        </linearGradient>
        <linearGradient id={`${u}car-dash`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4A4442" />
          <stop offset=".08" stopColor="#2E2A29" />
          <stop offset=".6" stopColor="#1A1817" />
          <stop offset="1" stopColor="#121110" />
        </linearGradient>
        <linearGradient id={`${u}car-face`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1B1918" />
          <stop offset="1" stopColor="#0B0A0A" />
        </linearGradient>
        <linearGradient id={`${u}car-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".16" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${u}car-dashglare`} cx=".62" cy=".05" r=".5">
          <stop offset="0" stopColor="#FFE2B0" stopOpacity=".28" />
          <stop offset="1" stopColor="#FFE2B0" stopOpacity="0" />
        </radialGradient>
        <filter id={`${u}car-blur4`}><feGaussianBlur stdDeviation="5" /></filter>
        <filter id={`${u}car-blur2`}><feGaussianBlur stdDeviation="2" /></filter>
      </defs>

      {/* Outside world */}
      <rect width="1600" height="700" fill={`url(#${u}car-sky)`} />
      <rect width="1600" height="700" fill={`url(#${u}car-sun)`} />
      <g transform="translate(0 -115)">
      <rect y="520" width="1600" height="300" fill="#A49A7C" />
      <rect y="520" width="1600" height="300" fill="#C9B48A" opacity=".35" />
      <g filter={`url(#${u}car-blur4)`}>
        <path d="M0 520 C 200 455 330 470 470 490 C 620 440 760 470 860 500 C 1000 450 1150 455 1300 488 C 1420 460 1520 470 1600 480 L1600 560 L0 560 Z" fill="#B7A08A" opacity=".55" />
        <path d="M0 545 C 180 505 300 515 420 530 C 520 505 640 520 720 540 L 880 540 C 980 512 1120 505 1250 528 C 1380 506 1500 515 1600 525 L1600 580 L0 580Z" fill="#8F8573" opacity=".7" />
        {/* tree lines */}
        {[...Array(14)].map((_, i) => (
          <ellipse key={`l${i}`} cx={40 + i * 48} cy={560 - (i % 3) * 10} rx={42 - i} ry={34 - (i % 4) * 4} fill={i % 2 ? "#6E7A55" : "#5F6B49"} opacity=".85" />
        ))}
        {[...Array(14)].map((_, i) => (
          <ellipse key={`r${i}`} cx={1560 - i * 48} cy={560 - (i % 3) * 10} rx={42 - i} ry={34 - (i % 4) * 4} fill={i % 2 ? "#6E7A55" : "#5F6B49"} opacity=".85" />
        ))}
      </g>
      {/* Road */}
      <path d="M770 545 L830 545 L1700 1120 L-100 1120 Z" fill={`url(#${u}car-road)`} />
      <path d="M770 545 L-60 1120" stroke="#EDE6DA" strokeWidth="6" opacity=".7" />
      <path d="M830 545 L1660 1120" stroke="#EDE6DA" strokeWidth="6" opacity=".7" />
      <path
        d="M800 548 L800 1120"
        stroke="#F4E9C9"
        strokeWidth="10"
        strokeDasharray="34 46"
        className={animated ? "[animation:carlane_0.9s_linear_infinite]" : undefined}
        style={{ transformOrigin: "800px 548px", transform: "scaleX(1)" }}
      />
      </g>
      {/* Windshield reflection */}
      <path d="M260 40 L760 40 L420 640 L160 640 Z" fill={`url(#${u}car-glass)`} />
      <path d="M980 40 L1200 40 L1060 640 L940 640 Z" fill={`url(#${u}car-glass)`} opacity=".6" />

      {/* A-pillars & roof */}
      <path d="M0 0 L1600 0 L1600 46 C 1200 70 400 70 0 46 Z" fill="#141313" />
      <path d="M0 40 L170 60 L60 690 L0 720 Z" fill="#151414" />
      <path d="M1600 40 L1430 60 L1540 690 L1600 720 Z" fill="#151414" />
      {/* Rear-view mirror */}
      <rect x="788" y="44" width="24" height="46" rx="8" fill="#1d1c1c" />
      <rect x="650" y="84" width="300" height="78" rx="30" fill="#1f1e1e" />
      <rect x="664" y="96" width="272" height="54" rx="22" fill="#6E6A66" />
      <rect x="664" y="96" width="272" height="54" rx="22" fill={`url(#${u}car-glass)`} />
      {/* Hanging mala from mirror */}
      <g className={animated ? "origin-[800px_162px] animate-swing" : undefined}>
        <path d="M790 160 Q 800 230 810 160" fill="none" stroke="#C9A24A" strokeWidth="3" />
        {[...Array(9)].map((_, i) => {
          const t = i / 8;
          const x = r(790 + 20 * t);
          const y = r(160 + 70 * 4 * t * (1 - t));
          return <circle key={i} cx={x} cy={y} r="4.2" fill={i % 2 ? "#8B2E1A" : "#C9A24A"} />;
        })}
        <circle cx="800" cy="240" r="9" fill="#C9A24A" />
      </g>

      {/* Dashboard top surface */}
      <path d="M0 640 C 280 600 560 585 800 585 C 1040 585 1320 600 1600 640 L1600 1000 L0 1000 Z" fill={`url(#${u}car-dash)`} />
      <path d="M0 640 C 280 600 560 585 800 585 C 1040 585 1320 600 1600 640" fill="none" stroke="#6A625C" strokeWidth="2.5" opacity=".7" />
      {/* defroster slots */}
      {[...Array(18)].map((_, i) => (
        <rect key={i} x={560 + i * 27} y={598} width="17" height="5" rx="2.5" fill="#0E0D0D" opacity=".85" />
      ))}
      <ellipse cx="1000" cy="640" rx="620" ry="70" fill={`url(#${u}car-dashglare)`} />
      {/* Dashboard face with stitching */}
      <path d="M0 820 C 400 778 1200 778 1600 820 L1600 1000 L0 1000 Z" fill={`url(#${u}car-face)`} />
      <path d="M0 826 C 400 785 1200 785 1600 826" fill="none" stroke="#9C8458" strokeWidth="2" strokeDasharray="10 9" opacity=".55" />
      {/* Center vents */}
      {[620, 860].map((x) => (
        <g key={x}>
          <rect x={x} y="860" width="120" height="62" rx="16" fill="#070707" stroke="#2A2827" strokeWidth="3" />
          {[0, 1, 2, 3].map((k) => (
            <rect key={k} x={x + 10} y={872 + k * 12} width="100" height="4" rx="2" fill="#2B2928" />
          ))}
        </g>
      ))}
      {/* Steering wheel (partial) */}
      <g opacity=".96">
        <circle cx="260" cy="1110" r="280" fill="none" stroke="#0C0B0B" strokeWidth="58" />
        <circle cx="260" cy="1110" r="280" fill="none" stroke="#2F2B29" strokeWidth="4" strokeDasharray="1 14" opacity=".6" />
        <path d="M260 1110 L 70 930" stroke="#0C0B0B" strokeWidth="44" strokeLinecap="round" />
      </g>
      <style>{`@keyframes carlane{to{stroke-dashoffset:-80}}`}</style>
    </svg>
  );
}

/* ───────────────────────────── Home mandir ───────────────────────────── */
export function TempleScene({ className, animated = true }: P) {
  const u = useId().replace(/:/g, "");
  const flame = (cx: number) => (
    <g key={cx}>
      <circle cx={cx} cy="700" r="150" fill={`url(#${u}tm-diyaglow)`} className={animated ? "animate-[pulse_3s_ease-in-out_infinite]" : undefined} />
      <path d={`M${cx - 46} 742 Q ${cx} 790 ${cx + 46} 742 L ${cx + 36} 732 L ${cx - 36} 732 Z`} fill="#B5612B" />
      <path d={`M${cx - 46} 742 Q ${cx} 790 ${cx + 46} 742`} fill="none" stroke="#7E3A15" strokeWidth="3" />
      <ellipse cx={cx} cy="734" rx="38" ry="6" fill="#5E2A0E" />
      <g style={{ transformOrigin: `${cx}px 732px` }} className={animated ? "animate-flicker" : undefined}>
        <path d={`M${cx} 668 C ${cx + 16} 694 ${cx + 14} 724 ${cx} 732 C ${cx - 14} 724 ${cx - 16} 694 ${cx} 668 Z`} fill="#FFB547" />
        <path d={`M${cx} 690 C ${cx + 8} 706 ${cx + 7} 724 ${cx} 730 C ${cx - 7} 724 ${cx - 8} 706 ${cx} 690 Z`} fill="#FFF3C4" />
      </g>
    </g>
  );
  // Marigold toran along a catenary
  const toran = [...Array(33)].map((_, i) => {
    const t = i / 32;
    const x = r(455 + 690 * t);
    const y = r(352 + 60 * 4 * t * (1 - t));
    return <circle key={i} cx={x} cy={y} r="13" fill={i % 2 ? "#F29A1F" : "#F7C531"} stroke="#C8701A" strokeWidth="1.5" />;
  });
  const strands = [0.12, 0.31, 0.5, 0.69, 0.88].map((t, k) => {
    const x = r(455 + 690 * t);
    const y0 = r(352 + 60 * 4 * t * (1 - t));
    return (
      <g key={k}>
        {[...Array(4)].map((_, j) => (
          <circle key={j} cx={x} cy={y0 + 22 + j * 21} r="10.5" fill={(j + k) % 2 ? "#F29A1F" : "#F7C531"} stroke="#C8701A" strokeWidth="1.2" />
        ))}
        <path d={`M${x} ${y0 + 100} q -12 18 0 34 q 12 -16 0 -34`} fill="#4E7A35" />
      </g>
    );
  });
  const bell = (x: number) => (
    <g key={x} style={{ transformOrigin: `${x}px 420px` }} className={animated ? "animate-swing" : undefined}>
      <line x1={x} y1="420" x2={x} y2="500" stroke="#C9A24A" strokeWidth="3" />
      <path d={`M${x - 22} 540 C ${x - 22} 505 ${x - 14} 496 ${x} 496 C ${x + 14} 496 ${x + 22} 505 ${x + 22} 540 Z`} fill={`url(#${u}tm-gold)`} />
      <rect x={x - 26} y="538" width="52" height="7" rx="3.5" fill="#94701F" />
      <circle cx={x} cy="550" r="5" fill="#94701F" />
    </g>
  );
  return (
    <svg {...svgProps} className={cn("absolute inset-0 h-full w-full", className)} aria-hidden>
      <defs>
        <linearGradient id={`${u}tm-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2B130C" />
          <stop offset="1" stopColor="#170906" />
        </linearGradient>
        <pattern id={`${u}tm-jaali`} width="44" height="44" patternUnits="userSpaceOnUse">
          <path d="M22 4 L40 22 L22 40 L4 22 Z" fill="none" stroke="#E9CC7A" strokeWidth="1.2" />
        </pattern>
        <linearGradient id={`${u}tm-wood`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5A3216" />
          <stop offset=".5" stopColor="#8A5426" />
          <stop offset="1" stopColor="#5A3216" />
        </linearGradient>
        <linearGradient id={`${u}tm-woodv`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B07A45" />
          <stop offset="1" stopColor="#7A4A22" />
        </linearGradient>
        <linearGradient id={`${u}tm-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F3E6C2" />
          <stop offset=".4" stopColor="#E0BC62" />
          <stop offset="1" stopColor="#94701F" />
        </linearGradient>
        <radialGradient id={`${u}tm-velvet`} cx=".5" cy=".45" r=".7">
          <stop offset="0" stopColor="#8E1A2C" />
          <stop offset=".7" stopColor="#4E0B17" />
          <stop offset="1" stopColor="#2A050C" />
        </radialGradient>
        <radialGradient id={`${u}tm-halo`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#FFD98A" stopOpacity=".55" />
          <stop offset=".6" stopColor="#E9A94A" stopOpacity=".12" />
          <stop offset="1" stopColor="#E9A94A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${u}tm-diyaglow`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#FFC567" stopOpacity=".55" />
          <stop offset="1" stopColor="#FF9A3C" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${u}tm-vignette`} cx=".5" cy=".55" r=".75">
          <stop offset=".55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".6" />
        </radialGradient>
        <clipPath id={`${u}tm-arch`}>
          <path d="M470 820 L470 470 C 470 430 500 410 530 404 C 540 360 590 330 640 334 C 670 290 730 262 800 262 C 870 262 930 290 960 334 C 1010 330 1060 360 1070 404 C 1100 410 1130 430 1130 470 L1130 820 Z" />
        </clipPath>
      </defs>

      <rect width="1600" height="1000" fill={`url(#${u}tm-wall)`} />
      <rect width="1600" height="1000" fill={`url(#${u}tm-jaali)`} opacity=".06" />

      {/* Shikhara */}
      <path d="M800 18 C 830 60 900 90 930 150 L 990 230 L 610 230 L 670 150 C 700 90 770 60 800 18 Z" fill={`url(#${u}tm-wood)`} />
      <path d="M800 0 L812 22 L800 34 L788 22 Z" fill={`url(#${u}tm-gold)`} />
      <circle cx="800" cy="44" r="12" fill={`url(#${u}tm-gold)`} />
      <path d="M520 120 C 540 150 590 170 600 230 L 440 230 C 450 170 500 150 520 120 Z" fill={`url(#${u}tm-wood)`} />
      <path d="M1080 120 C 1100 150 1150 170 1160 230 L 1000 230 C 1010 170 1060 150 1080 120 Z" fill={`url(#${u}tm-wood)`} />
      {[520, 1080].map((x) => <circle key={x} cx={x} cy="114" r="9" fill={`url(#${u}tm-gold)`} />)}
      <rect x="340" y="226" width="920" height="40" rx="6" fill={`url(#${u}tm-woodv)`} />
      <rect x="340" y="258" width="920" height="10" fill="#4A2810" />
      {[...Array(23)].map((_, i) => <circle key={i} cx={360 + i * 40} cy="246" r="5" fill="#E0BC62" opacity=".8" />)}

      {/* Pillars */}
      {[360, 1150].map((x) => (
        <g key={x}>
          <rect x={x} y="266" width="90" height="560" fill={`url(#${u}tm-wood)`} />
          {[330, 470, 610, 750].map((y) => (
            <g key={y}>
              <rect x={x - 6} y={y} width="102" height="16" rx="4" fill={`url(#${u}tm-woodv)`} />
              <rect x={x + 10} y={y + 26} width="70" height="80" rx="35" fill="none" stroke="#C99A55" strokeOpacity=".35" strokeWidth="2" />
            </g>
          ))}
        </g>
      ))}

      {/* Sanctum */}
      <g clipPath={`url(#${u}tm-arch)`}>
        <rect x="450" y="250" width="700" height="600" fill={`url(#${u}tm-velvet)`} />
        <g opacity=".22" stroke="#E9CC7A" strokeWidth="1.5">
          {[...Array(36)].map((_, i) => {
            const a = (i / 36) * Math.PI * 2;
            return <line key={i} x1="800" y1="520" x2={r(800 + Math.cos(a) * 420)} y2={r(520 + Math.sin(a) * 420)} />;
          })}
        </g>
        <circle cx="800" cy="540" r="250" fill={`url(#${u}tm-halo)`} />
        <circle cx="800" cy="540" r="190" fill="none" stroke="#E0BC62" strokeOpacity=".35" strokeWidth="2" strokeDasharray="3 9" />
      </g>
      <path d="M470 820 L470 470 C 470 430 500 410 530 404 C 540 360 590 330 640 334 C 670 290 730 262 800 262 C 870 262 930 290 960 334 C 1010 330 1060 360 1070 404 C 1100 410 1130 430 1130 470 L1130 820" fill="none" stroke={`url(#${u}tm-gold)`} strokeWidth="10" />

      {bell(540)}
      {bell(1060)}
      {toran}
      {strands}

      {/* Platform */}
      <rect x="400" y="742" width="800" height="34" rx="8" fill={`url(#${u}tm-woodv)`} />
      <rect x="400" y="742" width="800" height="4" fill="#E2B57A" opacity=".6" />
      <rect x="380" y="776" width="840" height="96" fill={`url(#${u}tm-wood)`} />
      {[...Array(9)].map((_, i) => <path key={i} d={`M${420 + i * 90} 800 q 25 30 50 0`} fill="none" stroke="#D9A866" strokeOpacity=".45" strokeWidth="2.5" />)}
      <rect x="340" y="872" width="920" height="128" fill="#3D2110" />
      <rect x="340" y="872" width="920" height="8" fill="#6A3D1C" />
      {/* petals */}
      {[[470, 744], [500, 748], [1110, 745], [1140, 750], [660, 750], [945, 749]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="8" ry="4" fill={i % 2 ? "#E64B2A" : "#F2A21F"} transform={`rotate(${i * 37} ${x} ${y})`} />
      ))}
      {flame(560)}
      {flame(1040)}
      <rect width="1600" height="1000" fill={`url(#${u}tm-vignette)`} />
    </svg>
  );
}

/* ───────────────────────────── Work desk ───────────────────────────── */
export function DeskScene({ className, animated = true }: P) {
  const u = useId().replace(/:/g, "");
  return (
    <svg {...svgProps} className={cn("absolute inset-0 h-full w-full", className)} aria-hidden>
      <defs>
        <linearGradient id={`${u}dk-wall`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#EFE7DA" />
          <stop offset="1" stopColor="#DCCCB4" />
        </linearGradient>
        <linearGradient id={`${u}dk-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#BFD9E6" />
          <stop offset="1" stopColor="#F3E6CF" />
        </linearGradient>
        <linearGradient id={`${u}dk-desk`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C49568" />
          <stop offset=".5" stopColor="#A87A4F" />
          <stop offset="1" stopColor="#8A603B" />
        </linearGradient>
        <linearGradient id={`${u}dk-beam`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF8E6" stopOpacity=".55" />
          <stop offset="1" stopColor="#FFF8E6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${u}dk-screen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1E2430" />
          <stop offset="1" stopColor="#11151C" />
        </linearGradient>
        <filter id={`${u}dk-soft`}><feGaussianBlur stdDeviation="10" /></filter>
      </defs>
      <rect width="1600" height="1000" fill={`url(#${u}dk-wall)`} />
      {/* window */}
      <rect x="1090" y="70" width="430" height="500" rx="10" fill="#F8F2E8" />
      <rect x="1110" y="90" width="390" height="460" fill={`url(#${u}dk-sky)`} />
      <g filter={`url(#${u}dk-soft)`} opacity=".75">
        <ellipse cx="1200" cy="520" rx="120" ry="70" fill="#9CB08A" />
        <ellipse cx="1400" cy="510" rx="140" ry="80" fill="#8AA078" />
      </g>
      <rect x="1300" y="90" width="12" height="460" fill="#F8F2E8" />
      <rect x="1110" y="312" width="390" height="12" fill="#F8F2E8" />
      <path d="M1110 90 L1500 90 L 900 1000 L 300 1000 Z" fill={`url(#${u}dk-beam)`} opacity=".55" />
      {/* frame on wall */}
      <rect x="560" y="140" width="250" height="180" rx="6" fill="#2D2420" />
      <rect x="576" y="156" width="218" height="148" fill="#EADCC3" />
      <circle cx="685" cy="230" r="46" fill="#C9A24A" opacity=".85" />
      <path d="M576 280 Q 640 240 700 270 T 794 262 L794 304 L576 304Z" fill="#5E1224" opacity=".7" />
      {/* desk */}
      <path d="M0 650 L1600 650 L1600 1000 L0 1000Z" fill={`url(#${u}dk-desk)`} />
      <rect x="0" y="650" width="1600" height="5" fill="#E2BC90" opacity=".7" />
      {[700, 760, 830, 910].map((y, i) => (
        <path key={y} d={`M0 ${y} C 400 ${y - 10 + i * 3} 900 ${y + 14} 1600 ${y - 6}`} fill="none" stroke="#7A5232" strokeOpacity=".18" strokeWidth="2" />
      ))}
      {/* laptop */}
      <path d="M150 700 L 640 700 L 680 730 L 110 730 Z" fill="#B9BCC2" />
      <rect x="110" y="728" width="570" height="8" rx="4" fill="#8F9298" />
      <rect x="180" y="380" width="430" height="320" rx="14" fill="#2A2D33" />
      <rect x="194" y="394" width="402" height="292" rx="6" fill={`url(#${u}dk-screen)`} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect key={i} x={214 + (i % 3) * 18} y={420 + i * 30} width={[220, 160, 260, 120, 200, 240, 90, 180][i]} height="9" rx="4.5" fill={["#C9A24A", "#7FA7C9", "#E7DCC8", "#A3C49A", "#E7DCC8", "#7FA7C9", "#C9A24A", "#E7DCC8"][i]} opacity=".55" />
      ))}
      {/* notebook & pen */}
      <g transform="rotate(-8 520 860)">
        <rect x="400" y="800" width="250" height="160" rx="8" fill="#5E1224" />
        <rect x="410" y="800" width="8" height="160" fill="#3A0A15" />
        <rect x="480" y="900" width="200" height="10" rx="5" fill="#C9A24A" />
      </g>
      {/* mug */}
      <g>
        <ellipse cx="1080" cy="742" rx="66" ry="14" fill="#000" opacity=".12" />
        <rect x="1020" y="640" width="120" height="100" rx="14" fill="#2F4B40" />
        <path d="M1140 662 q 44 0 44 34 q 0 34 -44 34" fill="none" stroke="#2F4B40" strokeWidth="14" />
        <ellipse cx="1080" cy="642" rx="60" ry="11" fill="#22362E" />
        {[1050, 1080, 1110].map((x, i) => (
          <path key={x} d={`M${x} 620 c -12 -22 12 -36 0 -60`} fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="5" strokeLinecap="round" className={animated ? "animate-[float_3s_ease-in-out_infinite]" : undefined} style={{ animationDelay: `${i * 0.5}s` }} />
        ))}
      </g>
      {/* plant */}
      <g>
        <path d="M1320 600 L 1460 600 L 1440 740 L 1340 740 Z" fill="#C26A3E" />
        <rect x="1312" y="590" width="156" height="22" rx="6" fill="#A7552F" />
        {[[-60, -160], [-20, -210], [30, -190], [70, -140], [-90, -100], [95, -90], [5, -240]].map(([dx, dy], i) => (
          <ellipse key={i} cx={1390 + dx / 2} cy={590 + dy / 2} rx="26" ry="70" fill={i % 2 ? "#4F7A45" : "#3E6638"} transform={`rotate(${dx / 2} ${1390 + dx / 2} ${590 + dy / 2})`} />
        ))}
      </g>
    </svg>
  );
}

/* ───────────────────────────── Living room shelf ───────────────────────────── */
export function ShelfScene({ className, animated = true }: P) {
  const u = useId().replace(/:/g, "");
  return (
    <svg {...svgProps} className={cn("absolute inset-0 h-full w-full", className)} aria-hidden>
      <defs>
        <linearGradient id={`${u}sh-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B86B4B" />
          <stop offset="1" stopColor="#8E4C33" />
        </linearGradient>
        <radialGradient id={`${u}sh-lamp`} cx=".15" cy=".35" r=".6">
          <stop offset="0" stopColor="#FFD9A0" stopOpacity=".55" />
          <stop offset="1" stopColor="#FFD9A0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${u}sh-wood`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6B4126" />
          <stop offset="1" stopColor="#40230F" />
        </linearGradient>
        <radialGradient id={`${u}sh-shadow`} cx=".5" cy="0" r=".6">
          <stop offset="0" stopColor="#000" stopOpacity=".35" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="1000" fill={`url(#${u}sh-wall)`} />
      {/* arched niche */}
      <path d="M520 600 L520 250 C 520 120 650 60 800 60 C 950 60 1080 120 1080 250 L1080 600 Z" fill="#A55D40" />
      <path d="M520 600 L520 250 C 520 120 650 60 800 60 C 950 60 1080 120 1080 250 L1080 600" fill="none" stroke="#C9A24A" strokeOpacity=".35" strokeWidth="3" />
      <rect width="1600" height="1000" fill={`url(#${u}sh-lamp)`} className={animated ? "animate-[pulse_6s_ease-in-out_infinite]" : undefined} />
      {/* floor lamp */}
      <g>
        <rect x="186" y="300" width="8" height="700" fill="#2B1C14" />
        <path d="M110 200 L 270 200 L 230 300 L 150 300 Z" fill="#F0DDBB" />
        <path d="M110 200 L 270 200 L 230 300 L 150 300 Z" fill="#FFE9BF" opacity=".5" className={animated ? "animate-[pulse_4s_ease-in-out_infinite]" : undefined} />
      </g>
      {/* shelf */}
      <ellipse cx="800" cy="676" rx="560" ry="40" fill={`url(#${u}sh-shadow)`} />
      <rect x="240" y="600" width="1120" height="24" rx="4" fill="#8A5A36" />
      <rect x="240" y="624" width="1120" height="46" fill={`url(#${u}sh-wood)`} />
      {/* books */}
      <g>
        <rect x="320" y="470" width="34" height="130" fill="#2F4B40" />
        <rect x="356" y="490" width="30" height="110" fill="#C9A24A" />
        <rect x="388" y="460" width="38" height="140" fill="#5E1224" />
        <rect x="430" y="520" width="140" height="26" fill="#EADCC3" transform="rotate(0)" />
        <rect x="440" y="546" width="130" height="24" fill="#2D2420" />
        <rect x="430" y="570" width="150" height="30" fill="#C26A3E" />
      </g>
      {/* vase with pampas */}
      <g>
        <path d="M1150 600 C 1110 560 1120 500 1160 470 L 1200 470 C 1240 500 1250 560 1210 600 Z" fill="#EFE4CF" />
        {[...Array(9)].map((_, i) => {
          const a = -40 + i * 10;
          return (
            <path key={i} d={`M1180 472 q ${a} -120 ${a * 2.2} -240`} fill="none" stroke="#E8D7B5" strokeWidth={i % 2 ? 9 : 6} strokeLinecap="round" opacity=".9"
              className={animated ? "animate-swing" : undefined} style={{ transformOrigin: "1180px 472px", animationDelay: `${i * 0.2}s`, animationDuration: `${4 + i * 0.3}s` }} />
          );
        })}
      </g>
      {/* candle */}
      <g>
        <rect x="1000" y="540" width="44" height="60" rx="4" fill="#F4EBDD" />
        <path d="M1022 512 c 8 12 8 24 0 28 c -8 -4 -8 -16 0 -28z" fill="#FFB547" className={animated ? "animate-flicker" : undefined} style={{ transformOrigin: "1022px 540px" }} />
      </g>
      {/* monstera silhouettes */}
      <g opacity=".55" fill="#3B2418">
        <path d="M1480 1000 C 1400 860 1450 760 1560 720 C 1600 800 1600 900 1600 1000 Z" />
        <path d="M0 1000 C 40 880 120 830 220 840 C 200 920 140 980 120 1000 Z" />
      </g>
    </svg>
  );
}
