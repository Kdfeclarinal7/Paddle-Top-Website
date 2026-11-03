import React from 'react';
import { Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { BlurFade, AnimatedGroup } from '../ui/MotionPrimitives';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Choose Court & Hours',
      desc: 'Browse live availability across Courts 1 through 4. Select your date and one or more consecutive 1-hour blocks.',
      icon: Calendar,
    },
    {
      num: '02',
      title: 'Sign In & Lock 10-Min Hold',
      desc: 'Sign in before checkout. Your entire continuous session is locked with a 10-minute hold to guarantee your spot.',
      icon: ShieldCheck,
    },
    {
      num: '03',
      title: 'Pay & Play',
      desc: 'Complete payment online with instant confirmation and reference code. Head to the venue ready to rally.',
      icon: CheckCircle2,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-neutral-100/50 dark:bg-[#080E1C] border-y border-neutral-200/80 dark:border-white/5 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BlurFade yOffset={18} duration={0.4} once={true}>
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-12 sm:mb-16">
            <div className="text-xs sm:text-sm font-semibold tracking-wider text-[#4D7C0F] dark:text-[#A3E635] uppercase">
              Simple Process
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              How Booking Works
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300">
              Three simple steps from selecting your hourly blocks to stepping onto the court.
            </p>
          </div>
        </BlurFade>

        {/* Coordinated Group Entrance */}
        <AnimatedGroup stagger={0.09} delay={0.06} once={true} className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative bg-white dark:bg-[#0E172A] p-6 sm:p-8 rounded-2xl border border-neutral-200/90 dark:border-white/10 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold tracking-widest text-[#3F6212] dark:text-[#A3E635] bg-[#84CC16]/15 px-2.5 py-1 rounded-md">
                      STEP {step.num}
                    </span>
                    <Icon className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white font-display">
                    {step.title}
                  </h3>

                  <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </AnimatedGroup>
      </div>
    </section>
  );
};
