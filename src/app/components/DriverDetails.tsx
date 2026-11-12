import { Button } from './ui/button';
import { RefreshCw, Calendar, MapPin, User, FileText, Award, TrendingUp, Database } from 'lucide-react';
import { DriverRecord, AssessmentData } from '../lib/database-service';

interface DriverDetailsProps {
  driver: DriverRecord;
  onReassessment?: () => void;
  onClose: () => void;
}

export function DriverDetails({ driver, onReassessment, onClose }: DriverDetailsProps) {
  const formatDate = (value?: string): string => {
    if (!value) return 'N/A';

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  };

  const getColorForStatus = (status?: string): string => {
    if (!status) return '#6B7280';
    
    switch (status.toLowerCase()) {
      case 'passed':
        return '#10B981';
      case 'failed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getColorForCategory = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'skill':
        return '#10B981'; // Green
      case 'knowledge':
        return '#F59E0B'; // Yellow/Orange
      case 'awareness':
        return '#EF4444'; // Red
      default:
        return '#6B7280';
    }
  };

  const getCategoryFromScore = (score: number): 'Skill' | 'Knowledge' | 'Awareness' => {
    if (score >= 80) return 'Skill';
    if (score >= 50) return 'Knowledge';
    return 'Awareness';
  };

  const getCategoryDescription = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'skill':
        return 'Advanced proficiency level (≥80%)';
      case 'knowledge':
        return 'Intermediate proficiency level (50-79%)';
      case 'awareness':
        return 'Basic proficiency level (<50%)';
      default:
        return '';
    }
  };

  const handleReassessment = () => {
    if (onReassessment) {
      onReassessment();
    }
  };

  // Get assessments from the driver record
  const assessments: Array<{
    type: string;
    displayName: string;
    data: {
      date: string;
      score: number;
      status: string;
      assessorName: string;
      remarks?: string;
      category: string;
    }
  }> = [];

  // Add assessments from driver record
  if (driver.assessments) {
    Object.entries(driver.assessments).forEach(([type, assessment]) => {
      const category = getCategoryFromScore(assessment.overallScore || 0);
      assessments.push({
        type,
        displayName: type === 'in-cab' ? 'In-Cab' : type === 'interview' ? 'Interview' : 'Initial',
        data: {
          date: assessment.date || 'N/A',
          score: assessment.overallScore || 0,
          status: assessment.status || 'pending',
          assessorName: assessment.assessorName || 'N/A',
          remarks: assessment.assessmentDetails?.recommendations || assessment.assessmentDetails?.areaOfImprovement,
          category
        }
      });
    });
  }

  // Sort assessments by date (newest first)
  assessments.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

  const latestAssessment = assessments[0];
  const currentCategory = latestAssessment ? latestAssessment.data.category : getCategoryFromScore(driver.overallScore || 0);
  const driverStatus = driver.status || 'pending';
  const driverScore = driver.overallScore || 0;

  return (
    <div className="border-t border-slate-200 bg-slate-50/80 p-4 sm:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Driver Information */}
        <div className="space-y-4">
          <h3 className="text-lg text-gray-800 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Driver Information
          </h3>
          
          <div className="bg-white/60 rounded-lg p-4 border border-blue-200/30 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600 w-24">Employee ID:</div>
              <div className="text-gray-800 font-medium">{driver.empId || driver.licenseNumber || 'N/A'}</div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600 w-24">Name:</div>
              <div className="text-gray-800 font-medium">{driver.name || 'N/A'}</div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600 w-24">License:</div>
              <div className="text-gray-800">{driver.licenseNumber || 'N/A'}</div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600 w-24">Group:</div>
              <div className="text-gray-800">{driver.group || 'N/A'}</div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-4 h-4 text-gray-500" />
              <div className="text-sm text-gray-600 w-20">Location:</div>
              <div className="text-gray-800">{driver.location || 'N/A'}</div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div className="text-sm text-gray-600 w-20">Hire Date:</div>
              <div className="text-gray-800">{driver.hireDate || 'N/A'}</div>
            </div>
          </div>

          {/* Assessment History */}
          <div>
            <h4 className="text-md text-gray-800 mb-3 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Assessment History
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {assessments.length > 0 ? (
                assessments.map((assessment, index) => (
                  <div key={`${assessment.type}-${index}`} className="bg-white/60 rounded-lg p-3 border border-blue-200/30">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{assessment.data.date}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {assessment.displayName}
                        </span>
                      </div>
                      <span 
                        className="px-3 py-1 rounded-full text-sm text-white font-medium"
                        style={{ backgroundColor: getColorForStatus(assessment.data.status) }}
                      >
                        {assessment.data.status.toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Score and Category */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-800">{assessment.data.score}%</div>
                          <div className="text-xs text-gray-500">Overall Score</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Award className="w-4 h-4" style={{ color: getColorForCategory(assessment.data.category) }} />
                          <div>
                            <div 
                              className="font-medium text-sm"
                              style={{ color: getColorForCategory(assessment.data.category) }}
                            >
                              {assessment.data.category}
                            </div>
                            <div className="text-xs text-gray-500">
                              {getCategoryDescription(assessment.data.category)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Assessor and remarks */}
                    <div className="mt-2 pt-2 border-t border-gray-200/50 text-xs text-gray-600">
                      <div className="flex justify-between items-center">
                        <span>Assessor: {assessment.data.assessorName}</span>
                      </div>
                      {assessment.data.remarks && (
                        <div className="mt-1">
                          <span className="font-medium">Remarks:</span> 
                          <span className="ml-1 text-gray-700">
                            {assessment.data.remarks.length > 100 
                              ? `${assessment.data.remarks.substring(0, 100)}...` 
                              : assessment.data.remarks
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white/60 rounded-lg p-4 border border-blue-200/30 text-center text-gray-500">
                  No assessments completed yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg text-gray-800 flex items-center">
              <RefreshCw className="w-5 h-5 mr-2" />
              Performance Overview
            </h3>
            {onReassessment && (
              <Button 
                onClick={handleReassessment}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Re-assessment
              </Button>
            )}
          </div>
          
          {/* Overall Status */}
          <div className="bg-white/60 rounded-lg p-4 border border-blue-200/30">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Overall Status</div>
              <div 
                className="inline-block px-6 py-3 rounded-lg text-white text-lg font-medium"
                style={{ backgroundColor: getColorForStatus(driverStatus) }}
              >
                {driverStatus.toUpperCase()}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Overall Score: {driverScore}%
              </div>
              <div className="text-xs text-gray-500">
                Last assessed on {driver.date || 'N/A'}
              </div>
            </div>
          </div>

          {/* Current Proficiency Level */}
          <div 
            className="rounded-lg p-4 border-2 border-opacity-50"
            style={{ 
              backgroundColor: `${getColorForCategory(currentCategory)}15`,
              borderColor: getColorForCategory(currentCategory)
            }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <Award className="w-6 h-6" style={{ color: getColorForCategory(currentCategory) }} />
              <div>
                <h4 className="font-semibold" style={{ color: getColorForCategory(currentCategory) }}>
                  Current Level: {currentCategory}
                </h4>
                <p className="text-sm text-gray-600">
                  {getCategoryDescription(currentCategory)}
                </p>
              </div>
            </div>
            
            {/* Progress visualization */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Awareness (0-49%)</span>
                <span>Knowledge (50-79%)</span>
                <span>Skill (80-100%)</span>
              </div>
              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                {/* Background segments */}
                <div className="absolute inset-0 flex">
                  <div className="w-1/2 bg-red-200"></div>
                  <div className="w-3/10 bg-yellow-200"></div>
                  <div className="w-1/5 bg-green-200"></div>
                </div>
                
                {/* Current score indicator */}
                <div 
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(driverScore, 100)}%`,
                    backgroundColor: getColorForCategory(currentCategory)
                  }}
                ></div>
                
                {/* Score marker */}
                <div 
                  className="absolute top-0 h-full w-1 bg-gray-800"
                  style={{ left: `${Math.min(driverScore, 100)}%` }}
                ></div>
              </div>
              <div className="text-center">
                <span className="text-lg font-bold" style={{ color: getColorForCategory(currentCategory) }}>
                  {driverScore}%
                </span>
              </div>
            </div>
            
            {/* Next level target */}
            {currentCategory !== 'Skill' && (
              <div className="mt-3 p-2 bg-white/50 rounded text-xs">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-600">
                    {currentCategory === 'Awareness' 
                      ? `Need ${50 - driverScore}% more to reach Knowledge level`
                      : `Need ${80 - driverScore}% more to reach Skill level`
                    }
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Assessment Summary */}
          <div className="bg-white/60 rounded-lg p-4 border border-blue-200/30">
            <h4 className="text-sm text-gray-700 mb-3">Assessment Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{assessments.length}</div>
                <div className="text-xs text-gray-500">Total Tests</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {assessments.filter(a => a.data.status === 'passed').length}
                </div>
                <div className="text-xs text-gray-500">Passed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {assessments.filter(a => a.data.category === 'Skill').length}
                </div>
                <div className="text-xs text-gray-500">Skill Level</div>
              </div>
            </div>
          </div>

          {/* Category Distribution */}
          {assessments.length > 0 && (
            <div className="bg-white/60 rounded-lg p-4 border border-blue-200/30">
              <h4 className="text-sm text-gray-700 mb-3">Performance History</h4>
              <div className="space-y-2">
                {['Skill', 'Knowledge', 'Awareness'].map(level => {
                  const count = assessments.filter(a => a.data.category === level).length;
                  const percentage = assessments.length > 0 ? Math.round((count / assessments.length) * 100) : 0;
                  
                  return (
                    <div key={level} className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 w-20">
                        <div 
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: getColorForCategory(level) }}
                        ></div>
                        <span className="text-xs text-gray-600">{level}</span>
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: getColorForCategory(level)
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600 w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Additional System Info */}
      <div className="mt-6 pt-4 border-t border-blue-200/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
          <div>
            <span className="text-gray-600">Latest Assessment:</span>
            <span className="ml-2 text-gray-800 capitalize">{latestAssessment?.displayName || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-600">Record ID:</span>
            <span className="ml-2 text-gray-800 font-mono">{driver.id?.slice(-8) || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-600">Last Updated:</span>
            <span className="ml-2 text-gray-800">
              {formatDate(driver.updatedAt)}
            </span>
          </div>
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-gray-600">Data Source:</span>
            <span className="ml-2 inline-flex items-center gap-1.5 font-medium text-emerald-700">
              <Database className="h-3.5 w-3.5" />
              Local Storage
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
