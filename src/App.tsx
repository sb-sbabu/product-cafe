import { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/layout';
import { HomePage } from './features/home/HomePage';
import { GrabAndGoPage } from './features/grab-and-go/GrabAndGoPage';
import { LibraryPage } from './features/library/LibraryPage';
import { CommunityPage } from './features/community/CommunityPage';
import { SearchResultsPage } from './features/search/SearchResultsPage';
import { MyCafePage } from './features/my-cafe/MyCafePage';
import { GamificationDemo } from './features/demo/GamificationDemo';
import { AdminPage } from './features/admin/AdminPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { LeaderboardPage } from './features/leaderboard/LeaderboardPage';
import { ErrorBoundary, ToastProvider, SkipLink, useToast, CommandPalette } from './components/ui';
import { CafeDock } from './components/dock/CafeDock';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DockProvider, useDock } from './contexts/DockContext';
import { GamificationProvider } from './contexts/GamificationContext';
import { GamificationEngine } from './components/gamification/GamificationEngine';
import { useAnalytics } from './hooks/useAnalytics';
import { usePulseInit } from './hooks/usePulseInit';
import { PulseDashboard } from './components/pulse/PulseDashboard';
import { Sidebar } from './components/layout/Sidebar';
import { LOPHubPage, LOPSessionDetail, LOPArchivePage, LOPLearningPath, LOPAnalyticsPage } from './features/lop';
import { cn } from './lib/utils';

type ActivePage = 'home' | 'grab-and-go' | 'library' | 'community' | 'search' | 'my-cafe' | 'demo' | 'admin' | 'profile' | 'leaderboard' | 'pulse' | 'credits' | 'lop' | 'lop-session' | 'lop-archive' | 'lop-path' | 'lop-analytics';

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
  const [activePage, setActivePage] = useState<ActivePage>(() => {
    const path = window.location.pathname;
    if (path === '/demo') return 'demo';
    if (path === '/leaderboard') return 'leaderboard';
    if (path === '/admin') return 'admin';
    if (path === '/pulse') return 'pulse';
    if (path === '/lop') return 'lop';
    return 'home';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [lopParams, setLopParams] = useState<{ slug?: string }>({});
  const isMobile = useIsMobile();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { trackPageView, trackSearch } = useAnalytics();
  const { toggleDock, setPageContext } = useDock();

  // 🚀 PULSE: Auto-fetch live healthcare news on app load
  usePulseInit();

  // Track page views and update dock context
  useEffect(() => {
    trackPageView(activePage);
    if (activePage !== 'demo' && activePage !== 'credits') {
      setPageContext({ type: activePage as 'home' | 'grab-and-go' | 'library' | 'community' | 'search' | 'my-cafe' | 'admin' | 'profile' | 'leaderboard' | 'pulse' });
    }
  }, [activePage, trackPageView, setPageContext]);

  const handleNavigate = useCallback((pageId: string, params?: Record<string, string>) => {
    setActivePage(pageId as ActivePage);
    if (params?.slug) setLopParams({ slug: params.slug });
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
      case 'demo':
        return <GamificationDemo />;
      case 'admin':
        return <AdminPage />;
      case 'profile':
        return <ProfilePage />;
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'credits':
        return <GamificationDemo />; // Beautiful credits demo page
      case 'pulse':
        return <PulseDashboard />;
      case 'lop':
        return <LOPHubPage onNavigate={handleNavigate} />;
      case 'lop-session':
        return <LOPSessionDetail slug={lopParams.slug || ''} onNavigate={handleNavigate} onBack={() => handleNavigate('lop')} />;
      case 'lop-archive':
        return <LOPArchivePage onNavigate={handleNavigate} onBack={() => handleNavigate('lop')} />;
      case 'lop-path':
        return <LOPLearningPath slug={lopParams.slug || ''} onNavigate={handleNavigate} onBack={() => handleNavigate('lop')} />;
      case 'lop-analytics':
        return <LOPAnalyticsPage onBack={() => handleNavigate('lop')} />;
      default:
        return <HomePage onNavigate={handleNavigate} userName={user?.firstName || 'there'} />;
    }
  };

  return (
    <>
      <SkipLink href="#main-content">Skip to main content</SkipLink>

      {/* Main flex container for squeeze layout */}
      <div className="flex min-h-screen">
        {/* Left Sidebar - Premium Navigation */}
        {!isMobile && <Sidebar activePage={activePage} onNavigate={handleNavigate} />}

        {/* Main content area - grows to fill available space, with margin for fixed dock */}
        <div className={cn("flex-1 overflow-auto", !isMobile && "mr-[70px]")}>
          <Layout
            activePage={activePage}
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
      </div>

      {/* Café Dock - Fixed position on right (desktop only) */}
      {!isMobile && <CafeDock />}

      {/* Mobile dock */}
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
          <GamificationProvider>
            <GamificationEngine />
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </GamificationProvider>
        </DockProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

