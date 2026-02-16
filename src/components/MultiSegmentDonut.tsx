import { motion } from 'motion/react';
import { useState } from 'react';

interface KPIData {
  skill: number;
  knowledge: number;
  awareness: number;
}

interface MultiSegmentDonutProps {
  data: KPIData;
  title: string;
  subtitle?: string;
  size?: number;
  strokeWidth?: number;
}

export function MultiSegmentDonut({ 
  data, 
  title, 
  subtitle,
  size = 160, 
  strokeWidth = 12 
}: MultiSegmentDonutProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Calculate segments based on actual percentages
  const total = data.skill + data.knowledge + data.awareness;
  const skillPercent = (data.skill / total) * 100;
  const knowledgePercent = (data.knowledge / total) * 100;
  const awarenessPercent = (data.awareness / total) * 100;
  
  // Colors for each KPI
  const skillColor = "#16a34a"; // Green
  const knowledgeColor = "#eab308"; // Yellow  
  const awarenessColor = "#dc2626"; // Red

  // Calculate the angles for each segment
  const skillAngle = (skillPercent / 100) * 360;
  const knowledgeAngle = (knowledgePercent / 100) * 360;
  const awarenessAngle = (awarenessPercent / 100) * 360;

  // Helper function to create arc paths
  const createArcPath = (startAngle: number, endAngle: number, radius: number, strokeWidth: number) => {
    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = radius + strokeWidth / 2;
    const innerRadius = radius - strokeWidth / 2;
    
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = centerX + outerRadius * Math.cos(startAngleRad);
    const y1 = centerY + outerRadius * Math.sin(startAngleRad);
    const x2 = centerX + outerRadius * Math.cos(endAngleRad);
    const y2 = centerY + outerRadius * Math.sin(endAngleRad);
    
    const x3 = centerX + innerRadius * Math.cos(endAngleRad);
    const y3 = centerY + innerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(startAngleRad);
    const y4 = centerY + innerRadius * Math.sin(startAngleRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `
      M ${x1} ${y1}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
      Z
    `;
  };

  const containerVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const segmentVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 1,
        ease: "easeOut"
      }
    }
  };

  const legendVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    },
    hover: {
      scale: 1.05,
      x: 5,
      transition: { duration: 0.2 }
    }
  };

  const centerTextVariants = {
    initial: { opacity: 0, scale: 0.5 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { delay: 1, duration: 0.5 }
    }
  };

  const getHoverProps = (segment: string) => ({
    onMouseEnter: () => setHoveredSegment(segment),
    onMouseLeave: () => setHoveredSegment(null),
    style: {
      filter: hoveredSegment === segment ? 'brightness(1.2) drop-shadow(0 0 8px rgba(0,0,0,0.3))' : 
              hoveredSegment && hoveredSegment !== segment ? 'brightness(0.7)' : 'none',
      cursor: 'pointer'
    }
  });

  // Calculate start and end angles for each segment
  let currentAngle = 0;
  const skillStartAngle = currentAngle;
  const skillEndAngle = currentAngle + skillAngle;
  currentAngle = skillEndAngle;

  const knowledgeStartAngle = currentAngle;
  const knowledgeEndAngle = currentAngle + knowledgeAngle;
  currentAngle = knowledgeEndAngle;

  const awarenessStartAngle = currentAngle;
  const awarenessEndAngle = currentAngle + awarenessAngle;

  return (
    <motion.div 
      className="flex flex-col items-center space-y-4"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div 
        className="relative" 
        style={{ width: size, height: size }}
        whileHover={{ rotate: [0, 2, -2, 0] }}
        transition={{ duration: 0.5 }}
      >
        <svg
          width={size}
          height={size}
          className="overflow-visible"
        >
          {/* Background circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
            fill="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Skill segment (Green) */}
          {skillPercent > 0 && (
            <motion.path
              d={createArcPath(skillStartAngle, skillEndAngle, radius, strokeWidth)}
              fill={skillColor}
              variants={segmentVariants}
              {...getHoverProps('skill')}
              className="transition-all duration-200"
            />
          )}
          
          {/* Knowledge segment (Yellow) */}
          {knowledgePercent > 0 && (
            <motion.path
              d={createArcPath(knowledgeStartAngle, knowledgeEndAngle, radius, strokeWidth)}
              fill={knowledgeColor}
              variants={segmentVariants}
              {...getHoverProps('knowledge')}
              className="transition-all duration-200"
            />
          )}
          
          {/* Awareness segment (Red) */}
          {awarenessPercent > 0 && (
            <motion.path
              d={createArcPath(awarenessStartAngle, awarenessEndAngle, radius, strokeWidth)}
              fill={awarenessColor}
              variants={segmentVariants}
              {...getHoverProps('awareness')}
              className="transition-all duration-200"
            />
          )}
        </svg>
        
        {/* Center content */}
        <motion.div 
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-2"
          variants={centerTextVariants}
        >
          <motion.div 
            className="text-sm text-gray-800 leading-tight"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            {title}
          </motion.div>
          {subtitle && (
            <motion.div 
              className="text-xs text-gray-600 mt-1 max-w-[90px] leading-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.3 }}
            >
              {subtitle}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
      
      {/* Legend with percentages */}
      <motion.div className="flex flex-col space-y-1 text-xs">
        {[
          { name: 'Skill', value: Math.round(skillPercent), color: skillColor, key: 'skill' },
          { name: 'Knowledge', value: Math.round(knowledgePercent), color: knowledgeColor, key: 'knowledge' },
          { name: 'Awareness', value: Math.round(awarenessPercent), color: awarenessColor, key: 'awareness' }
        ].map((item) => (
          <motion.div 
            key={item.key}
            className="flex items-center space-x-2 cursor-pointer"
            variants={legendVariants}
            whileHover="hover"
            {...getHoverProps(item.key)}
          >
            <motion.div 
              className="w-3 h-3 rounded-full shadow-sm border border-white" 
              style={{ backgroundColor: item.color }}
              whileHover={{ scale: 1.2 }}
              transition={{ duration: 0.2 }}
            />
            <span className="text-gray-700 text-xs">{item.name}: {item.value}%</span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}