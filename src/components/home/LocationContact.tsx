import React from 'react';
import { MapPin, Clock, Phone, MessageSquare, ExternalLink } from 'lucide-react';
import { VENUE_INFO } from '../../data/mockData';
import { BlurFade } from '../ui/MotionPrimitives';

export const LocationContact: React.FC = () => {
  return (
    <section id="location" className="py-16 sm:py-24 bg-neutral-100/60 dark:bg-[#070D18] border-t border-neutral-200/80 dark:border-white/5 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Practical Info (5 cols on Desktop) */}
          <div className="lg:col-span-5 space-y-6">
            <BlurFade yOffset={16} duration={0.45} once={true}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="text-xs sm:text-sm font-semibold tracking-wider text-[#4D7C0F] dark:text-[#A3E635] uppercase">
                    Find & Reach Us
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                    Location & Schedule
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300">
                  Convenient access, courtside amenities, and active staff ready to assist. Contact us through our primary channels below.
                </p>

                <div className="space-y-4 pt-2">
                  {/* Address */}
                  <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white dark:bg-[#0E172A] border border-neutral-200/80 dark:border-white/10">
                    <MapPin className="w-5 h-5 text-[#4D7C0F] dark:text-[#A3E635] shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                        Venue Location
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 mt-0.5">
                        {VENUE_INFO.addressPlaceholder}
                      </p>
                      <span className="text-[11px] text-neutral-400 font-mono mt-1 block">
                        (Exact venue address will be finalized upon official launch)
                      </span>
                    </div>
                  </div>

                  {/* Operating Hours (Provisional) */}
                  <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white dark:bg-[#0E172A] border border-neutral-200/80 dark:border-white/10">
                    <Clock className="w-5 h-5 text-[#84CC16] shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                          Operating Hours
                        </h3>
                        <span className="text-[10px] font-mono uppercase bg-neutral-200 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 px-1.5 py-0.5 rounded">
                          Provisional
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 mt-0.5">
                        {VENUE_INFO.provisionalHours}
                      </p>
                      <span className="text-[11px] text-neutral-400 font-mono mt-1 block">
                        Asia/Manila timezone · Subject to club adjustments
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Connect Buttons */}
                <div className="pt-2 flex flex-wrap gap-2.5">
                  <a
                    href={VENUE_INFO.contactChannels.messenger}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-[#0A1120] dark:text-white bg-neutral-200/80 dark:bg-white/10 hover:bg-[#84CC16] hover:text-[#0A1120] transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Messenger</span>
                  </a>

                  <a
                    href={VENUE_INFO.contactChannels.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-[#0A1120] dark:text-white bg-neutral-200/80 dark:bg-white/10 hover:bg-[#84CC16] hover:text-[#0A1120] transition-colors"
                  >
                    <span>Facebook</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={`tel:${VENUE_INFO.contactChannels.phone}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-[#0A1120] dark:text-white bg-neutral-200/80 dark:bg-white/10 hover:bg-[#84CC16] hover:text-[#0A1120] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Venue</span>
                  </a>
                </div>
              </div>
            </BlurFade>
          </div>

          {/* Map Preview / Location Graphic (7 cols on Desktop) */}
          <div className="lg:col-span-7">
            <BlurFade yOffset={20} delay={0.12} duration={0.5} once={true}>
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[16/10] border border-neutral-200/90 dark:border-white/10 bg-neutral-900 shadow-md flex items-center justify-center p-6 text-center">
                {/* Stylized map grid artwork */}
                <svg viewBox="0 0 700 450" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover absolute inset-0">
                  <rect width="700" height="450" fill="#070D18" />
                  {/* Street grid paths */}
                  <path d="M 0 100 L 700 120 M 0 240 L 700 230 M 0 360 L 700 370" stroke="#14223C" strokeWidth="18" />
                  <path d="M 160 0 L 170 450 M 340 0 L 350 450 M 520 0 L 510 450" stroke="#14223C" strokeWidth="18" />
                  <path d="M 0 100 L 700 120 M 0 240 L 700 230 M 0 360 L 700 370" stroke="#1E2E4E" strokeWidth="4" />
                  <path d="M 160 0 L 170 450 M 340 0 L 350 450 M 520 0 L 510 450" stroke="#1E2E4E" strokeWidth="4" />

                  {/* Venue Location Pin at Center */}
                  <g transform="translate(350, 230)">
                    <circle cx="0" cy="0" r="38" fill="#84CC16" fillOpacity="0.25" className="animate-ping" />
                    <circle cx="0" cy="0" r="22" fill="#84CC16" />
                    <circle cx="0" cy="0" r="8" fill="#0A1120" />
                  </g>

                  <text x="350" y="278" fill="#FFFFFF" fontSize="13" fontWeight="800" textAnchor="middle" letterSpacing="2">
                    PADDLE TOP VENUE
                  </text>
                  <text x="350" y="296" fill="#A3E635" fontSize="11" fontWeight="700" textAnchor="middle" letterSpacing="1">
                    COURT 1 · 2 · 3 · 4
                  </text>
                </svg>

                {/* Floating Action Box */}
                <div className="relative z-10 bg-[#0A1120]/85 backdrop-blur-md border border-white/20 p-5 rounded-2xl max-w-sm mx-auto text-white shadow-xl">
                  <MapPin className="w-6 h-6 text-[#84CC16] mx-auto mb-2" />
                  <h4 className="font-bold text-base font-display">
                    PADDLE TOP Pickleball Facility
                  </h4>
                  <p className="text-xs text-neutral-300 mt-1">
                    Philippines · Single Dedicated Venue
                  </p>
                  <a
                    href={VENUE_INFO.contactChannels.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-[#0A1120] bg-[#84CC16] hover:bg-[#A3E635] transition-colors"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </BlurFade>
          </div>
        </div>
      </div>
    </section>
  );
};
