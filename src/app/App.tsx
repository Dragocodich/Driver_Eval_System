import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from './components/ui/sonner';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { AssessmentDetails } from './components/AssessmentDetails';
import { AuthService, AuthUser } from './lib/auth-service';

export type PageType = 'login' | 'dashboard' | 'assessment-details';
export type AssessmentType = 'initial' | 'interview' | 'in-cab';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.25, 0, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 1.05,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.25, 0, 1]
    }
  }
};

const backgroundVariants = {
  login: {
    background: 'linear-gradient(135deg, rgba(6, 18, 40, 0.08) 0%, rgba(10, 43, 76, 0.18) 100%)'
  },
  dashboard: {
    background: 'linear-gradient(135deg, rgba(8, 28, 58, 0.12) 0%, rgba(7, 54, 80, 0.2) 100%)'
  },
  'assessment-details': {
    background: 'linear-gradient(135deg, rgba(6, 20, 43, 0.15) 0%, rgba(20, 50, 72, 0.2) 100%)'
  }
};

const floatingElements = [
  { top: '-8%', left: '-4%', size: 'w-80 h-80', color: 'bg-blue-500/15', blur: 'blur-3xl' },
  { bottom: '-12%', right: '-6%', size: 'w-96 h-96', color: 'bg-cyan-400/10', blur: 'blur-3xl' },
  { top: '38%', right: '18%', size: 'w-64 h-64', color: 'bg-sky-400/5', blur: 'blur-3xl' }
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('login');
  const [currentAssessment, setCurrentAssessment] = useState<AssessmentType>('in-cab');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('login');
      }
      setIsLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage('dashboard');
      setIsTransitioning(false);
    }, 300);
  };

  const handleLogout = async () => {
    try {
      setIsTransitioning(true);
      await AuthService.signOut();
      setTimeout(() => {
        setCurrentPage('login');
        setIsTransitioning(false);
      }, 300);
    } catch (error) {
      console.error('Logout error:', error);
      setIsTransitioning(false);
    }
  };

  const handlePageChange = (page: PageType) => {
    if (page === 'login') {
      handleLogout();
      return;
    }
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage(page);
      setIsTransitioning(false);
    }, 300);
  };

  const handleAssessmentClick = (assessmentType: AssessmentType) => {
    setCurrentAssessment(assessmentType);
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage('assessment-details');
      setIsTransitioning(false);
    }, 300);
  };

  const renderCurrentPage = () => {
    if (!user && currentPage !== 'login') {
      return <LoginPage onLogin={handleLogin} />;
    }

    switch (currentPage) {
      case 'login':
        return <LoginPage onLogin={handleLogin} />;
      case 'dashboard':
        return <Dashboard onAssessmentClick={handleAssessmentClick} />;
      case 'assessment-details':
        return (
          <AssessmentDetails 
            assessmentType={currentAssessment}
            onBackToDashboard={() => handlePageChange('dashboard')}
          />
        );
      default:
        return <Dashboard onAssessmentClick={handleAssessmentClick} />;
    }
  };

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07162d]">
        <motion.div
          className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#07162d]">
      <div className="fixed inset-0 bg-[linear-gradient(145deg,#07162d_0%,#0b2945_55%,#0b3650_100%)]" />
      <div className="fixed inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:48px_48px]" />
      
      {/* Animated Background Overlay */}
      <motion.div 
        className="fixed inset-0"
        animate={currentPage}
        variants={backgroundVariants}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-[#04101f]/30"></div>
      
      {/* Animated Floating Elements */}
      {floatingElements.map((element, index) => (
        <motion.div
          key={index}
          className={`fixed ${element.size} ${element.color} rounded-full ${element.blur}`}
          style={{
            top: element.top,
            bottom: element.bottom,
            left: element.left,
            right: element.right
          }}
          animate={{
            y: [0, -14, 0],
            scale: [1, 1.04, 1]
          }}
          transition={{
            duration: 9 + index,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.5
          }}
        />
      ))}
      
      {/* Loading Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="fixed inset-0 bg-white/20 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <Header 
          currentPage={currentPage}
          onPageChange={handlePageChange}
          isLoggedIn={!!user}
          user={user}
        />
        
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              variants={pageVariants}
              initial="initial"
              animate="enter"
              exit="exit"
              className="h-full"
            >
              {renderCurrentPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      
      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
        }}
      />
    </div>
  );
}
