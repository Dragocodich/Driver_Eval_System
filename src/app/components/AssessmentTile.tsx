import { motion } from 'motion/react';
import { Card } from './ui/card';
import { LucideIcon } from 'lucide-react';

interface AssessmentTileProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  onClick: () => void;
}

export function AssessmentTile({ title, subtitle, icon: Icon, onClick }: AssessmentTileProps) {
  const cardVariants = {
    initial: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.25, 0, 1]
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.98,
      y: -4
    }
  };

  const iconVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { delay: 0.2, duration: 0.3 }
    },
    hover: {
      scale: 1.1,
      rotate: [0, -5, 5, 0],
      transition: { duration: 0.4 }
    }
  };

  const textVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { delay: 0.3, duration: 0.3 }
    }
  };

  const backgroundVariants = {
    hover: {
      background: [
        "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
        "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
        "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
    >
      <Card 
        className="group relative flex h-44 cursor-pointer flex-col items-start justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-[0_10px_35px_rgba(15,23,42,0.08)]"
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick();
          }
        }}
      >
        {/* Background Animation */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          variants={backgroundVariants}
          whileHover="hover"
        />
        
        {/* Ripple Effect */}
        {/* Content */}
        <div className="relative z-10 flex h-full w-full flex-col items-start justify-between">
          <motion.div 
            className="rounded-xl bg-blue-50 p-3 text-blue-600 transition-all duration-300 group-hover:bg-white/15 group-hover:text-white"
            variants={iconVariants}
            whileHover="hover"
          >
            <Icon className="h-6 w-6" />
          </motion.div>
          
          <motion.div 
            className="space-y-1 text-left"
            variants={textVariants}
          >
            <motion.h3 
              className="text-sm font-bold tracking-[0.14em] text-slate-900 transition-colors group-hover:text-white"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {title}
            </motion.h3>
            <motion.p 
              className="text-xs font-medium text-slate-500 transition-colors group-hover:text-blue-100"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {subtitle}
            </motion.p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 bg-cyan-300 transition-transform duration-300 group-hover:scale-x-100" />
      </Card>
    </motion.div>
  );
}
