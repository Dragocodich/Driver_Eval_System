import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AssessmentType } from '../App';
import { DatabaseService, DriverRecord } from '../lib/database-service';

interface AssessmentChartsProps {
  assessmentType: AssessmentType;
}

export function AssessmentCharts({ assessmentType }: AssessmentChartsProps) {
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Subscribe to drivers for this assessment type
    const unsubscribe = DatabaseService.subscribeToDriversByAssessment(assessmentType, (newDrivers) => {
      setDrivers(newDrivers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [assessmentType]);

  // Helper function to get current assessment data for the specific type
  const getCurrentAssessmentData = (driver: DriverRecord) => {
    switch (assessmentType) {
      case 'in-cab':
        return driver.inCabAssessment;
      case 'interview':
        return driver.interviewAssessment;
      case 'initial':
        return driver.initialAssessment;
      default:
        return null;
    }
  };

  // Process data for charts
  const getResultDistributionData = () => {
    const distribution = {
      'Passed': drivers.filter(d => {
        const assessment = getCurrentAssessmentData(d);
        return assessment?.status === 'passed';
      }).length,
      'Failed': drivers.filter(d => {
        const assessment = getCurrentAssessmentData(d);
        return assessment?.status === 'failed';
      }).length,
      'Pending': drivers.filter(d => {
        const assessment = getCurrentAssessmentData(d);
        return !assessment || assessment.status === 'pending';
      }).length,
    };

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
      percentage: drivers.length > 0 ? Math.round((value / drivers.length) * 100) : 0
    }));
  };

  const getMonthlyTestData = () => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const currentYear = new Date().getFullYear();
    const monthlyData = months.map((month, index) => {
      const count = drivers.filter(driver => {
        const assessment = getCurrentAssessmentData(driver);
        if (!assessment) return false;
        
        const driverDate = new Date(assessment.date);
        return driverDate.getMonth() === index && driverDate.getFullYear() === currentYear;
      }).length;
      
      return {
        month,
        count,
        drivers: count
      };
    });

    return monthlyData;
  };

  const getCompanyDistributionData = () => {
    // Group by location
    const locationGroups = drivers.reduce((acc, driver) => {
      const location = driver.location || 'Unknown';
      if (!acc[location]) {
        acc[location] = { 
          passed: 0, 
          failed: 0,
          pending: 0,
          total: 0,
          avgScore: 0,
          totalScore: 0
        };
      }
      
      const assessment = getCurrentAssessmentData(driver);
      acc[location].total++;
      
      if (assessment) {
        acc[location].totalScore += assessment.score;
        switch (assessment.status) {
          case 'passed':
            acc[location].passed++;
            break;
          case 'failed':
            acc[location].failed++;
            break;
          default:
            acc[location].pending++;
            break;
        }
      } else {
        acc[location].pending++;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(locationGroups).map(([location, data]) => ({
      location: location.length > 10 ? location.substring(0, 10) + '...' : location,
      passed: data.passed,
      failed: data.failed,
      pending: data.pending,
      total: data.total,
      avgScore: data.total > 0 ? Math.round(data.totalScore / data.total) : 0
    }));
  };

  const COLORS = {
    'Passed': '#16a34a',
    'Failed': '#dc2626',
    'Pending': '#eab308'
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white/95 backdrop-blur-sm border-0 shadow-lg p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      {/* Result Distribution Chart */}
      <motion.div variants={cardVariants}>
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg p-6">
          <h3 className="text-lg text-gray-800 mb-4">Result Distribution</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height={192}>
              <PieChart>
                <Pie
                  data={getResultDistributionData()}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                >
                  {getResultDistributionData().map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.name as keyof typeof COLORS]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value, 'Drivers']}
                  labelFormatter={(label) => `Result: ${label}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Total: {drivers.length} drivers assessed
          </div>
        </Card>
      </motion.div>

      {/* Monthly Test Trends */}
      <motion.div variants={cardVariants}>
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg p-6">
          <h3 className="text-lg text-gray-800 mb-4">Monthly Test Trends</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height={192}>
              <BarChart data={getMonthlyTestData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                />
                <Tooltip 
                  formatter={(value: number) => [value, 'Tests']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Bar 
                  dataKey="count" 
                  fill="#3b82f6"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Tests conducted in {new Date().getFullYear()}
          </div>
        </Card>
      </motion.div>

      {/* Location Distribution */}
      <motion.div variants={cardVariants}>
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg p-6">
          <h3 className="text-lg text-gray-800 mb-4">Location Distribution</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height={192}>
              <BarChart data={getCompanyDistributionData()} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  fontSize={12}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  type="category" 
                  dataKey="location" 
                  fontSize={10}
                  tick={{ fill: '#6b7280' }}
                  width={60}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [value, name]}
                  labelFormatter={(label) => `Location: ${label}`}
                />
                <Bar dataKey="passed" stackId="a" fill="#16a34a" />
                <Bar dataKey="failed" stackId="a" fill="#dc2626" />
                <Bar dataKey="pending" stackId="a" fill="#eab308" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Distribution across locations
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}