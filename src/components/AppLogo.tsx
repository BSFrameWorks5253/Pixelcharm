import React from 'react';

interface AppLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 38,
  className = '',
  showText = false
}) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 
        PixyCharm Logo Mark
        Inspired by Adobe's geometric precision & Canva's fluid magic stardust.
        Features:
        - Outer Adobe-styled precision dark squircle with neon glass bevel
        - Geometric crystal aperture (Adobe 'A')
        - Fluid looping stardust ribbon (Canva 'C')
        - Enchanted 4-point Pixie Charm starburst in the core
      */}
      <div
        className="relative flex items-center justify-center flex-shrink-0 group cursor-pointer"
        style={{ width: size, height: size }}
      >
        {/* Enchanted Ambient Pixie Aura */}
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-amber-400 opacity-70 blur-md group-hover:opacity-100 group-hover:blur-lg transition-all duration-300"
          style={{ borderRadius: size * 0.32 }}
        />

        {/* Vector SVG Badge */}
        <svg
          viewBox="0 0 64 64"
          width={size}
          height={size}
          className="relative z-10 drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Deep Adobe Obsidian Container */}
            <linearGradient id="pixy-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1a1829" />
              <stop offset="50%" stopColor="#100e1c" />
              <stop offset="100%" stopColor="#08070e" />
            </linearGradient>

            {/* Adobe Geometric Spectrum (Electric Cyan -> Royal Blue) */}
            <linearGradient id="adobe-prism" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00F5FF" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>

            {/* Canva Magic Ribbon (Vibrant Fuchsia -> Coral Gold) */}
            <linearGradient id="canva-charm" x1="52" y1="16" x2="14" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF2E93" />
              <stop offset="50%" stopColor="#C026D3" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>

            {/* Pixie Core Starburst */}
            <linearGradient id="charm-star" x1="26" y1="26" x2="38" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#FF2E93" />
            </linearGradient>

            {/* Inner Border Glow */}
            <linearGradient id="bevel-border" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.35)" />
              <stop offset="50%" stopColor="rgba(236, 72, 153, 0.2)" />
              <stop offset="100%" stopColor="rgba(0, 245, 255, 0.3)" />
            </linearGradient>
          </defs>

          {/* Squircle Housing (Adobe Precision Bevel) */}
          <rect
            x="2.5"
            y="2.5"
            width="59"
            height="59"
            rx="18"
            fill="url(#pixy-bg)"
            stroke="url(#bevel-border)"
            strokeWidth="1.5"
          />

          {/* Canva Fluid Stardust Loop Ribbon (The 'C') */}
          <path
            d="M21 47C14 41 13 27 23 17C33 7 47 9 51 19C54 27 48 37 39 40C30 43 22 36 25 28C27 22 35 22 38 26C40 30 38 34 33 35"
            stroke="url(#canva-charm)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Adobe Geometric Sharp 'A' Apex & Cross Aperture */}
          <path
            d="M17 48L32 14L47 48M22.5 37H41.5"
            stroke="url(#adobe-prism)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ mixBlendMode: 'screen' }}
          />

          {/* The Pixie Charm Starburst (4-Point Diamond Sparkle) */}
          <path
            d="M32 20C32 24 30 26 26 26C30 26 32 28 32 32C32 28 34 26 38 26C34 26 32 24 32 20Z"
            fill="url(#charm-star)"
            className="animate-pulse"
          />

          {/* Pixie Dust Micro-Stars */}
          <circle cx="48" cy="17" r="2.2" fill="#FDE047" />
          <circle cx="15" cy="46" r="2" fill="#00F5FF" />
          <circle cx="46" cy="47" r="1.5" fill="#FF2E93" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight text-white font-['Space_Grotesk'] flex items-center">
              Pixy<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300">charm</span>
            </span>
            <span className="text-[10px] bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/20 border border-fuchsia-500/30 text-fuchsia-300 font-mono font-bold px-1.5 py-0.2 rounded-full tracking-wide">
              PRO
            </span>
          </div>
          <span className="text-[10px] text-neutral-400 font-medium tracking-wide">
            Canva × Adobe Creative Magic
          </span>
        </div>
      )}
    </div>
  );
};
