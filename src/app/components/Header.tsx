import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react';
import { PageType } from '../App';
import { AuthUser } from '../lib/auth-service';
import { BrandMark } from './BrandMark';

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
      className="sticky top-0 z-40 border-b border-white/10 bg-[#07162d]/85 shadow-[0_8px_30px_rgba(2,8,23,0.18)] backdrop-blur-xl"
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between">
          {/* Left side - Logo and Navigation */}
          <motion.div className="flex min-w-0 items-center gap-3 sm:gap-6" variants={itemVariants}>
            <motion.div 
              className="flex min-w-0 items-center space-x-3"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <BrandMark className="h-10 w-10 shrink-0 rounded-xl ring-1 ring-white/20" iconClassName="h-5 w-5" />
              <div>
                <h1 className="text-base font-bold tracking-[0.18em] text-white sm:text-lg">TRISTAR</h1>
                <p className="hidden text-[11px] text-slate-300 sm:block">Driver Assessment System</p>
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
                className="hidden border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs font-medium text-slate-200 sm:flex"
              >
                <LayoutDashboard className="mr-1.5 h-3.5 w-3.5 text-cyan-300" />
                {getPageTitle()}
              </Badge>
            </motion.div>
          </motion.div>

          {/* Right side - User Info and Actions */}
          {isLoggedIn && (
            <motion.div className="flex items-center space-x-4" variants={itemVariants}>
              {/* User Info */}
              <motion.div 
                className="hidden items-center space-x-3 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 sm:flex"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <UserIcon className="h-4 w-4 text-blue-200" />
                </motion.div>
                <div className="text-white">
                  <div className="max-w-40 truncate text-xs font-medium">{user?.email || 'User'}</div>
                  <div className="text-[10px] text-slate-400">
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
                  className="h-9 rounded-xl border-white/15 bg-white/[0.06] text-white shadow-none hover:bg-white/10 hover:text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent" />
    </motion.header>
  );
}
