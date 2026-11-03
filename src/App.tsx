import React, { useState, useEffect } from 'react';
import type { CourtId } from './types';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/home/Hero';
import { CourtsSection } from './components/home/CourtsSection';
import { VenueExperience } from './components/home/VenueExperience';
import { HowItWorks } from './components/home/HowItWorks';
import { EditorialTeaser } from './components/home/EditorialTeaser';
import { LocationContact } from './components/home/LocationContact';
import { Footer } from './components/layout/Footer';
import { BookingPage } from './components/booking/BookingPage';
import { PaddlesPage } from './components/paddles/PaddlesPage';
import { OwnerDeskGate } from './components/admin/OwnerDeskGate';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const [courtParam, setCourtParam] = useState<CourtId>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const c = params.get('court') as CourtId | null;
      if (c && ['court-1', 'court-2', 'court-3', 'court-4'].includes(c)) {
        return c;
      }
    }
    return 'court-1';
  });

  // Handle browser popstate (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname || '/';
      setCurrentPath(path);
      const params = new URLSearchParams(window.location.search);
      const c = params.get('court') as CourtId | null;
      if (c && ['court-1', 'court-2', 'court-3', 'court-4'].includes(c)) {
        setCourtParam(c);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', to);
      const [pathOnly, query] = to.split('?');
      setCurrentPath(pathOnly);

      if (query) {
        const params = new URLSearchParams(query);
        const c = params.get('court') as CourtId | null;
        if (c && ['court-1', 'court-2', 'court-3', 'court-4'].includes(c)) {
          setCourtParam(c);
        }
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavigateSection = (sectionId: string) => {
    if (currentPath !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookCourtClick = (courtId?: string) => {
    if (courtId && ['court-1', 'court-2', 'court-3', 'court-4'].includes(courtId)) {
      navigate(`/booking?court=${courtId}`);
    } else {
      navigate('/booking');
    }
  };

  const isBookingPage = currentPath === '/booking' || currentPath.startsWith('/booking');
  const isPaddlesPage = currentPath === '/paddles' || currentPath.startsWith('/paddles');
  const isAdminPage = currentPath === '/admin' || currentPath.startsWith('/admin');

  return (
    <AuthProvider>
    <ThemeProvider>
      {isAdminPage ? (
        <OwnerDeskGate
          onNavigateHome={() => navigate('/')}
          onNavigateBooking={() => navigate('/booking')}
          onNavigatePaddles={() => navigate('/paddles')}
        />
      ) : (
        <div className="min-h-screen bg-neutral-50 dark:bg-[#070D18] text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
          {/* Global Navigation */}
          <Navbar
            currentPath={currentPath}
            onNavigateHome={() => navigate('/')}
            onNavigateBooking={handleBookCourtClick}
            onNavigatePaddles={() => navigate('/paddles')}
            onNavigateSection={handleNavigateSection}
          />

          {/* View Switcher: /booking vs /paddles vs / (Home) */}
          {isBookingPage ? (
            <BookingPage
              initialCourtId={courtParam}
              onNavigateHome={() => navigate('/')}
            />
          ) : isPaddlesPage ? (
            <PaddlesPage
              onNavigateHome={() => navigate('/')}
              onNavigateBooking={() => navigate('/booking')}
            />
          ) : (
            <main className="flex-1">
              <Hero
                onBookCourt={() => navigate('/booking')}
                onExploreCourts={() => {
                  const el = document.getElementById('courts');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              />

              <CourtsSection
                onSelectCourt={(courtId) => handleBookCourtClick(courtId)}
              />

              <VenueExperience />

              <HowItWorks />

              <EditorialTeaser
                onExplorePaddles={() => navigate('/paddles')}
              />

              <LocationContact />
            </main>
          )}

          {/* Global Footer */}
          <Footer />
        </div>
      )}
    </ThemeProvider>
    </AuthProvider>
  );
}
