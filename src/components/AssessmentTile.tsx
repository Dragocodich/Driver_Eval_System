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
        className="group cursor-pointer bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg text-white p-8 h-48 flex flex-col items-center justify-center space-y-4 overflow-hidden relative"
        onClick={onClick}
      >
        {/* Background Animation */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100"
          variants={backgroundVariants}
          whileHover="hover"
        />
        
        {/* Ripple Effect */}
        <motion.div
          className="absolute inset-0 bg-white/10 rounded-full scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-100"
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <motion.div 
            className="p-4 bg-white/20 rounded-full group-hover:bg-white/30 transition-all duration-300 shadow-lg"
            variants={iconVariants}
            whileHover="hover"
          >
            <Icon className="w-8 h-8 text-white drop-shadow-md" />
          </motion.div>
          
          <motion.div 
            className="text-center space-y-1"
            variants={textVariants}
          >
            <motion.h3 
              className="text-sm tracking-wider uppercase drop-shadow-md"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {title}
            </motion.h3>
            <motion.p 
              className="text-xs opacity-90 drop-shadow-sm"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {subtitle}
            </motion.p>
          </motion.div>
        </div>

        {/* Shine Effect */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full"
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </Card>
    </motion.div>
  );
}