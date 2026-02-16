import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, ChevronDown, ChevronUp, CheckCircle, XCircle, Search, Filter, Plus, FileText } from 'lucide-react';
import { Input } from './ui/input';
import { DriverDetails } from './DriverDetails';
import { AssessmentCharts } from './AssessmentCharts';
import { InCabAssessmentForm } from './InCabAssessmentForm';
import { InterviewAssessmentForm } from './InterviewAssessmentForm';
import { AssessmentType } from '../App';
import { toast } from 'sonner';
import { DatabaseService, DriverRecord } from '../lib/database-service';

interface AssessmentDetailsProps {
  assessmentType: AssessmentType;
  onBackToDashboard: () => void;
}

export function AssessmentDetails({ assessmentType, onBackToDashboard }: AssessmentDetailsProps) {
  const [selectedDriver, setSelectedDriver] = useState<DriverRecord | null>(null);
  const [sortField, setSortField] = useState<keyof DriverRecord>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSorting, setIsSorting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formDriver, setFormDriver] = useState<DriverRecord | null>(null);
  const [driversData, setDriversData] = useState<DriverRecord[]>([]);

  useEffect(() => {
    setIsLoading(true);
    
    // Subscribe to drivers filtered by assessment type
    const unsubscribe = DatabaseService.subscribeToDriversByAssessment(assessmentType, (drivers) => {
      setDriversData(drivers);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [assessmentType]);

  const getAssessmentTitle = () => {
    switch (assessmentType) {
      case 'in-cab':
        return 'IN-CAB ASSESSMENT';
      case 'interview':
        return 'INTERVIEW TEST';
      case 'initial':
        return 'INITIAL PRACTICAL TEST';
      default:
        return 'ASSESSMENT';
    }
  };

  const handleSort = (field: keyof DriverRecord) => {
    setIsSorting(true);
    setTimeout(() => {
      if (sortField === field) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
      setIsSorting(false);
    }, 300);
  };

  const sortedDrivers = [...driversData]
    .filter(driver => 
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.licenseNumber.includes(searchTerm) ||
      (driver.empId && driver.empId.includes(searchTerm)) ||
      (getCurrentAssessmentData(driver)?.assessorName || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'date') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleDriverClick = (driver: DriverRecord) => {
    setSelectedDriver(selectedDriver?.id === driver.id ? null : driver);
  };

  const handleNewTest = () => {
    if (assessmentType !== 'in-cab' && assessmentType !== 'interview') {
      toast.error('Assessment forms are only available for IN-CAB and Interview assessments');
      return;
    }
    setFormDriver(null);
    setIsFormOpen(true);
  };

  const handleReassessment = (driver: DriverRecord) => {
    if (assessmentType !== 'in-cab' && assessmentType !== 'interview') {
      toast.error('Re-assessment forms are only available for IN-CAB and Interview assessments');
      return;
    }
    setFormDriver(driver);
    setIsFormOpen(true);
  };

  const handleFormSave = async (formData: any) => {
    try {
      // The form will handle saving data
      // This will trigger a real-time update through our subscription
      toast.success(formDriver ? 
        `Re-assessment completed for ${formData.driverName || formData.name}` : 
        `New assessment created for ${formData.driverName || formData.name}`
      );
    } catch (error) {
      console.error('Error handling form save:', error);
      toast.error('Failed to save assessment');
    }
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const tableRowVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    },
    hover: {
      scale: 1.01,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      transition: { duration: 0.2 }
    }
  };

  // Check if current assessment type supports forms
  const supportsForm = assessmentType === 'in-cab' || assessmentType === 'interview';

  // Helper function to get current assessment data
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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[400px]">
        <motion.div
          className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <span className="ml-3 text-white">Loading {getAssessmentTitle().toLowerCase()} data...</span>
      </div>
    );
  }

  return (
    <>
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {/* Header with Navigation */}
        <motion.div 
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0"
          variants={itemVariants}
        >
          <div className="flex items-center space-x-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={onBackToDashboard}
                className="bg-white/90 backdrop-blur-sm border-white/20 hover:bg-white text-gray-700 shadow-lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </motion.div>
            <motion.div 
              className="bg-gray-800/90 backdrop-blur-sm text-white px-6 py-2 rounded-lg shadow-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-lg">{getAssessmentTitle()}</h1>
              <p className="text-xs text-gray-300">
                {driversData.length} {driversData.length === 1 ? 'record' : 'records'}
              </p>
            </motion.div>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/90 backdrop-blur-sm border-white/20 focus:border-blue-500 shadow-lg"
              />
            </motion.div>

            {/* Show New Test button for supported assessments */}
            {supportsForm && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleNewTest}
                  className={`${
                    assessmentType === 'interview' 
                      ? 'bg-yellow-600 hover:bg-yellow-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white shadow-lg`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Test
                </Button>
              </motion.div>
            )}

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/90 backdrop-blur-sm border-white/20 hover:bg-white text-gray-700 shadow-lg"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Info message for non-supported assessments */}
        {!supportsForm && (
          <motion.div 
            className="bg-blue-50/90 backdrop-blur-sm border border-blue-200 rounded-lg p-4"
            variants={itemVariants}
          >
            <p className="text-blue-800 text-sm">
              📋 Assessment forms are only available for IN-CAB and Interview assessments. This section displays existing {getAssessmentTitle()} data.
            </p>
          </motion.div>
        )}

        {/* Assessment Charts */}
        <motion.div variants={itemVariants}>
          <AssessmentCharts assessmentType={assessmentType} />
        </motion.div>

        {/* Drivers Table */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
            <AnimatePresence>
              {isSorting && (
                <motion.div
                  className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-600/90 text-white">
                  <tr>
                    {[
                      { key: 'licenseNumber', label: 'License/ID' },
                      { key: 'name', label: 'Driver Name' },
                      { key: 'assessorName', label: 'Assessor' },
                      { key: 'date', label: 'Test Date' },
                      { key: 'overallScore', label: 'Score' },
                      { key: 'status', label: 'Status' }
                    ].map((column) => (
                      <th 
                        key={column.key}
                        className="px-6 py-4 text-left cursor-pointer hover:bg-blue-700/50 transition-colors"
                        onClick={() => handleSort(column.key as keyof DriverRecord)}
                      >
                        <motion.div 
                          className="flex items-center space-x-2"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.1 }}
                        >
                          <span>{column.label}</span>
                          <AnimatePresence>
                            {sortField === column.key && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                              >
                                {sortDirection === 'asc' ? 
                                  <ChevronUp className="w-4 h-4" /> : 
                                  <ChevronDown className="w-4 h-4" />
                                }
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedDrivers.length > 0 ? (
                    sortedDrivers.map((driver, index) => (
                      <React.Fragment key={driver.id}>
                        <motion.tr 
                          className={`border-b border-gray-200 cursor-pointer transition-all duration-200 ${
                            selectedDriver?.id === driver.id ? 'bg-blue-100/70' : 
                            index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/50'
                          }`}
                          variants={tableRowVariants}
                          initial="initial"
                          animate="animate"
                          whileHover="hover"
                          onClick={() => handleDriverClick(driver)}
                          layout
                        >
                          <td className="px-6 py-4 text-gray-800">{driver.licenseNumber}</td>
                          <td className="px-6 py-4 text-gray-800">{driver.name}</td>
                          <td className="px-6 py-4 text-gray-600">
                            {getCurrentAssessmentData(driver)?.assessorName || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {getCurrentAssessmentData(driver)?.date || driver.lastAssessmentDate || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {getCurrentAssessmentData(driver)?.score || driver.overallScore || 0}%
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Badge 
                                  variant="outline" 
                                  className={`${
                                    (getCurrentAssessmentData(driver)?.status || driver.overallStatus) === 'passed' 
                                      ? 'bg-green-100 text-green-800 border-green-300' 
                                      : 'bg-red-100 text-red-800 border-red-300'
                                  }`}
                                >
                                  {getCurrentAssessmentData(driver)?.status || driver.overallStatus || 'pending'}
                                </Badge>
                              </motion.div>
                              <motion.div
                                whileHover={{ scale: 1.2 }}
                                transition={{ duration: 0.2 }}
                              >
                                {(getCurrentAssessmentData(driver)?.status || driver.overallStatus) === 'passed' ? (
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-500" />
                                )}
                              </motion.div>
                            </div>
                          </td>
                        </motion.tr>
                        <AnimatePresence>
                          {selectedDriver?.id === driver.id && (
                            <motion.tr 
                              key={`${driver.id}-details`}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                              <td colSpan={6} className="p-0">
                                <DriverDetails 
                                  driver={selectedDriver} 
                                  onReassessment={supportsForm ? () => handleReassessment(selectedDriver) : undefined}
                                />
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    ))
                  ) : (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center space-y-2">
                          <FileText className="w-12 h-12 text-gray-300" />
                          <p>No {getAssessmentTitle().toLowerCase()} records found</p>
                          {searchTerm && (
                            <p className="text-sm">Try adjusting your search terms</p>
                          )}
                          {!supportsForm && (
                            <p className="text-xs text-blue-600 mt-2">
                              💡 Create records by using the IN-CAB or Interview assessment forms
                            </p>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Assessment Forms */}
      <AnimatePresence>
        {isFormOpen && assessmentType === 'in-cab' && (
          <InCabAssessmentForm
            onClose={() => setIsFormOpen(false)}
            initialData={formDriver || undefined}
            isEdit={!!formDriver}
          />
        )}
        {isFormOpen && assessmentType === 'interview' && (
          <InterviewAssessmentForm
            onClose={() => setIsFormOpen(false)}
            initialData={formDriver || undefined}
            isEdit={!!formDriver}
          />
        )}
      </AnimatePresence>
    </>
  );
}