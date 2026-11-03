import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { BlurFade } from '../ui/MotionPrimitives';

interface EditorialTeaserProps {
  onExplorePaddles?: () => void;
}

export const EditorialTeaser: React.FC<EditorialTeaserProps> = ({ onExplorePaddles }) => {
  return (
    <section id="paddles" className="py-16 sm:py-24 relative overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BlurFade yOffset={24} duration={0.5} once={true}>
          <div className="relative rounded-3xl bg-gradient-to-br from-[#060B14] via-[#0A1220] to-[#14223C] text-white p-8 sm:p-12 lg:p-16 border border-white/10 overflow-hidden shadow-2xl">
            {/* Subtle background glow */}
            <div 
              aria-hidden="true" 
              className="absolute top-0 right-0 w-96 h-96 bg-[#84CC16]/15 blur-[100px] rounded-full pointer-events-none" 
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              {/* Text & Pitch */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#84CC16]/15 text-[#A3E635] text-xs font-mono font-bold tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Venue Pro Counter · Demo & Rental</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-display">
                  Paddle Showcase & Venue Equipment
                </h2>

                <p className="text-base sm:text-lg text-neutral-300 max-w-xl leading-relaxed">
                  Explore equipment options and demo paddles available directly at the venue counter for open practice, match play, and equipment testing.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-6 text-xs sm:text-sm text-neutral-300">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#84CC16]" />
                    <span>Performance Paddles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#A3E635]" />
                    <span>Balanced Weight</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span>Available at Counter</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={onExplorePaddles}
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-[#0A1120] bg-white hover:bg-neutral-100 active:scale-[0.98] rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    <span>View Equipment Showcase</span>
                    <ArrowRight className="w-4 h-4 text-[#4D7C0F]" />
                  </button>
                </div>
              </div>

              {/* Stylized Paddle Graphic Artwork */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-64 sm:w-72 aspect-[3/4] flex items-center justify-center">
                  <svg viewBox="0 0 300 450" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
                    {/* Paddle Face Shadow */}
                    <rect x="50" y="30" width="200" height="270" rx="60" fill="#05080F" fillOpacity="0.6" />
                    
                    {/* Paddle Face Outer Bezel */}
                    <rect x="45" y="25" width="210" height="270" rx="55" fill="#0E182A" stroke="#84CC16" strokeWidth="3" />
                    
                    {/* Carbon texture surface */}
                    <rect x="52" y="32" width="196" height="256" rx="48" fill="#0A1120" />
                    <path d="M 60 40 L 240 280 M 80 40 L 240 260 M 100 40 L 240 240 M 60 60 L 240 300 M 60 80 L 240 320" stroke="#FFFFFF" strokeOpacity="0.04" strokeWidth="2" />

                    {/* Brand Monogram on Paddle Face (Authentic TP logo untouched) */}
                    <g transform="translate(115, 95)">
                      <rect width="70" height="70" rx="18" fill="#0A1120" stroke="#FFFFFF" strokeOpacity="0.1" />
                      {/* 'T' in Athletic Lime */}
                      <path d="M18 22h20c2 0 4 2 4 4v2c0 2-2 4-4 4h-6v16c0 2-2 4-4 4h-2c-2 0-4-2-4-4V32c0-2 2-4 4-4z" fill="#84CC16" />
                      {/* 'P' in Pure White */}
                      <path d="M35 18h14c8 0 13 5 13 12s-5 12-13 12h-7v10c0 2-2 4-4 4h-2c-2 0-4-2-4-4V22c0-2 2-4 4-4zm7 18h6c4 0 7-3 7-6s-3-6-7-6h-6v12z" fill="#FFFFFF" />
                    </g>
                    
                    <text x="150" y="200" fill="#FFFFFF" fontSize="13" fontWeight="900" letterSpacing="4" textAnchor="middle">
                      PADDLE TOP
                    </text>
                    <text x="150" y="218" fill="#84CC16" fontSize="9" fontWeight="700" letterSpacing="3" textAnchor="middle">
                      CLUB DEMO PADDLE
                    </text>

                    {/* Handle throat connection */}
                    <path d="M 125 295 L 175 295 L 165 330 L 135 330 Z" fill="#0E182A" stroke="#1E2E4E" strokeWidth="2" />

                    {/* Ergonomic handle with white perforated overgrip & lime trim */}
                    <rect x="135" y="325" width="30" height="110" rx="6" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
                    <line x1="135" y1="345" x2="165" y2="340" stroke="#94A3B8" strokeWidth="2" />
                    <line x1="135" y1="365" x2="165" y2="360" stroke="#94A3B8" strokeWidth="2" />
                    <line x1="135" y1="385" x2="165" y2="380" stroke="#94A3B8" strokeWidth="2" />
                    <line x1="135" y1="405" x2="165" y2="400" stroke="#94A3B8" strokeWidth="2" />
                    {/* Handle butt cap with brand lime band */}
                    <rect x="133" y="428" width="34" height="10" rx="3" fill="#84CC16" />

                    {/* Accompanying Pickleball in athletic lime */}
                    <circle cx="75" cy="385" r="26" fill="#84CC16" filter="drop-shadow(0 10px 15px rgba(0,0,0,0.5))" />
                    <circle cx="68" cy="380" r="4" fill="#0A1120" fillOpacity="0.4" />
                    <circle cx="82" cy="378" r="4" fill="#0A1120" fillOpacity="0.4" />
                    <circle cx="84" cy="392" r="4" fill="#0A1120" fillOpacity="0.4" />
                    <circle cx="70" cy="394" r="4" fill="#0A1120" fillOpacity="0.4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
};
