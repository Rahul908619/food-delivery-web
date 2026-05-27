import { useId } from 'react';

export default function QuickBitXLogo({ size = 56 }) {
  const uid = useId().replace(/:/g, '');
  const logoGrad = `logoGrad-${uid}`;
  const innerGrad = `innerGrad-${uid}`;
  const logoGlow = `logoGlow-${uid}`;
  const boltGrad = `boltGrad-${uid}`;

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={logoGrad} x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF6A00" />
          <stop offset="100%" stopColor="#EE0044" />
        </linearGradient>
        <linearGradient id={innerGrad} x1="30" y1="20" x2="90" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.85" />
        </linearGradient>
        <filter id={logoGlow}>
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id={boltGrad} x1="50" y1="25" x2="70" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF" />
          <stop offset="100%" stopColor="#FFD4A8" />
        </linearGradient>
      </defs>

      <path d="M60 6 L108 30 L108 90 L60 114 L12 90 L12 30 Z" fill={`url(#${logoGrad})`} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
      <path d="M60 14 L102 34 L102 86 L60 106 L18 86 L18 34 Z" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

      <g opacity="0.9">
        <rect x="34" y="28" width="3.5" height="22" rx="1.75" fill={`url(#${innerGrad})`} />
        <rect x="42" y="28" width="3.5" height="22" rx="1.75" fill={`url(#${innerGrad})`} />
        <rect x="50" y="28" width="3.5" height="22" rx="1.75" fill={`url(#${innerGrad})`} />
        <path d="M35.5 50 Q35.5 55 42 55 Q48.5 55 48.5 50" fill="none" stroke={`url(#${innerGrad})`} strokeWidth="3" strokeLinecap="round" />
        <rect x="40.5" y="54" width="3.5" height="14" rx="1.75" fill={`url(#${innerGrad})`} />
      </g>

      <g filter={`url(#${logoGlow})`}>
        <path d="M72 26 L62 56 L74 56 L64 94 L90 50 L76 50 L88 26 Z" fill={`url(#${boltGrad})`} opacity="0.95" />
      </g>

      <line x1="28" y1="76" x2="38" y2="76" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="83" x2="36" y2="83" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="90" x2="38" y2="90" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
