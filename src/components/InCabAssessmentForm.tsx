import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { X, Save, FileText, Printer, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { DatabaseService, DriverRecord } from '../lib/database-service';
import { AuthService } from '../lib/auth-service';
import { SignatureCanvas } from './SignatureCanvas';

interface InCabAssessmentFormProps {
  onClose: () => void;
  initialData?: Partial<DriverRecord>;
  isEdit?: boolean;
}

interface FormData {
  // General Information
  documentNo: string;
  date: string;
  driverName: string;
  hcmCode: string;
  group: string;
  hireDate: string;
  location: string;
  vehicleType: string;
  weather: string;
  roadConditions: string;
  driverConditions: string;

  // Theory Section (0=Poor, 1=Satisfactory, 2=Good, 3=Excellent)
  theory: {
    trafficRules: number; // 2 pts
    goldenRules: number; // 3 pts
    hsePractices: number; // 2 pts
    ptwSystem: number; // 2 pts
    productKnowledge: number; // 2 pts
    loadingUnloading: number; // 2 pts
    remarks: string;
  };

  // Pre-Trip Inspection
  preTrip: {
    flowersMethod: number; // 2 pts
    remarks: string;
  };

  // Knowledge Section
  knowledge: {
    backingAvoidance: number; // 2 pts
    banksman360Check: number; // 2 pts
    appropriateParkingSite: number; // 2 pts
    safestApproach: number; // 2 pts
    spaceVehicleMaintained: number; // 2 pts
    appropriateSpeed: number; // 2 pts
    blindSpotChecks: number; // 2 pts
    upperPartMonitored: number; // 2 pts
    remarks: string;
  };

  // On Road Assessment
  onRoad: {
    knownRoadZones: number; // 2 pts
    eyesMovement: number; // 2 pts
    followingSafeDistance: number; // 2 pts
    blindSpots: number; // 2 pts
    communication: number; // 2 pts
    remarks: string;
  };

  // Driving Skills
  drivingSkills: {
    roadSignsMarkings: number; // 2 pts
    turningLeftRight: number; // 2 pts
    approachingIntersection: number; // 2 pts
    approachingRoundabout: number; // 2 pts
    gearSelection: number; // 2 pts
    speedControl: number; // 2 pts
    laneManagement: number; // 2 pts
    uphillDownhill: number; // 2 pts
    drivingControl: number; // 2 pts
    courtesyConsideration: number; // 2 pts
    parking: number; // 2 pts
    attitude: number; // 2 pts
    vehicleTroubleshooting: number; // 2 pts
    remarks: string;
  };

  // Final Results
  totalScore: number;
  percentage: number;
  result: 'Awareness' | 'Knowledge' | 'Skill';
  
  // Inspector's Remarks
  areaOfImprovement: string;
  inspectorName: string;
  inspectorSignature: string | null;
}

const ratingOptions = [
  { value: 0, label: '0', description: 'Poor', color: 'from-red-500 to-red-600' },
  { value: 1, label: '1', description: 'Satisfactory', color: 'from-orange-500 to-orange-600' },
  { value: 2, label: '2', description: 'Good', color: 'from-blue-500 to-blue-600' },
  { value: 3, label: '3', description: 'Excellent', color: 'from-green-500 to-green-600' }
];

export function InCabAssessmentForm({ onClose, initialData, isEdit = false }: InCabAssessmentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    documentNo: 'HSEQ-F-047',
    date: new Date().toISOString().split('T')[0],
    driverName: initialData?.name || '',
    hcmCode: initialData?.licenseNumber || '',
    group: '',
    hireDate: '',
    location: '',
    vehicleType: '',
    weather: 'Normal',
    roadConditions: 'Highway',
    driverConditions: 'OK',

    theory: {
      trafficRules: 0,
      goldenRules: 0,
      hsePractices: 0,
      ptwSystem: 0,
      productKnowledge: 0,
      loadingUnloading: 0,
      remarks: ''
    },

    preTrip: {
      flowersMethod: 0,
      remarks: ''
    },

    knowledge: {
      backingAvoidance: 0,
      banksman360Check: 0,
      appropriateParkingSite: 0,
      safestApproach: 0,
      spaceVehicleMaintained: 0,
      appropriateSpeed: 0,
      blindSpotChecks: 0,
      upperPartMonitored: 0,
      remarks: ''
    },

    onRoad: {
      knownRoadZones: 0,
      eyesMovement: 0,
      followingSafeDistance: 0,
      blindSpots: 0,
      communication: 0,
      remarks: ''
    },

    drivingSkills: {
      roadSignsMarkings: 0,
      turningLeftRight: 0,
      approachingIntersection: 0,
      approachingRoundabout: 0,
      gearSelection: 0,
      speedControl: 0,
      laneManagement: 0,
      uphillDownhill: 0,
      drivingControl: 0,
      courtesyConsideration: 0,
      parking: 0,
      attitude: 0,
      vehicleTroubleshooting: 0,
      remarks: ''
    },

    totalScore: 0,
    percentage: 0,
    result: 'Awareness',
    areaOfImprovement: '',
    inspectorName: '',
    inspectorSignature: null
  });

  const handleInputChange = (field: string, value: any, section?: string) => {
    if (section) {
      setFormData(prev => {
        const updated = {
          ...prev,
          [section]: {
            ...prev[section as keyof FormData],
            [field]: value
          }
        };
        
        // Recalculate scores when any assessment field changes
        if (['theory', 'preTrip', 'knowledge', 'onRoad', 'drivingSkills'].includes(section)) {
          const newScores = calculateScores(updated);
          return { ...updated, ...newScores };
        }
        
        return updated;
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const calculateScores = (data: FormData) => {
    // Theory total - calculate actual points based on multipliers
    const theoryTotal = (data.theory.trafficRules * 2) + 
                       (data.theory.goldenRules * 3) + 
                       (data.theory.hsePractices * 2) + 
                       (data.theory.ptwSystem * 2) + 
                       (data.theory.productKnowledge * 2) + 
                       (data.theory.loadingUnloading * 2);

    // Pre-Trip total
    const preTripTotal = data.preTrip.flowersMethod * 2;

    // Knowledge total - each item worth 2 points
    const knowledgeTotal = (data.knowledge.backingAvoidance + 
                           data.knowledge.banksman360Check + 
                           data.knowledge.appropriateParkingSite + 
                           data.knowledge.safestApproach + 
                           data.knowledge.spaceVehicleMaintained + 
                           data.knowledge.appropriateSpeed + 
                           data.knowledge.blindSpotChecks + 
                           data.knowledge.upperPartMonitored) * 2;

    // On Road total - each item worth 2 points
    const onRoadTotal = (data.onRoad.knownRoadZones + 
                        data.onRoad.eyesMovement + 
                        data.onRoad.followingSafeDistance + 
                        data.onRoad.blindSpots + 
                        data.onRoad.communication) * 2;

    // Driving Skills total - each item worth 2 points
    const drivingSkillsTotal = (data.drivingSkills.roadSignsMarkings + 
                               data.drivingSkills.turningLeftRight + 
                               data.drivingSkills.approachingIntersection + 
                               data.drivingSkills.approachingRoundabout + 
                               data.drivingSkills.gearSelection + 
                               data.drivingSkills.speedControl + 
                               data.drivingSkills.laneManagement + 
                               data.drivingSkills.uphillDownhill + 
                               data.drivingSkills.drivingControl + 
                               data.drivingSkills.courtesyConsideration + 
                               data.drivingSkills.parking + 
                               data.drivingSkills.attitude + 
                               data.drivingSkills.vehicleTroubleshooting) * 2;

    const totalScore = theoryTotal + preTripTotal + knowledgeTotal + onRoadTotal + drivingSkillsTotal;
    const maxPossibleScore = (2*3 + 3*3 + 2*3 + 2*3 + 2*3 + 2*3) + (2*3) + (8*2*3) + (5*2*3) + (13*2*3); // 201 max points
    const percentage = Math.round((totalScore / maxPossibleScore) * 100);

    // Determine result based on TRISTAR criteria
    let result: 'Awareness' | 'Knowledge' | 'Skill';
    if (percentage < 50) {
      result = 'Awareness';
    } else if (percentage >= 50 && percentage < 80) {
      result = 'Knowledge';
    } else {
      result = 'Skill';
    }

    return {
      totalScore,
      percentage,
      result
    };
  };

  // Calculate section totals for display
  const getSectionTotals = () => {
    const theoryTotal = (formData.theory.trafficRules * 2) + 
                       (formData.theory.goldenRules * 3) + 
                       (formData.theory.hsePractices * 2) + 
                       (formData.theory.ptwSystem * 2) + 
                       (formData.theory.productKnowledge * 2) + 
                       (formData.theory.loadingUnloading * 2);

    const preTripTotal = formData.preTrip.flowersMethod * 2;

    const knowledgeTotal = (formData.knowledge.backingAvoidance + 
                           formData.knowledge.banksman360Check + 
                           formData.knowledge.appropriateParkingSite + 
                           formData.knowledge.safestApproach + 
                           formData.knowledge.spaceVehicleMaintained + 
                           formData.knowledge.appropriateSpeed + 
                           formData.knowledge.blindSpotChecks + 
                           formData.knowledge.upperPartMonitored) * 2;

    const onRoadTotal = (formData.onRoad.knownRoadZones + 
                        formData.onRoad.eyesMovement + 
                        formData.onRoad.followingSafeDistance + 
                        formData.onRoad.blindSpots + 
                        formData.onRoad.communication) * 2;

    const drivingSkillsTotal = (formData.drivingSkills.roadSignsMarkings + 
                               formData.drivingSkills.turningLeftRight + 
                               formData.drivingSkills.approachingIntersection + 
                               formData.drivingSkills.approachingRoundabout + 
                               formData.drivingSkills.gearSelection + 
                               formData.drivingSkills.speedControl + 
                               formData.drivingSkills.laneManagement + 
                               formData.drivingSkills.uphillDownhill + 
                               formData.drivingSkills.drivingControl + 
                               formData.drivingSkills.courtesyConsideration + 
                               formData.drivingSkills.parking + 
                               formData.drivingSkills.attitude + 
                               formData.drivingSkills.vehicleTroubleshooting) * 2;

    return {
      theory: theoryTotal,
      preTrip: preTripTotal,
      knowledge: knowledgeTotal,
      onRoad: onRoadTotal,
      drivingSkills: drivingSkillsTotal
    };
  };

  const getScoreBreakdown = () => {
    return {
      awareness: formData.percentage < 50 ? formData.percentage : Math.max(0, formData.percentage - 70),
      knowledge: formData.percentage >= 50 && formData.percentage < 80 ? formData.percentage : Math.min(80, Math.max(50, formData.percentage)),
      skill: formData.percentage >= 80 ? formData.percentage : Math.min(formData.percentage, 80)
    };
  };

  const validateForm = (): boolean => {
    const required = ['driverName', 'hcmCode', 'inspectorName'];

    for (const field of required) {
      if (!formData[field as keyof FormData]) {
        toast.error(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`);
        return false;
      }
    }

    if (!formData.inspectorSignature) {
      toast.error('Please provide inspector signature');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const scores = getScoreBreakdown();

      const assessmentData = {
        name: formData.driverName,
        licenseNumber: formData.hcmCode,
        empId: formData.hcmCode,
        group: formData.group,
        location: formData.location,
        hireDate: formData.hireDate,
        overallScore: formData.percentage,
        awareness: scores.awareness,
        knowledge: scores.knowledge,
        skill: scores.skill,
        status: formData.result === 'Skill' ? 'passed' : 'failed' as 'passed' | 'failed',
        date: formData.date,
        assessorName: formData.inspectorName,
        assessorId: user.uid,
        assessmentDetails: {
          documentNo: formData.documentNo,
          weather: formData.weather,
          roadConditions: formData.roadConditions,
          driverConditions: formData.driverConditions,
          theory: formData.theory,
          preTrip: formData.preTrip,
          knowledge: formData.knowledge,
          onRoad: formData.onRoad,
          drivingSkills: formData.drivingSkills,
          totalScore: formData.totalScore,
          percentage: formData.percentage,
          result: formData.result,
          areaOfImprovement: formData.areaOfImprovement,
          inspectorSignature: formData.inspectorSignature
        }
      };

      await DatabaseService.createOrUpdateDriverAssessment('in-cab', assessmentData);
      toast.success(isEdit ? 'Assessment updated successfully' : 'Assessment saved successfully');

      onClose();
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error('Failed to save assessment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const RatingSelector = ({ value, onChange, disabled = false }: { value: number; onChange: (value: number) => void; disabled?: boolean }) => (
    <div className="flex space-x-1">
      {ratingOptions.map((option) => (
        <motion.button
          key={option.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={`
            relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
            ${value === option.value 
              ? `bg-gradient-to-br ${option.color} text-white shadow-lg scale-110` 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:scale-105'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          whileHover={!disabled ? { scale: value === option.value ? 1.1 : 1.05 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
        >
          <span className="text-sm font-bold">{option.label}</span>
          {value === option.value && (
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );

  const sectionTotals = getSectionTotals();

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-8"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50 rounded-t-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">TRISTAR IN-CAB ASSESSMENT</h2>
              <p className="text-sm text-gray-600">Document No. {formData.documentNo}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <motion.div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm border">
              <Calculator className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Score: {formData.percentage}%</span>
              <div className={`px-2 py-1 rounded text-xs font-bold ${
                formData.result === 'Skill' ? 'bg-green-100 text-green-800' :
                formData.result === 'Knowledge' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {formData.result}
              </div>
            </motion.div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="rounded-lg"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full hover:bg-red-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* 1- GENERAL INFORMATION */}
          <Card className="overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">1. GENERAL INFORMATION</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Driver Name *</Label>
                  <Input
                    value={formData.driverName}
                    onChange={(e) => handleInputChange('driverName', e.target.value)}
                    className="bg-gray-50 border-gray-300"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Document No.</Label>
                  <Input
                    value={formData.documentNo}
                    disabled
                    className="bg-gray-100 text-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">HCM Code *</Label>
                  <Input
                    value={formData.hcmCode}
                    onChange={(e) => handleInputChange('hcmCode', e.target.value)}
                    className="bg-gray-50 border-gray-300"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Group</Label>
                  <Input
                    value={formData.group}
                    onChange={(e) => handleInputChange('group', e.target.value)}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Hire Date</Label>
                  <Input
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => handleInputChange('hireDate', e.target.value)}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Vehicle Type</Label>
                  <Input
                    value={formData.vehicleType}
                    onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Weather</Label>
                  <Input
                    value={formData.weather}
                    onChange={(e) => handleInputChange('weather', e.target.value)}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Road Conditions</Label>
                  <Input
                    value={formData.roadConditions}
                    onChange={(e) => handleInputChange('roadConditions', e.target.value)}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Driver Conditions</Label>
                  <Input
                    value={formData.driverConditions}
                    onChange={(e) => handleInputChange('driverConditions', e.target.value)}
                    className="bg-gray-50 border-gray-300"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Rating Scale Legend */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-3">Rating Scale</h4>
              <div className="flex space-x-6">
                {ratingOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded bg-gradient-to-br ${option.color} flex items-center justify-center`}>
                      <span className="text-xs font-bold text-white">{option.label}</span>
                    </div>
                    <span className="text-sm text-blue-800">{option.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* 2- THEORY */}
          <Card className="overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-red-100 to-orange-100 p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">2. THEORY</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="px-3 py-1 bg-white rounded-lg font-bold text-red-600">{sectionTotals.theory}/39</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { key: 'trafficRules', label: 'Traffic Rules & Regulations', points: 2 },
                  { key: 'goldenRules', label: 'Tristar RT 5S Golden Rules & Customer LSR', points: 3 },
                  { key: 'hsePractices', label: 'Road Transport HSE Practices: PPEs, JMP, RHM, Incident/Breakdown Reporting & ER (First Aid, Firefighting, Spill/Leak Response), SDS, Tremcard', points: 2 },
                  { key: 'ptwSystem', label: 'PTW System: Hot Work, Confine Space, Cold Work (Work at height)', points: 2 },
                  { key: 'productKnowledge', label: 'Product Knowledge: DG & HAZMAT, Chemicals, Concrete, Aggregate', points: 2 },
                  { key: 'loadingUnloading', label: 'Product Loading & Unloading: Step by Step SOP as per operation', points: 2 }
                ].map((item, index) => (
                  <div key={item.key} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 mb-2">{item.label}</p>
                      <div className="flex items-center justify-between">
                        <RatingSelector
                          value={formData.theory[item.key as keyof typeof formData.theory] as number}
                          onChange={(value) => handleInputChange(item.key, value, 'theory')}
                        />
                        <span className="text-xs text-gray-500 ml-4">× {item.points} pts</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* PRE-TRIP INSPECTION */}
          <Card className="overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">3. PRE-TRIP INSPECTION</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="px-3 py-1 bg-white rounded-lg font-bold text-yellow-600">{sectionTotals.preTrip}/6</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-3">FLOWERS Method</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
                      <div><strong>F</strong> - Fuel, Check Fuel (Diesel) Level</div>
                      <div><strong>L</strong> - Legal, Check Vehicle & Driving License</div>
                      <div><strong>O</strong> - Oil, Check all oil (Engine, Gear, Steering, Hydraulic, etc.) Level</div>
                      <div><strong>W</strong> - Water, Check all water (Radiator, Wiper, Drinking, etc.) Level</div>
                      <div><strong>E</strong> - Electrical, Check all lights (Head Light, Brake Light, Revolving, etc.) & Horns</div>
                      <div><strong>R</strong> - Rubber, Check all Tyres, Wiper Blades, Hoses, etc.</div>
                      <div className="col-span-1 md:col-span-2"><strong>S</strong> - Safety Equipment, Check FE, Spill Kit, First Aid, Reflective Triangle, PPEs</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <RatingSelector
                        value={formData.preTrip.flowersMethod}
                        onChange={(value) => handleInputChange('flowersMethod', value, 'preTrip')}
                      />
                      <span className="text-xs text-gray-500 ml-4">× 2 pts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* KNOWLEDGE */}
          <Card className="overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">4. KNOWLEDGE</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="px-3 py-1 bg-white rounded-lg font-bold text-blue-600">{sectionTotals.knowledge}/48</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { key: 'backingAvoidance', label: 'Backing Avoidance Considered' },
                  { key: 'banksman360Check', label: 'Ensuring for the Banks-Man or 360 degree checks done if no banks-man' },
                  { key: 'appropriateParkingSite', label: 'Chosen appropriate parking site' },
                  { key: 'safestApproach', label: 'Chose the safest approach' },
                  { key: 'spaceVehicleMaintained', label: 'Space around the vehicle was properly maintained & Ensuring for the vehicle stop position' },
                  { key: 'appropriateSpeed', label: 'Chose appropriate speed' },
                  { key: 'blindSpotChecks', label: 'Ensuring for the blind spots (Head Checks and Mirrors)' },
                  { key: 'upperPartMonitored', label: 'Monitored Upper Part of the vehicle' }
                ].map((item, index) => (
                  <div key={item.key} className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 mb-2">{item.label}</p>
                      <div className="flex items-center justify-between">
                        <RatingSelector
                          value={formData.knowledge[item.key as keyof typeof formData.knowledge] as number}
                          onChange={(value) => handleInputChange(item.key, value, 'knowledge')}
                        />
                        <span className="text-xs text-gray-500 ml-4">× 2 pts</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* ON ROAD ASSESSMENT */}
          <Card className="overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-green-100 to-teal-100 p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">5. ON ROAD ASSESSMENT</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="px-3 py-1 bg-white rounded-lg font-bold text-green-600">{sectionTotals.onRoad}/30</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <h4 className="font-bold text-green-900">OBSERVATION, SPACE & VISIBILITY (Smith 5-Keys Techniques)</h4>
              </div>
              <div className="space-y-4">
                {[
                  { key: 'knownRoadZones', label: 'Known Road Zones (Action-6seconds, Seeing-15 seconds & Planning Zone-Unseen)' },
                  { key: 'eyesMovement', label: 'Eyes movement (every 2 seconds)' },
                  { key: 'followingSafeDistance', label: 'Following Safe Distance (6 Seconds) - Able to follow & demonstrate' },
                  { key: 'blindSpots', label: 'Always keeping vehicle out from blind spots' },
                  { key: 'communication', label: 'Always maintaining communication (Indicator, brake, reverse light and Horns)' }
                ].map((item, index) => (
                  <div key={item.key} className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 mb-2">{item.label}</p>
                      <div className="flex items-center justify-between">
                        <RatingSelector
                          value={formData.onRoad[item.key as keyof typeof formData.onRoad] as number}
                          onChange={(value) => handleInputChange(item.key, value, 'onRoad')}
                        />
                        <span className="text-xs text-gray-500 ml-4">× 2 pts</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* DRIVING SKILLS */}
          <Card className="overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">6. DRIVING SKILLS</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="px-3 py-1 bg-white rounded-lg font-bold text-purple-600">{sectionTotals.drivingSkills}/78</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { key: 'roadSignsMarkings', label: 'Able to understand & follow Road signs & Road markings' },
                  { key: 'turningLeftRight', label: 'TURNING LEFT/RIGHT: Slowing down, Mirror Observation, Right of Way, Indication, Lane Selection, Position & Lane shape' },
                  { key: 'approachingIntersection', label: 'APPROACHING INTERSECTION: Slowing down, Lane selection, Observation - Left; Right; Rear, Right of Way; Indication & Stopping - (Before stop line)' },
                  { key: 'approachingRoundabout', label: 'APPROACHING ROUNDABOUT: Slowing down, Lane Selection, Indication, right of way, lane selection on circle/Indication' },
                  { key: 'gearSelection', label: 'GEAR SELECTION: Ensuring correct selection of the gear' },
                  { key: 'speedControl', label: 'SPEED: Following Road/Geofence Speed Limits (Max. 80, Roundabout/curve 15KPH)' },
                  { key: 'laneManagement', label: 'LANE MANAGEMENT: Driving In Slow Lane, using appropriate lane for merging & demerging' },
                  { key: 'uphillDownhill', label: 'UPHILL AND DOWNHILL DRIVING: Uphill-Temperature Gauge; Position; gear selection; emergency stopping; Use of Horn/Head Light on blind spot. Downhill-' },
                  { key: 'drivingControl', label: 'DRIVING CONTROL: Steering grip, Use of hand brake, Horn usage' },
                  { key: 'courtesyConsideration', label: 'COURTESY AND CONSIDERATION FOR ROAD USERS: Pedestrian & Other Road Users' },
                  { key: 'parking', label: 'PARKING: Slow down; Mirror observation; Indication; Safe place' },
                  { key: 'attitude', label: 'ATTITUDE: Positive & Negative, Attitude towards other road users, Use of horn, Non Aggressive, Willing to learn' },
                  { key: 'vehicleTroubleshooting', label: 'KNOWLEDGE OF VEHICLE TROUBLE SHOOTING / MAINTENANCE' }
                ].map((item, index) => (
                  <div key={item.key} className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 mb-2">{item.label}</p>
                      <div className="flex items-center justify-between">
                        <RatingSelector
                          value={formData.drivingSkills[item.key as keyof typeof formData.drivingSkills] as number}
                          onChange={(value) => handleInputChange(item.key, value, 'drivingSkills')}
                        />
                        <span className="text-xs text-gray-500 ml-4">× 2 pts</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* INSPECTOR'S REMARKS */}
          <Card className="overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 border-b">
              <h3 className="text-lg font-bold">7. TEST INSPECTOR'S REMARKS</h3>
              <p className="text-sm opacity-90">Awareness= &lt;50, Knowledge= 50-79, Skill= ≥80</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">Total Score Obtained:</span>
                      <span className="text-2xl font-bold text-blue-600">{formData.totalScore}/201</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-700">Percentage:</span>
                      <span className="text-xl font-bold text-purple-600">{formData.percentage}%</span>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg text-center ${
                    formData.result === 'Skill' ? 'bg-green-100 border-2 border-green-300' :
                    formData.result === 'Knowledge' ? 'bg-yellow-100 border-2 border-yellow-300' :
                    'bg-red-100 border-2 border-red-300'
                  }`}>
                    <div className={`text-2xl font-bold ${
                      formData.result === 'Skill' ? 'text-green-800' :
                      formData.result === 'Knowledge' ? 'text-yellow-800' :
                      'text-red-800'
                    }`}>
                      {formData.result}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Assessment Result</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Inspector Name *</Label>
                    <Input
                      value={formData.inspectorName}
                      onChange={(e) => handleInputChange('inspectorName', e.target.value)}
                      placeholder="Enter inspector name"
                      className="bg-gray-50 border-gray-300"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Inspector Signature *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg">
                      <SignatureCanvas
                        onSignatureChange={(signature) => handleInputChange('inspectorSignature', signature)}
                        value={formData.inspectorSignature}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Areas for Improvement</Label>
                <Textarea
                  value={formData.areaOfImprovement}
                  onChange={(e) => handleInputChange('areaOfImprovement', e.target.value)}
                  placeholder="Enter areas where the driver needs improvement..."
                  rows={6}
                  className="bg-gray-50 border-gray-300"
                />
              </div>
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 px-6"
            >
              {isLoading ? (
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEdit ? 'Update Assessment' : 'Save Assessment'}
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}