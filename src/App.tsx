import { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/layout';
import { HomePage } from './features/home/HomePage';
import { GrabAndGoPage } from './features/grab-and-go/GrabAndGoPage';
import { LibraryPage } from './features/library/LibraryPage';
import { CommunityPage } from './features/community/CommunityPage';
import { SearchResultsPage } from './features/search/SearchResultsPage';
import { MyCafePage } from './features/my-cafe/MyCafePage';
import { ErrorBoundary, ToastProvider, SkipLink, useToast, CommandPalette } from './components/ui';
import { CafeDock } from './components/dock/CafeDock';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DockProvider, useDock } from './contexts/DockContext';
import { useAnalytics } from './hooks/useAnalytics';

type ActivePage = 'home' | 'grab-and-go' | 'library' | 'community' | 'search' | 'my-cafe';

// Hook for responsive detection
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

function AppContent() {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const isMobile = useIsMobile();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { trackPageView, trackSearch } = useAnalytics();
  const { toggleDock, setPageContext } = useDock();

  // Track page views and update dock context
  useEffect(() => {
    trackPageView(activePage);
    setPageContext({ type: activePage });
  }, [activePage, trackPageView, setPageContext]);

  const handleNavigate = useCallback((pageId: string) => {
    setActivePage(pageId as ActivePage);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setActivePage('search');
    trackSearch(query, 0); // Count will be updated when results load
  }, [trackSearch]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Allow Escape to blur inputs
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      // "/" or Cmd/Ctrl+K to open Command Palette
      if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }

      // "?" to open Café Dock
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        toggleDock();
      }

      // "d" to toggle dock
      if (e.key === 'd' && !e.metaKey && !e.ctrlKey) {
        toggleDock();
      }

      // "g" then "h" for go home (vim-style)
      if (e.key === 'g') {
        const handleSecondKey = (e2: KeyboardEvent) => {
          if (e2.key === 'h') {
            handleNavigate('home');
          } else if (e2.key === 'l') {
            handleNavigate('library');
          } else if (e2.key === 'c') {
            handleNavigate('community');
          } else if (e2.key === 'm') {
            handleNavigate('my-cafe');
          }
          document.removeEventListener('keydown', handleSecondKey);
        };
        document.addEventListener('keydown', handleSecondKey, { once: true });
        setTimeout(() => document.removeEventListener('keydown', handleSecondKey), 1000);
      }

      // Escape to go home
      if (e.key === 'Escape' && activePage !== 'home') {
        handleNavigate('home');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activePage, handleNavigate, toggleDock, showToast]);

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} userName={user?.firstName || 'there'} />;
      case 'grab-and-go':
        return <GrabAndGoPage onNavigate={handleNavigate} />;
      case 'library':
        return <LibraryPage onNavigate={handleNavigate} />;
      case 'community':
        return <CommunityPage onNavigate={handleNavigate} />;
      case 'search':
        return <SearchResultsPage initialQuery={searchQuery} onNavigate={handleNavigate} />;
      case 'my-cafe':
        return <MyCafePage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} userName={user?.firstName || 'there'} />;
    }
  };

  return (
    <>
      <SkipLink href="#main-content">Skip to main content</SkipLink>

      {/* Main flex container for squeeze layout */}
      <div className="flex min-h-screen">
        {/* Main content area - grows to fill available space */}
        <div className="flex-1 overflow-auto">
          <Layout
            activeNav={activePage}
            onNavigate={handleNavigate}
            onSearch={handleSearch}
            isMobile={isMobile}
          >
            <main
              id="main-content"
              tabIndex={-1}
              role="main"
              aria-label="Main content"
            >
              <ErrorBoundary>
                {/* Key forces remount for page transition animation */}
                <div key={activePage} className="page-transition">
                  {renderPage()}
                </div>
              </ErrorBoundary>
            </main>
          </Layout>
        </div>

        {/* Café Dock - Always visible on right, part of flex layout */}
        {!isMobile && <CafeDock />}
      </div>

      {/* Mobile dock - fixed position */}
      {isMobile && <CafeDock />}

      {/* Keyboard shortcuts hint - only on desktop */}
      {!isMobile && (
        <div className="fixed bottom-4 left-4 hidden lg:flex items-center gap-3 text-xs text-gray-400">
          <span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono">/</kbd> Search</span>
          <span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono">d</kbd> Dock</span>
          <span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono">gm</kbd> My Café</span>
        </div>
      )}

      {/* Command Palette - Universal Search Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
      />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DockProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </DockProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

