import React, { useState, useEffect } from 'react';
import { Sun, Moon, Menu, X, ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Logo } from '../brand/Logo';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  onNavigateHome?: () => void;
  onNavigateBooking?: (courtId?: string) => void;
  onNavigatePaddles?: () => void;
  onNavigateSection?: (sectionId: string) => void;
  currentPath?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigateHome,
  onNavigateBooking,
  onNavigatePaddles,
  onNavigateSection,
  currentPath = '/',
}) => {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const isBookingPage = currentPath === '/booking' || currentPath.startsWith('/booking');
  const isPaddlesPage = currentPath === '/paddles' || currentPath.startsWith('/paddles');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Courts', sectionId: 'courts', isRoute: false },
    { label: 'Experience', sectionId: 'experience', isRoute: false },
    { label: 'How It Works', sectionId: 'how-it-works', isRoute: false },
    { label: 'Paddles', sectionId: 'paddles', isRoute: true, path: '/paddles' },
    { label: 'Location', sectionId: 'location', isRoute: false },
  ];

  const handleLinkClick = (link: { label: string; sectionId: string; isRoute?: boolean; path?: string }) => {
    setMobileMenuOpen(false);
    if (link.isRoute && link.path === '/paddles') {
      if (onNavigatePaddles) {
        onNavigatePaddles();
      } else {
        window.history.pushState({}, '', '/paddles');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
      return;
    }

    if (onNavigateSection) {
      onNavigateSection(link.sectionId);
    } else {
      const el = document.getElementById(link.sectionId);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBrandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleActionClick = (courtId?: string) => {
    setMobileMenuOpen(false);
    if (onNavigateBooking) {
      onNavigateBooking(courtId);
    }
  };

  return (
    <>
      <motion.header
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || isBookingPage || isPaddlesPage
            ? 'bg-neutral-50/92 dark:bg-[#070D18]/92 backdrop-blur-md border-b border-neutral-200/80 dark:border-white/10 shadow-xs py-3.5'
            : 'bg-transparent py-5 sm:py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Zone 1: Brand Wordmark / Monogram (Untouched Authentic Logo) */}
            <a
              href="/"
              onClick={handleBrandClick}
              className="group transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-[#84CC16] rounded-lg cursor-pointer"
              aria-label="PADDLE TOP Home"
            >
              <Logo size="md" />
            </a>

            {/* Zone 2: Navigation Links (Clean text, accessible hover) */}
            <nav className="hidden md:flex items-center gap-7 lg:gap-10 text-[15px] font-medium text-neutral-600 dark:text-neutral-300">
              {navLinks.map((link) => {
                const isActive = link.isRoute && isPaddlesPage;
                return (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => handleLinkClick(link)}
                    className={`transition-colors relative py-1 focus-visible:outline-2 focus-visible:outline-[#84CC16] rounded-sm cursor-pointer ${
                      isActive
                        ? 'text-[#4D7C0F] dark:text-[#A3E635] font-bold'
                        : 'hover:text-[#4D7C0F] dark:hover:text-[#A3E635]'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Primary Actions (Theme Toggle + Athletic Lime CTA) */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
                title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
                className="p-2.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-lg transition-colors border border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[#84CC16] cursor-pointer"
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4 text-neutral-700" />
                ) : (
                  <Sun className="w-4 h-4 text-[#A3E635]" />
                )}
              </button>

              {/* Primary Book a Court CTA */}
              <button
                type="button"
                onClick={() => handleActionClick()}
                className={`hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-[15px] font-bold tracking-wide rounded-xl transition-all shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#84CC16] whitespace-nowrap cursor-pointer active:scale-[0.98] ${
                  isBookingPage
                    ? 'bg-neutral-200 dark:bg-white/10 text-neutral-800 dark:text-white hover:bg-neutral-300 dark:hover:bg-white/15'
                    : 'text-[#0A1120] bg-[#84CC16] hover:bg-[#A3E635] hover:shadow-md'
                }`}
              >
                <span>{isBookingPage ? 'Live Availability' : 'Book a Court'}</span>
              </button>

              {/* Mobile Menu Trigger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-neutral-700 dark:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#84CC16]"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-neutral-950/60 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="fixed top-16 right-0 left-0 bg-neutral-50 dark:bg-[#0C1424] border-b border-neutral-200 dark:border-white/10 p-6 shadow-xl space-y-4">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => {
                const isActive = link.isRoute && isPaddlesPage;
                return (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => handleLinkClick(link)}
                    className={`px-3 py-2.5 text-base rounded-md transition-colors text-left cursor-pointer ${
                      isActive
                        ? 'font-bold text-[#4D7C0F] dark:text-[#A3E635] bg-[#84CC16]/10'
                        : 'font-semibold text-neutral-800 dark:text-neutral-100 hover:text-[#4D7C0F] dark:hover:text-[#A3E635]'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-neutral-200 dark:border-white/10 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleActionClick()}
                className="w-full py-3 px-4 text-center text-sm font-bold text-[#0A1120] bg-[#84CC16] hover:bg-[#A3E635] rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isBookingPage ? 'Live Availability' : 'Book a Court'}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
