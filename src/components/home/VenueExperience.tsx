import React from 'react';
import { CourtVisual } from '../../assets/CourtImages';
import { BlurFade } from '../ui/MotionPrimitives';

export const VenueExperience: React.FC = () => {
  return (
    <section id="experience" className="py-16 sm:py-24 relative overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Editorial Visual Composition (7 cols on Desktop) */}
          <div className="lg:col-span-7 relative">
            <BlurFade yOffset={20} duration={0.5} once={true}>
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[16/10] shadow-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-900 group">
                <CourtVisual courtId="venue" className="transition-transform duration-700 ease-out group-hover:scale-[1.02]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#84CC16]">
                    Courtside Atmosphere
                  </span>
                  <p className="text-xl sm:text-2xl font-bold font-display mt-1">
                    Built for the Love of the Game
                  </p>
                </div>
              </div>
            </BlurFade>

            {/* Subtle decorative accent border */}
            <div 
              aria-hidden="true" 
              className="absolute -bottom-4 -right-4 w-32 h-32 border-b-2 border-r-2 border-[#84CC16]/30 rounded-br-3xl pointer-events-none hidden sm:block" 
            />
          </div>

          {/* Editorial Content (5 cols on Desktop) */}
          <div className="lg:col-span-5 space-y-6">
            <BlurFade yOffset={16} delay={0.12} duration={0.45} once={true}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="text-xs sm:text-sm font-semibold tracking-wider text-[#4D7C0F] dark:text-[#A3E635] uppercase">
                    Atmosphere & Space
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight">
                    A Dedicated Home for Pickleball
                  </h2>
                </div>

                <p className="text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  PADDLE TOP brings players together under one vibrant roof. With four dedicated courts calibrated for balanced bounce and swift rallies, the venue creates an environment where competitive matches and friendly drop-ins thrive side by side.
                </p>

                <div className="space-y-3 pt-2 text-sm text-neutral-700 dark:text-neutral-300">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#84CC16] mt-2 shrink-0" />
                    <p><strong className="text-neutral-900 dark:text-white">Focused 4-Court Layout:</strong> Designed for clear lines of sight, effortless court access, and lively courtside energy.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#84CC16] mt-2 shrink-0" />
                    <p><strong className="text-neutral-900 dark:text-white">Community & Connection:</strong> Space for spectators, post-match debriefs, and casual meetups between sets.</p>
                  </div>
                </div>
              </div>
            </BlurFade>
          </div>
        </div>
      </div>
    </section>
  );
};
