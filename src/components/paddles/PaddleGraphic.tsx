import React from 'react';
import { PaddleProduct } from '../../types/paddle';

interface PaddleGraphicProps {
  product: PaddleProduct;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PaddleGraphic: React.FC<PaddleGraphicProps> = ({
  product,
  className = '',
  size = 'md'
}) => {
  const { themeColor, specifications } = product;

  // Sizing dimensions
  const heightClasses = {
    sm: 'h-48 sm:h-56',
    md: 'h-64 sm:h-72',
    lg: 'h-80 sm:h-96'
  };

  return (
    <div className={`relative flex items-center justify-center ${heightClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 280 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl select-none"
        aria-label={`${product.name} visual graphic`}
      >
        <defs>
          {/* Surface subtle gradient */}
          <linearGradient id={`faceGrad-${product.id}`} x1="40" y1="20" x2="240" y2="280" gradientUnits="userSpaceOnUse">
            <stop stopColor={themeColor.face} />
            <stop offset="0.6" stopColor="#0B1324" />
            <stop offset="1" stopColor="#060A14" />
          </linearGradient>

          {/* Grip pattern */}
          <pattern id={`gripLines-${product.id}`} width="20" height="20" patternTransform="rotate(25 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="20" stroke="#94A3B8" strokeWidth="1" strokeOpacity="0.4" />
          </pattern>
        </defs>

        {/* Ambient shadow */}
        <ellipse cx="140" cy="405" rx="70" ry="10" fill="#000000" fillOpacity="0.25" />

        {/* Outer Edge Guard / Bezel */}
        <rect
          x="35"
          y="20"
          width="210"
          height="265"
          rx="52"
          fill="#0D1527"
          stroke={themeColor.bezel}
          strokeWidth="3.5"
        />

        {/* Paddle Face Carbon Surface */}
        <rect
          x="42"
          y="27"
          width="196"
          height="251"
          rx="45"
          fill={`url(#faceGrad-${product.id})`}
        />

        {/* Subtle high-tech carbon cross-hatch texture */}
        <g opacity="0.07" stroke="#FFFFFF" strokeWidth="1.5">
          <line x1="50" y1="40" x2="230" y2="260" />
          <line x1="70" y1="40" x2="230" y2="240" />
          <line x1="90" y1="40" x2="230" y2="220" />
          <line x1="50" y1="70" x2="230" y2="290" />
          <line x1="50" y1="100" x2="230" y2="310" />
          <line x1="230" y1="40" x2="50" y2="260" />
          <line x1="230" y1="70" x2="50" y2="290" />
          <line x1="210" y1="40" x2="50" y2="240" />
        </g>

        {/* Top/Side Aero Speed Grooves */}
        <path d="M 65 32 C 100 24 180 24 215 32" stroke={themeColor.bezel} strokeWidth="2" strokeOpacity="0.8" strokeLinecap="round" />
        <path d="M 46 80 L 46 160" stroke={themeColor.bezel} strokeWidth="2.5" strokeOpacity="0.6" strokeLinecap="round" />
        <path d="M 234 80 L 234 160" stroke={themeColor.bezel} strokeWidth="2.5" strokeOpacity="0.6" strokeLinecap="round" />

        {/* Center TP Monogram Badge */}
        <g transform="translate(108, 88)">
          <rect width="64" height="64" rx="16" fill="#0A1120" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          {/* 'T' in Athletic Lime */}
          <path
            d="M16 20h20c2 0 4 2 4 4v2c0 2-2 4-4 4h-6v14c0 2-2 4-4 4h-2c-2 0-4-2-4-4V30c0-2 2-4 4-4z"
            fill={themeColor.accent}
          />
          {/* 'P' in Pure White */}
          <path
            d="M32 16h14c7 0 12 4.5 12 11s-4.5 11-12 11h-7v9c0 2-2 4-4 4h-2c-2 0-4-2-4-4V20c0-2 2-4 4-4zm6 16h6c3.5 0 6-2.5 6-5s-2.5-5-6-5h-6v10z"
            fill="#FFFFFF"
          />
        </g>

        {/* Paddle Name / Typography */}
        <text
          x="140"
          y="185"
          fill="#FFFFFF"
          fontSize="11"
          fontWeight="900"
          letterSpacing="3"
          textAnchor="middle"
        >
          PADDLE TOP
        </text>

        <text
          x="140"
          y="202"
          fill={themeColor.accent}
          fontSize="8.5"
          fontWeight="800"
          letterSpacing="2"
          textAnchor="middle"
        >
          EQUIPMENT SHOWCASE
        </text>

        <text
          x="140"
          y="218"
          fill="#94A3B8"
          fontSize="7"
          fontWeight="600"
          letterSpacing="1.5"
          textAnchor="middle"
        >
          DEMO MODEL · PROVISIONAL
        </text>

        {/* Throat Connection */}
        <path
          d="M 115 285 L 165 285 L 158 318 L 122 318 Z"
          fill="#0D1527"
          stroke="#1E2A44"
          strokeWidth="1.5"
        />

        {/* Ergonomic handle with perforated wrap */}
        <rect
          x="124"
          y="315"
          width="32"
          height="92"
          rx="5"
          fill="#F8FAFC"
          stroke="#CBD5E1"
          strokeWidth="1.5"
        />

        {/* Grip wrapping spiral lines */}
        <line x1="124" y1="332" x2="156" y2="326" stroke="#94A3B8" strokeWidth="1.8" />
        <line x1="124" y1="350" x2="156" y2="344" stroke="#94A3B8" strokeWidth="1.8" />
        <line x1="124" y1="368" x2="156" y2="362" stroke="#94A3B8" strokeWidth="1.8" />
        <line x1="124" y1="386" x2="156" y2="380" stroke="#94A3B8" strokeWidth="1.8" />

        {/* Butt Cap with Athletic Lime Ring */}
        <rect x="122" y="402" width="36" height="8" rx="2.5" fill={themeColor.bezel} />
      </svg>
    </div>
  );
};
