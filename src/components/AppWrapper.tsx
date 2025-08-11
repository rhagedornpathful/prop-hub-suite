import { ReactNode, Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingState } from '@/components/ui/loading-state';
import { AccessibilityMenu } from '@/components/AccessibilityMenu';
import { Toaster } from '@/components/ui/toaster';

interface AppWrapperProps {
  children: ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <Suspense fallback={<LoadingState isLoading={true} text="Loading application..."><div /></LoadingState>}>
          <div className="min-h-screen">
            {/* Skip navigation link for accessibility */}
            <a href="#main-content" className="skip-nav">
              Skip to main content
            </a>
            
            <main id="main-content">
              {children}
            </main>
            
            {/* Global components */}
            <AccessibilityMenu />
            <Toaster />
          </div>
        </Suspense>
      </ErrorBoundary>
    </HelmetProvider>
  );
}