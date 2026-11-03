import React from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { CourtVisual } from '../../assets/CourtImages';
import { TextEffect } from '../ui/MotionPrimitives';

interface HeroProps {
  onBookCourt: () => void;
  onExploreCourts: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onBookCourt, onExploreCourts }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 overflow-hidden">
      {/* Background ambient lighting */}
      <div 
        aria-hidden="true" 
        className="absolute top-12 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-[#84CC16]/10 dark:bg-[#84CC16]/15 blur-[120px] rounded-full pointer-events-none -z-10" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Brand Kicker & Headline */}
        <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-6">
          {/* Step 2: Hero Eyebrow */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-widest text-[#4D7C0F] dark:text-[#A3E635] uppercase"
          >
            <span>Play</span>
            <span aria-hidden="true" className="text-neutral-400">·</span>
            <span>Compete</span>
            <span aria-hidden="true" className="text-neutral-400">·</span>
            <span>Connect</span>
          </motion.div>

          {/* Step 3: Hero Headline */}
          <TextEffect
            as="h1"
            delay={0.22}
            wordDelay={0.055}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.08] text-balance"
          >
            The Premier 4-Court Pickleball Venue
          </TextEffect>

          {/* Step 4: Supporting Copy */}
          <motion.p
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5, ease: 'easeOut' }}
            className="text-base sm:text-lg lg:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed text-balance"
          >
            Four dedicated courts designed for effortless play, spirited competition, and genuine community. Check real-time court availability and lock in your session in minutes.
          </motion.p>

          {/* Step 5: CTA Group */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.65, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2"
          >
            <button
              type="button"
              onClick={onBookCourt}
              className="w-full sm:w-auto px-7 py-3.5 text-sm sm:text-base font-bold text-[#0A1120] bg-[#84CC16] hover:bg-[#A3E635] active:scale-[0.98] rounded-xl transition-all shadow-md hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#84CC16] flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Book a Court</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={onExploreCourts}
              className="w-full sm:w-auto px-7 py-3.5 text-sm sm:text-base font-semibold text-neutral-800 dark:text-neutral-200 bg-white/80 dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 active:scale-[0.98] border border-neutral-200 dark:border-white/10 rounded-xl transition-all focus-visible:outline-2 focus-visible:outline-[#84CC16] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore the 4 Courts</span>
              <ChevronDown className="w-4 h-4 text-neutral-500" />
            </button>
          </motion.div>

          {/* Step 6: Proof Line */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.78 }}
            className="pt-2 flex items-center justify-center gap-3 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400"
          >
            <span>4 Dedicated Courts</span>
            <span aria-hidden="true">·</span>
            <span>Single Venue</span>
            <span aria-hidden="true">·</span>
            <span>10-Min Temporary Hold</span>
          </motion.div>
        </div>

        {/* Step 7: Hero Visual */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-12 sm:mt-16 relative mx-auto max-w-5xl"
        >
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-neutral-200/80 dark:border-white/10 aspect-[16/9] bg-neutral-900 group">
            <CourtVisual courtId="hero" className="transition-transform duration-700 ease-out group-hover:scale-[1.02]" />

            {/* Subtle bottom-to-top contrast scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

            {/* Overlay badge with athletic lime identity */}
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-8 right-4 sm:right-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
              <div>
                <span className="text-[11px] font-mono tracking-widest uppercase text-[#A3E635] font-bold">
                  Venue Experience
                </span>
                <p className="text-lg sm:text-2xl font-bold font-display tracking-tight text-white mt-0.5">
                  Court 1 through Court 4
                </p>
              </div>

              <div className="text-xs sm:text-sm text-neutral-300 font-medium">
                Reserve Online · Hourly Blocks · Instant Hold
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
