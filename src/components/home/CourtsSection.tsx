import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { COURTS } from '../../data/mockData';
import { CourtVisual } from '../../assets/CourtImages';
import { BlurFade, AnimatedGroup } from '../ui/MotionPrimitives';

interface CourtsSectionProps {
  onSelectCourt: (courtId: string) => void;
}

export const CourtsSection: React.FC<CourtsSectionProps> = ({ onSelectCourt }) => {
  return (
    <section id="courts" className="py-16 sm:py-24 bg-neutral-100/70 dark:bg-[#0A1120]/60 border-y border-neutral-200/80 dark:border-white/5 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with One-Time BlurFade */}
        <BlurFade yOffset={20} duration={0.4} once={true}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 sm:mb-14">
            <div className="space-y-2">
              <div className="text-xs sm:text-sm font-semibold tracking-wider text-[#4D7C0F] dark:text-[#A3E635] uppercase">
                The Venue
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                Our 4 Courts
              </h2>
            </div>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 max-w-md">
              Four individually maintained pickleball courts. Select a court to view availability and reserve your hourly blocks.
            </p>
          </div>
        </BlurFade>

        {/* 4 Courts Grid with AnimatedGroup */}
        <AnimatedGroup stagger={0.07} delay={0.08} once={true} className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {COURTS.map((court, index) => {
            const courtKey = court.id as 'court-1' | 'court-2' | 'court-3' | 'court-4';
            return (
              <div
                key={court.id}
                className="group relative bg-white dark:bg-[#0E172A] border border-neutral-200/90 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Visual Area */}
                <div className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-neutral-900">
                  <CourtVisual
                    courtId={courtKey}
                    customSrc={court.imageCustomUrl}
                    alt={`PADDLE TOP ${court.name}`}
                    className="transition-transform duration-500 ease-out group-hover:scale-105"
                  />

                  {/* Contrast Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Top Court Number Label */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-mono font-bold tracking-widest text-[#0A1120] bg-[#84CC16] shadow-sm">
                      COURT 0{index + 1}
                    </span>
                  </div>

                  {/* Bottom Image Title */}
                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">
                      {court.name}
                    </h3>
                  </div>
                </div>

                {/* Card Content & Action */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-5">
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {court.description}
                  </p>

                  {/* Action Button */}
                  <div className="pt-3 flex items-center justify-between border-t border-neutral-100 dark:border-white/5">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      Hourly Session
                    </span>

                    <button
                      type="button"
                      onClick={() => onSelectCourt(court.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-[#3F6212] dark:text-[#A3E635] hover:text-[#0A1120] bg-[#84CC16]/15 hover:bg-[#84CC16] active:scale-[0.98] rounded-lg transition-all focus-visible:outline-2 focus-visible:outline-[#84CC16] cursor-pointer"
                    >
                      <span>Book This Court</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </AnimatedGroup>
      </div>
    </section>
  );
};
