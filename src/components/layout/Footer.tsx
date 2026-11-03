import React from 'react';
import { Logo } from '../brand/Logo';
import { VENUE_INFO } from '../../data/mockData';

interface FooterProps {
  // Public footer has no admin entry links
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="dark bg-neutral-900 dark:bg-[#050A14] text-neutral-400 py-12 sm:py-16 border-t border-neutral-800 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 pb-12 border-b border-neutral-800 dark:border-white/5">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center">
              <Logo size="md" />
            </div>
            <p className="text-sm text-neutral-400 max-w-sm leading-relaxed">
              Premium 4-court pickleball facility in the Philippines. Dedicated to high-standard court experiences, competition, and courtside community.
            </p>
            <div className="text-xs text-neutral-500 font-mono">
              Venue Model: Single Venue · Exactly 4 Courts
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-white">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/#courts" className="hover:text-[#A3E635] transition-colors">Our 4 Courts</a>
              </li>
              <li>
                <a href="/#experience" className="hover:text-[#A3E635] transition-colors">Venue Experience</a>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-[#A3E635] transition-colors">How Booking Works</a>
              </li>
              <li>
                <a href="/paddles" className="hover:text-[#A3E635] transition-colors">Paddle Showcase & Shop</a>
              </li>
              <li>
                <a href="/#location" className="hover:text-[#A3E635] transition-colors">Location & Contact</a>
              </li>
            </ul>
          </div>

          {/* Operating Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold tracking-widest uppercase text-white">
              Club Hours (Provisional)
            </h4>
            <p className="text-sm text-neutral-300">
              {VENUE_INFO.provisionalHours}
            </p>
            <p className="text-xs text-neutral-500">
              Hours configurable by venue administration.
            </p>
            <div className="pt-2 text-xs text-neutral-400">
              <span>Timezone: </span>
              <span className="font-mono text-neutral-200">Asia/Manila (UTC+8)</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} PADDLE TOP. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Play</span>
            <span aria-hidden="true">·</span>
            <span>Compete</span>
            <span aria-hidden="true">·</span>
            <span>Connect</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
