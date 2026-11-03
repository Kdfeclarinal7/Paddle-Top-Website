import React from 'react';

interface CourtImageProps {
  courtId: 'court-1' | 'court-2' | 'court-3' | 'court-4' | 'hero' | 'venue';
  className?: string;
  alt?: string;
  customSrc?: string;
}

export const CourtVisual: React.FC<CourtImageProps> = ({
  courtId,
  className = '',
  alt,
  customSrc,
}) => {
  if (customSrc) {
    return (
      <img
        src={customSrc}
        alt={alt || `PADDLE TOP ${courtId}`}
        referrerPolicy="no-referrer"
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  // High-fidelity vector court artwork matching PADDLE TOP's navy/lime-green/white visual identity
  switch (courtId) {
    case 'hero':
      return (
        <div className={`relative w-full h-full overflow-hidden bg-[#0A1120] ${className}`}>
          <svg
            viewBox="0 0 1200 675"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full object-cover scale-[1.02]"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="skyGrad" x1="600" y1="0" x2="600" y2="400" gradientUnits="userSpaceOnUse">
                <stop stopColor="#070D18" />
                <stop offset="0.6" stopColor="#0E182A" />
                <stop offset="0.9" stopColor="#1E2E4E" />
                <stop offset="1" stopColor="#2A4068" />
              </linearGradient>
              <linearGradient id="courtGrad" x1="600" y1="360" x2="600" y2="675" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0B1A34" />
                <stop offset="0.7" stopColor="#081426" />
                <stop offset="1" stopColor="#050C18" />
              </linearGradient>
              <linearGradient id="nvzGrad" x1="600" y1="380" x2="600" y2="490" gradientUnits="userSpaceOnUse">
                <stop stopColor="#65A30D" />
                <stop offset="1" stopColor="#4D7C0F" />
              </linearGradient>
              <radialGradient id="sunGlow" cx="600" cy="360" r="300" gradientUnits="userSpaceOnUse">
                <stop stopColor="#A3E635" stopOpacity="0.35" />
                <stop offset="0.4" stopColor="#84CC16" stopOpacity="0.15" />
                <stop offset="1" stopColor="#070D18" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Atmosphere & Lighting */}
            <rect width="1200" height="675" fill="url(#skyGrad)" />
            <circle cx="600" cy="350" r="280" fill="url(#sunGlow)" />

            {/* Far fencing & modern silhouette lights */}
            <line x1="0" y1="370" x2="1200" y2="370" stroke="#FFFFFF" strokeOpacity="0.1" strokeWidth="2" />
            <line x1="200" y1="260" x2="200" y2="370" stroke="#1E2E4E" strokeWidth="6" />
            <line x1="1000" y1="260" x2="1000" y2="370" stroke="#1E2E4E" strokeWidth="6" />
            <circle cx="200" cy="256" r="12" fill="#84CC16" fillOpacity="0.8" />
            <circle cx="1000" cy="256" r="12" fill="#84CC16" fillOpacity="0.8" />

            {/* Perspective Playing Surface */}
            <path d="M 0 675 L 180 370 L 1020 370 L 1200 675 Z" fill="url(#courtGrad)" />

            {/* Kitchen / Non-Volley Zone (Athletic Lime Green) */}
            <path d="M 280 470 L 370 380 L 830 380 L 920 470 Z" fill="url(#nvzGrad)" />

            {/* Crisp Court Lines */}
            <polygon points="180,370 1020,370 1020,374 180,374" fill="#FFFFFF" fillOpacity="0.85" />
            <polygon points="0,668 1200,668 1200,675 0,675" fill="#FFFFFF" fillOpacity="0.85" />
            
            {/* Sidelines in perspective */}
            <line x1="180" y1="370" x2="0" y2="675" stroke="#FFFFFF" strokeWidth="6" strokeOpacity="0.85" />
            <line x1="1020" y1="370" x2="1200" y2="675" stroke="#FFFFFF" strokeWidth="6" strokeOpacity="0.85" />

            {/* Non-Volley Zone lines */}
            <line x1="370" y1="380" x2="830" y2="380" stroke="#FFFFFF" strokeWidth="4" strokeOpacity="0.9" />
            <line x1="280" y1="470" x2="920" y2="470" stroke="#FFFFFF" strokeWidth="5" strokeOpacity="0.95" />

            {/* Centerline */}
            <line x1="600" y1="470" x2="600" y2="675" stroke="#FFFFFF" strokeWidth="6" strokeOpacity="0.9" />

            {/* Regulation Net */}
            <line x1="160" y1="378" x2="1040" y2="378" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />
            <line x1="160" y1="380" x2="1040" y2="380" stroke="#050A14" strokeWidth="16" strokeOpacity="0.75" />
            <line x1="600" y1="372" x2="600" y2="390" stroke="#FFFFFF" strokeWidth="4" />

            {/* Pickleball at baseline in athletic lime */}
            <circle cx="720" cy="580" r="18" fill="#84CC16" filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.6))" />
            <circle cx="715" cy="576" r="3" fill="#0A1120" fillOpacity="0.35" />
            <circle cx="724" cy="574" r="3" fill="#0A1120" fillOpacity="0.35" />
            <circle cx="726" cy="583" r="3" fill="#0A1120" fillOpacity="0.35" />
            <circle cx="718" cy="586" r="3" fill="#0A1120" fillOpacity="0.35" />

            {/* Subtle brand watermark on court */}
            <text x="600" y="540" fill="#FFFFFF" fillOpacity="0.08" fontSize="28" fontWeight="800" textAnchor="middle" letterSpacing="6">
              PADDLE TOP
            </text>
          </svg>
        </div>
      );

    case 'court-1':
      return (
        <div className={`relative w-full h-full overflow-hidden bg-[#0A1426] ${className}`}>
          <svg viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
            <rect width="800" height="600" fill="#08101E" />
            {/* Court boundary */}
            <rect x="90" y="60" width="620" height="480" rx="12" fill="#0D1E3A" stroke="#1B335E" strokeWidth="4" />
            {/* Kitchen / Non-Volley Zone */}
            <rect x="90" y="230" width="620" height="140" fill="#65A30D" />
            {/* Crisp white court lines */}
            <rect x="90" y="60" width="620" height="480" stroke="#FFFFFF" strokeWidth="5" />
            <line x1="90" y1="230" x2="710" y2="230" stroke="#FFFFFF" strokeWidth="5" />
            <line x1="90" y1="370" x2="710" y2="370" stroke="#FFFFFF" strokeWidth="5" />
            {/* Centerline */}
            <line x1="400" y1="60" x2="400" y2="230" stroke="#FFFFFF" strokeWidth="5" />
            <line x1="400" y1="370" x2="400" y2="540" stroke="#FFFFFF" strokeWidth="5" />
            {/* Regulation Net */}
            <line x1="70" y1="300" x2="730" y2="300" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
            <line x1="70" y1="302" x2="730" y2="302" stroke="#000000" strokeWidth="12" strokeOpacity="0.5" />
            {/* Highlighted Badge */}
            <circle cx="630" cy="140" r="28" fill="#84CC16" />
            <text x="630" y="146" fill="#0A1120" fontSize="16" fontWeight="900" textAnchor="middle">01</text>
            <text x="400" y="306" fill="#FFFFFF" fillOpacity="0.9" fontSize="13" fontWeight="800" letterSpacing="4" textAnchor="middle">
              COURT ONE
            </text>
          </svg>
        </div>
      );

    case 'court-2':
      return (
        <div className={`relative w-full h-full overflow-hidden bg-[#0A1426] ${className}`}>
          <svg viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
            <rect width="800" height="600" fill="#070E1A" />
            {/* Court boundary */}
            <rect x="90" y="60" width="620" height="480" rx="12" fill="#0F2242" stroke="#1B3562" strokeWidth="4" />
            {/* Kitchen */}
            <rect x="90" y="230" width="620" height="140" fill="#4D7C0F" />
            {/* White lines */}
            <rect x="90" y="60" width="620" height="480" stroke="#FFFFFF" strokeWidth="5" />
            <line x1="90" y1="230" x2="710" y2="230" stroke="#FFFFFF" strokeWidth="5" />
            <line x1="90" y1="370" x2="710" y2="370" stroke="#FFFFFF" strokeWidth="5" />
            <line x1="400" y1="60" x2="400" y2="230" stroke="#FFFFFF" strokeWidth="5" />
            <line x1="400" y1="370" x2="400" y2="540" stroke="#FFFFFF" strokeWidth="5" />
            {/* Net */}
            <line x1="70" y1="300" x2="730" y2="300" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
            <circle cx="630" cy="140" r="28" fill="#84CC16" />
            <text x="630" y="146" fill="#0A1120" fontSize="16" fontWeight="900" textAnchor="middle">02</text>
            <text x="400" y="306" fill="#FFFFFF" fillOpacity="0.9" fontSize="13" fontWeight="800" letterSpacing="4" textAnchor="middle">
              COURT TWO
            </text>
          </svg>
        </div>
      );

    case 'court-3':
      return (
        <div className={`relative w-full h-full overflow-hidden bg-[#0A1426] ${className}`}>
          <svg viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
            <rect width="800" height="600" fill="#08101E" />
            {/* Court boundary */}
            <rect x="90" y="60" width="620" height="480" rx="12" fill="#0D1E3A" stroke="#1B335E" strokeWidth="4" />
            {/* Kitchen */}
            <rect x="90" y="230" width="620" height="140" fill="#65A30D" />
            {/* White lines */}
            <rect x="90" y="60" width="620" height="480" stroke="#FFFFFF" strokeWidth="5" />
            <line x1="90" y1="230" x2="710" y2="230" stroke="#FFFFFF" strokeWidth="5" />
            <line x1="90" y1="370" x2="710" y2="370" stroke="#FFFFFF" strokeWidth="5" />
            <line x1="400" y1="60" x2="400" y2="230" stroke="#FFFFFF" strokeWidth="5" />
            <line x1="400" y1="370" x2="400" y2="540" stroke="#FFFFFF" strokeWidth="5" />
            {/* Net */}
            <line x1="70" y1="300" x2="730" y2="300" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
            <circle cx="630" cy="140" r="28" fill="#84CC16" />
            <text x="630" y="146" fill="#0A1120" fontSize="16" fontWeight="900" textAnchor="middle">03</text>
            <text x="400" y="306" fill="#FFFFFF" fillOpacity="0.9" fontSize="13" fontWeight="800" letterSpacing="4" textAnchor="middle">
              COURT THREE
            </text>
          </svg>
        </div>
      );

    case 'court-4':
      return (
        <div className={`relative w-full h-full overflow-hidden bg-[#0A1426] ${className}`}>
          <svg viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
            <rect width="800" height="600" fill="#060C16" />
            {/* Court boundary */}
            <rect x="90" y="60" width="620" height="480" rx="12" fill="#0E203E" stroke="#1A335C" strokeWidth="4" />
            {/* Kitchen */}
            <rect x="90" y="230" width="620" height="140" fill="#4D7C0F" />
            {/* White lines */}
            <rect x="90" y="60" width="620" height="480" stroke="#FFFFFF" strokeWidth="5" />
            <line x1="90" y1="230" x2="710" y2="230" stroke="#FFFFFF" strokeWidth="5" />
            <line x1="90" y1="370" x2="710" y2="370" stroke="#FFFFFF" strokeWidth="5" />
            <line x1="400" y1="60" x2="400" y2="230" stroke="#FFFFFF" strokeWidth="5" />
            <line x1="400" y1="370" x2="400" y2="540" stroke="#FFFFFF" strokeWidth="5" />
            {/* Net */}
            <line x1="70" y1="300" x2="730" y2="300" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
            <circle cx="630" cy="140" r="28" fill="#84CC16" />
            <text x="630" y="146" fill="#0A1120" fontSize="16" fontWeight="900" textAnchor="middle">04</text>
            <text x="400" y="306" fill="#FFFFFF" fillOpacity="0.9" fontSize="13" fontWeight="800" letterSpacing="4" textAnchor="middle">
              COURT FOUR
            </text>
          </svg>
        </div>
      );

    case 'venue':
      return (
        <div className={`relative w-full h-full overflow-hidden bg-[#0A1120] ${className}`}>
          <svg viewBox="0 0 1000 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
            <defs>
              <linearGradient id="venueBg" x1="0" y1="0" x2="1000" y2="600" gradientUnits="userSpaceOnUse">
                <stop stopColor="#08101E" />
                <stop offset="0.5" stopColor="#0F1E36" />
                <stop offset="1" stopColor="#050A14" />
              </linearGradient>
            </defs>
            <rect width="1000" height="600" fill="url(#venueBg)" />
            {/* Architectural stadium rooflines */}
            <path d="M 0 140 Q 500 60 1000 140 L 1000 160 Q 500 80 0 160 Z" fill="#84CC16" fillOpacity="0.75" />
            <path d="M 0 170 Q 500 95 1000 170" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="2" />
            {/* 4 Courts subtle layout in perspective */}
            <rect x="80" y="280" width="180" height="240" rx="8" fill="#0E234A" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.5" />
            <rect x="290" y="280" width="180" height="240" rx="8" fill="#0E234A" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.5" />
            <rect x="530" y="280" width="180" height="240" rx="8" fill="#0E234A" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.5" />
            <rect x="740" y="280" width="180" height="240" rx="8" fill="#0E234A" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.5" />
            
            <text x="170" y="410" fill="#FFFFFF" fillOpacity="0.8" fontSize="16" fontWeight="800" textAnchor="middle">COURT 1</text>
            <text x="380" y="410" fill="#FFFFFF" fillOpacity="0.8" fontSize="16" fontWeight="800" textAnchor="middle">COURT 2</text>
            <text x="620" y="410" fill="#FFFFFF" fillOpacity="0.8" fontSize="16" fontWeight="800" textAnchor="middle">COURT 3</text>
            <text x="830" y="410" fill="#FFFFFF" fillOpacity="0.8" fontSize="16" fontWeight="800" textAnchor="middle">COURT 4</text>
          </svg>
        </div>
      );
  }
};
