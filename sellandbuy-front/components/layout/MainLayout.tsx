import React from 'react';
import { Navbar } from '../ui/Navbar';
import { BottomNav } from '../ui/BottomNav';
import { EmailVerificationBanner } from '../ui/EmailVerificationBanner';

interface MainLayoutProps {
  children: React.ReactNode;
  showSearch?: boolean;
  hideNavbar?: boolean;
  hideBottomNav?: boolean;
}

/**
 * MainLayout — Global reusable layout for the marketplace.
 * Ensures consistent padding, max-width, and navigation components.
 */
export function MainLayout({ 
  children, 
  showSearch = true, 
  hideNavbar = false,
  hideBottomNav = false 
}: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[--color-surface]">
      {!hideNavbar && <Navbar showSearch={showSearch} />}
      <EmailVerificationBanner />

      {/* Main content area with consistent max-width and padding */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-24 md:pb-8">
        {children}
      </main>
      
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}
