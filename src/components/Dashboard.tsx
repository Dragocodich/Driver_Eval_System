import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MultiSegmentDonut } from './MultiSegmentDonut';
import { AssessmentTile } from './AssessmentTile';
import { Card } from './ui/card';
import { FileText, Users, Car, TrendingUp, BarChart3, PieChart, AlertCircle } from 'lucide-react';
import { AssessmentType } from '../App';
import { DatabaseService, DriverRecord } from '../lib/database-service';

interface DashboardStats {
  totalAssessments: number;
  thisMonth: number;
  passRate: number;
  skillCount: number;
  knowledgeCount: number;
  awarenessCount: number;
  failedCount: number;
  averageScores: { skill: number; knowledge: number; awareness: number };
}
import { toast } from 'sonner';

interface DashboardProps {
  onAssessmentClick: (assessmentType: AssessmentType) => void;
}

export function Dashboard({ onAssessmentClick }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to calculate dashboard stats from drivers data
  const calculateStatsFromDrivers = (drivers: DriverRecord[]): DashboardStats => {
    const totalAssessments = drivers.length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Count assessments this month
    const thisMonth = drivers.filter(driver => {
      const driverDate = new Date(driver.lastAssessmentDate);
      return driverDate.getMonth() === currentMonth && driverDate.getFullYear() === currentYear;
    }).length;

    // Count passed/failed
    const passed = drivers.filter(driver => driver.overallStatus === 'passed').length;
    const passRate = totalAssessments > 0 ? Math.round((passed / totalAssessments) * 100) : 0;

    // Calculate KPI performance based on overall scores
    let skillTotal = 0, knowledgeTotal = 0, awarenessTotal = 0;
    let skillCount = 0, knowledgeCount = 0, awarenessCount = 0;

    drivers.forEach(driver => {
      // Get the latest assessment data for scoring
      const latestAssessment = getLatestAssessment(driver);
      if (latestAssessment) {
        skillTotal += latestAssessment.skill;
        knowledgeTotal += latestAssessment.knowledge;
        awarenessTotal += latestAssessment.awareness;
        
        // Categorize based on strongest KPI
        const maxScore = Math.max(latestAssessment.skill, latestAssessment.knowledge, latestAssessment.awareness);
        if (latestAssessment.skill === maxScore) skillCount++;
        else if (latestAssessment.knowledge === maxScore) knowledgeCount++;
        else awarenessCount++;
      }
    });

    return {
      totalAssessments,
      thisMonth,
      passRate,
      skillCount,
      knowledgeCount,
      awarenessCount,
      failedCount: totalAssessments - passed,
      averageScores: {
        skill: totalAssessments > 0 ? Math.round(skillTotal / totalAssessments) : 0,
        knowledge: totalAssessments > 0 ? Math.round(knowledgeTotal / totalAssessments) : 0,
        awareness: totalAssessments > 0 ? Math.round(awarenessTotal / totalAssessments) : 0
      }
    };
  };

  // Helper function to get the latest assessment data from a driver
  const getLatestAssessment = (driver: DriverRecord) => {
    const assessments = [];
    if (driver.inCabAssessment) assessments.push(driver.inCabAssessment);
    if (driver.interviewAssessment) assessments.push(driver.interviewAssessment);
    if (driver.initialAssessment) assessments.push(driver.initialAssessment);
    
    return assessments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };

  useEffect(() => {
    let unsubscribeStats: (() => void) | null = null;
    let unsubscribeDrivers: (() => void) | null = null;

    const initializeData = async () => {
      try {
        setError(null);

        // Subscribe to real-time drivers data
        unsubscribeDrivers = DatabaseService.subscribeToDrivers((newDrivers) => {
          setDrivers(newDrivers);
          // Calculate stats from drivers data
          const calculatedStats = calculateStatsFromDrivers(newDrivers);
          setStats(calculatedStats);
          setLoading(false);
        });

      } catch (error: any) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data. Please check your connection.');
        setLoading(false);
        
        // Show user-friendly error
        toast.error('Unable to connect to database. Showing offline mode.');
        
        // Set default stats for offline mode
        setStats({
          totalAssessments: 0,
          thisMonth: 0,
          passRate: 0,
          skillCount: 0,
          knowledgeCount: 0,
          awarenessCount: 0,
          failedCount: 0,
          averageScores: { skill: 0, knowledge: 0, awareness: 0 }
        });
      }
    };

    initializeData();

    return () => {
      if (unsubscribeStats) unsubscribeStats();
      if (unsubscribeDrivers) unsubscribeDrivers();
    };
  }, []);

  // Calculate KPI data for donut charts based on real data
  const getAssessmentData = () => {
    if (!drivers.length) {
      return Array(5).fill({ title: "No Data", data: { skill: 33, knowledge: 33, awareness: 34 } });
    }

    // Group drivers by assessment type
    const assessmentTypes = ['in-cab', 'interview', 'initial'] as const;
    const assessmentData = [];
    
    // Add assessment type based charts
    assessmentTypes.forEach(type => {
      const typeDrivers = drivers.filter(d => {
        const assessmentField = type === 'in-cab' ? 'inCabAssessment' : 
                              type === 'interview' ? 'interviewAssessment' : 'initialAssessment';
        return d[assessmentField] != null;
      });
      
      if (typeDrivers.length > 0) {
        let skillTotal = 0, knowledgeTotal = 0, awarenessTotal = 0;
        
        typeDrivers.forEach(driver => {
          const assessmentField = type === 'in-cab' ? 'inCabAssessment' : 
                                 type === 'interview' ? 'interviewAssessment' : 'initialAssessment';
          const assessment = driver[assessmentField];
          if (assessment) {
            skillTotal += assessment.skill;
            knowledgeTotal += assessment.knowledge;
            awarenessTotal += assessment.awareness;
          }
        });
        
        const total = typeDrivers.length;
        assessmentData.push({
          title: type.toUpperCase().replace('-', ' '),
          data: {
            skill: Math.round(skillTotal / total),
            knowledge: Math.round(knowledgeTotal / total),
            awareness: Math.round(awarenessTotal / total)
          }
        });
      }
    });
    
    // Add location based charts
    const locations = [...new Set(drivers.map(d => d.location).filter(Boolean))].slice(0, 2);
    locations.forEach(location => {
      const locationDrivers = drivers.filter(d => d.location === location);
      if (locationDrivers.length > 0) {
        let skillTotal = 0, knowledgeTotal = 0, awarenessTotal = 0;
        
        locationDrivers.forEach(driver => {
          const latestAssessment = getLatestAssessment(driver);
          if (latestAssessment) {
            skillTotal += latestAssessment.skill;
            knowledgeTotal += latestAssessment.knowledge;
            awarenessTotal += latestAssessment.awareness;
          }
        });
        
        const total = locationDrivers.length;
        if (total > 0) {
          assessmentData.push({
            title: location.toUpperCase(),
            subtitle: "LOCATION",
            data: {
              skill: Math.round(skillTotal / total),
              knowledge: Math.round(knowledgeTotal / total),
              awareness: Math.round(awarenessTotal / total)
            }
          });
        }
      }
    });
    
    // Fill remaining slots with overall data if needed
    while (assessmentData.length < 5) {
      const total = stats?.skillCount! + stats?.knowledgeCount! + stats?.awarenessCount!;
      if (total > 0) {
        assessmentData.push({
          title: "OVERALL",
          subtitle: `${assessmentData.length + 1} Assessment`,
          data: {
            skill: Math.round((stats?.skillCount! / total) * 100),
            knowledge: Math.round((stats?.knowledgeCount! / total) * 100),
            awareness: Math.round((stats?.awarenessCount! / total) * 100)
          }
        });
      } else {
        assessmentData.push({
          title: "NO DATA",
          data: { skill: 33, knowledge: 33, awareness: 34 }
        });
      }
    }
    
    return assessmentData.slice(0, 5);
  };

  const assessmentTiles = [
    {
      title: "INITIAL",
      subtitle: "PRACTICAL TEST",
      icon: FileText,
      type: 'initial' as AssessmentType,
      onClick: () => onAssessmentClick('initial')
    },
    {
      title: "INTERVIEW",
      subtitle: "TEST",
      icon: Users,
      type: 'interview' as AssessmentType,
      onClick: () => onAssessmentClick('interview')
    },
    {
      title: "IN-CAB",
      subtitle: "ASSESSMENT",
      icon: Car,
      type: 'in-cab' as AssessmentType,
      onClick: () => onAssessmentClick('in-cab')
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.25, 0, 1]
      }
    }
  };

  const chartContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const tileContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.5
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const statsVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[400px]">
        <motion.div
          className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <span className="ml-3 text-white">Loading dashboard data...</span>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          className="flex items-center justify-center min-h-[400px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl text-gray-800 mb-2">Connection Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <motion.button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Retry Connection
            </motion.button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Error Banner */}
      {error && (
        <motion.div 
          className="bg-yellow-50/90 backdrop-blur-sm border border-yellow-200 rounded-lg p-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-800 text-sm">
              🔄 Running in offline mode. Some data may not be current.
            </p>
          </div>
        </motion.div>
      )}

      {/* Header Stats */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        variants={containerVariants}
      >
        {[
          { 
            icon: TrendingUp, 
            title: "Total Assessments", 
            value: stats?.totalAssessments?.toString() || "0", 
            color: "from-blue-500 to-blue-600" 
          },
          { 
            icon: BarChart3, 
            title: "This Month", 
            value: stats?.thisMonth?.toString() || "0", 
            color: "from-green-500 to-green-600" 
          },
          { 
            icon: PieChart, 
            title: "Pass Rate", 
            value: `${stats?.passRate || 0}%`, 
            color: "from-purple-500 to-purple-600" 
          }
        ].map((stat, index) => (
          <motion.div
            key={index}
            variants={statsVariants}
            whileHover={{ 
              scale: 1.05,
              y: -5,
              transition: { duration: 0.2 }
            }}
          >
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg p-6 relative overflow-hidden">
              <motion.div
                className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-6 -mt-6`}
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl text-gray-800">{stat.value}</p>
                </div>
                <motion.div
                  className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} shadow-lg`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </motion.div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* KPI Comparison Charts */}
      <motion.div variants={cardVariants}>
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl p-8 relative overflow-hidden">
          {/* Background decoration */}
          <motion.div
            className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          
          <motion.div className="mb-6 text-center" variants={headerVariants}>
            <motion.h2 
              className="text-2xl text-gray-800 mb-2"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              KPI Performance Comparison
            </motion.h2>
            <p className="text-gray-600">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
              Skill • 
              <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mx-1"></span>
              Knowledge • 
              <span className="inline-block w-3 h-3 bg-red-500 rounded-full mx-1"></span>
              Awareness across different assessments
            </p>
            {error && (
              <p className="text-xs text-yellow-600 mt-1">
                ⚠️ Data may not be current due to connection issues
              </p>
            )}
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 justify-items-center"
            variants={chartContainerVariants}
          >
            {getAssessmentData().map((assessment, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  transition: { duration: 0.3 }
                }}
              >
                <MultiSegmentDonut
                  data={assessment.data}
                  title={assessment.title}
                  subtitle={assessment.subtitle}
                  size={160}
                  strokeWidth={14}
                />
              </motion.div>
            ))}
          </motion.div>
          
          {/* Summary Stats */}
          <motion.div 
            className="mt-8 pt-6 border-t border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl text-green-700 mb-1">{stats?.averageScores.skill || 0}%</div>
                <div className="text-sm text-green-600">Average Skill Score</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl text-yellow-700 mb-1">{stats?.averageScores.knowledge || 0}%</div>
                <div className="text-sm text-yellow-600">Average Knowledge Score</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl text-red-700 mb-1">{stats?.averageScores.awareness || 0}%</div>
                <div className="text-sm text-red-600">Average Awareness Score</div>
              </div>
            </div>
          </motion.div>
        </Card>
      </motion.div>

      {/* Assessment Tiles */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={tileContainerVariants}
      >
        {assessmentTiles.map((assessment, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
          >
            <AssessmentTile
              title={assessment.title}
              subtitle={assessment.subtitle}
              icon={assessment.icon}
              onClick={assessment.onClick}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}