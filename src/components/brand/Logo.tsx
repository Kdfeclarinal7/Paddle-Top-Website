import React from 'react';

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  showWordmark = true,
  size = 'md',
}) => {
  const sizeMap = {
    sm: { mark: 32, text: 'text-lg', gap: 'gap-2.5' },
    md: { mark: 40, text: 'text-xl', gap: 'gap-3' },
    lg: { mark: 52, text: 'text-2xl', gap: 'gap-3.5' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center ${currentSize.gap} select-none ${className}`}>
      {/* Authentic TP Monogram: Athletic Lime slanted 'T' nestled with Navy 'P' */}
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: currentSize.mark, height: currentSize.mark }}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Subtle outer rounded contour */}
          <rect width="100" height="100" rx="24" className="fill-[#0A1120] dark:fill-white/10" />
          
          {/* 'T' in Athletic Brand Lime */}
          <path
            d="M26 32h26c3.3 0 6 2.7 6 6v2c0 2.2-1.8 4-4 4H39v24c0 3.3-2.7 6-6 6h-2c-3.3 0-6-2.7-6-6V38c0-3.3 2.7-6 6-6z"
            fill="var(--brand-accent, #84CC16)"
          />
          <path
            d="M20 32h24c2.2 0 4 1.8 4 4s-1.8 4-4 4H20c-2.2 0-4-1.8-4-4s1.8-4 4-4z"
            fill="var(--brand-accent-hover, #A3E635)"
          />

          {/* 'P' in Crisp White */}
          <path
            d="M48 26h20c11 0 19 8 19 18s-8 18-19 18H58v14c0 2.8-2.2 5-5 5h-2c-2.8 0-5-2.2-5-5V31c0-2.8 2.2-5 5-5zm10 26h9c5.5 0 9.5-4 9.5-9s-4-9-9.5-9H58v18z"
            fill="#FFFFFF"
          />
          
          {/* Small pickleball yellow accent dot */}
          <circle cx="78" cy="74" r="5" fill="#E2F800" />
        </svg>
      </div>

      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center tracking-tight font-extrabold font-display leading-none">
            <span className="text-[#0A1120] dark:text-white tracking-wider">PADDLE</span>
            <span className="text-[var(--brand-accent-text)] text-[#4D7C0F] dark:text-[#A3E635] ml-1.5 tracking-wider">TOP</span>
          </div>
          <span className="text-[9px] font-semibold tracking-[0.22em] text-neutral-500 dark:text-neutral-400 uppercase mt-0.5">
            Pickleball Club
          </span>
        </div>
      )}
    </div>
  );
};
