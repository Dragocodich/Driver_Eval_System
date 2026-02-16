import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LogOut, User as UserIcon } from 'lucide-react';
import { PageType } from '../App';
import { AuthUser } from '../lib/auth-service';

interface HeaderProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  isLoggedIn: boolean;
  user?: AuthUser | null;
}

export function Header({ currentPage, onPageChange, isLoggedIn, user }: HeaderProps) {
  if (currentPage === 'login') {
    return null;
  }

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Dashboard';
      case 'assessment-details':
        return 'Assessment Details';
      default:
        return 'TRISTAR';
    }
  };

  const headerVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.25, 0, 1],
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <motion.header
      className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-40"
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Navigation */}
          <motion.div className="flex items-center space-x-6" variants={itemVariants}>
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg border border-white/30"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-white text-lg">📋</span>
              </motion.div>
              <div>
                <h1 className="text-xl text-white">TRISTAR</h1>
                <p className="text-xs text-white/80">Driver Assessment System</p>
              </div>
            </motion.div>

            {/* Page Indicator */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Badge 
                variant="outline" 
                className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 py-1 text-sm"
              >
                {getPageTitle()}
              </Badge>
            </motion.div>
          </motion.div>

          {/* Right side - User Info and Actions */}
          {isLoggedIn && (
            <motion.div className="flex items-center space-x-4" variants={itemVariants}>
              {/* User Info */}
              <motion.div 
                className="hidden sm:flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <UserIcon className="w-4 h-4 text-white" />
                </motion.div>
                <div className="text-white">
                  <div className="text-sm">{user?.email || 'User'}</div>
                  <div className="text-xs text-white/70">
                    Administrator
                  </div>
                </div>
              </motion.div>

              {/* Logout Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => onPageChange('login')}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white shadow-lg"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Animated underline */}
      <motion.div
        className="h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </motion.header>
  );
}