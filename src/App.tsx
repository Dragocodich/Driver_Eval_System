import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from './components/ui/sonner';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { AssessmentDetails } from './components/AssessmentDetails';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
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
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(16, 185, 129, 0.2) 50%, rgba(6, 182, 212, 0.3) 100%)'
  },
  dashboard: {
    background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.3) 0%, rgba(14, 116, 144, 0.2) 50%, rgba(15, 118, 110, 0.4) 100%)'
  },
  'assessment-details': {
    background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.3) 0%, rgba(75, 85, 99, 0.2) 50%, rgba(107, 114, 128, 0.3) 100%)'
  }
};

const floatingElements = [
  { top: '5%', left: '5%', size: 'w-32 h-32', color: 'bg-white/10', blur: 'blur-xl' },
  { bottom: '5%', right: '5%', size: 'w-48 h-48', color: 'bg-cyan-300/20', blur: 'blur-2xl' },
  { top: '50%', left: '2%', size: 'w-24 h-24', color: 'bg-teal-400/15', blur: 'blur-lg' },
  { top: '20%', right: '10%', size: 'w-16 h-16', color: 'bg-blue-400/20', blur: 'blur-md' },
  { bottom: '30%', left: '8%', size: 'w-20 h-20', color: 'bg-emerald-300/15', blur: 'blur-lg' }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600">
        <motion.div
          className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Sky and Ocean Background */}
      <div className="fixed inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Sky and ocean background"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Animated Background Overlay */}
      <motion.div 
        className="fixed inset-0"
        animate={currentPage}
        variants={backgroundVariants}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
      <div className="fixed inset-0 bg-black/10"></div>
      
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
            y: [0, -10, 0],
            x: [0, 5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 6 + index,
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