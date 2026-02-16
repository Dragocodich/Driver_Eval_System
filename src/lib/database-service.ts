// LocalStorage-based Database Service (No Firebase)

export interface AssessmentData {
  score: number;
  awareness: number;
  knowledge: number;
  skill: number;
  status: 'passed' | 'failed';
  date: string;
  assessorName: string;
  assessorId: string;
  remarks: string;
  assessmentDetails?: any;
}

export interface DriverRecord {
  id: string;
  name: string;
  licenseNumber: string;
  empId?: string;
  group?: string;
  location?: string;
  hireDate?: string;
  createdAt: string;
  updatedAt: string;
  
  // Assessment data for each type
  inCabAssessment?: AssessmentData;
  interviewAssessment?: AssessmentData;
  initialAssessment?: AssessmentData;
  
  // Overall status and scores (computed from latest assessments)
  overallScore: number;
  overallStatus: 'passed' | 'failed' | 'pending';
  lastAssessmentDate: string;
  lastAssessmentType: 'in-cab' | 'interview' | 'initial';
}

export type AssessmentType = 'in-cab' | 'interview' | 'initial';

class DatabaseServiceClass {
  private readonly STORAGE_KEY = 'tristar_drivers';
  private subscribers: Array<(drivers: DriverRecord[]) => void> = [];

  constructor() {
    // Initialize with sample data if empty
    const drivers = this.getAllDriversSync();
    if (drivers.length === 0) {
      this.initializeSampleData();
    }
  }

  // Initialize sample data for demo purposes
  private initializeSampleData() {
    const sampleDrivers: DriverRecord[] = [
      {
        id: '1',
        name: 'John Smith',
        licenseNumber: 'DL-2024-001',
        empId: 'EMP001',
        group: 'Group A',
        location: 'Sydney',
        hireDate: '2024-01-15',
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date().toISOString(),
        overallScore: 85,
        overallStatus: 'passed',
        lastAssessmentDate: new Date().toISOString().split('T')[0],
        lastAssessmentType: 'in-cab',
        inCabAssessment: {
          score: 85,
          awareness: 28,
          knowledge: 27,
          skill: 30,
          status: 'passed',
          date: new Date().toISOString().split('T')[0],
          assessorName: 'Admin User',
          assessorId: 'admin-001',
          remarks: 'Good driving skills demonstrated'
        }
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        licenseNumber: 'DL-2024-002',
        empId: 'EMP002',
        group: 'Group B',
        location: 'Melbourne',
        hireDate: '2024-02-01',
        createdAt: new Date('2024-02-01').toISOString(),
        updatedAt: new Date().toISOString(),
        overallScore: 92,
        overallStatus: 'passed',
        lastAssessmentDate: new Date().toISOString().split('T')[0],
        lastAssessmentType: 'interview',
        interviewAssessment: {
          score: 92,
          awareness: 30,
          knowledge: 32,
          skill: 30,
          status: 'passed',
          date: new Date().toISOString().split('T')[0],
          assessorName: 'Admin User',
          assessorId: 'admin-001',
          remarks: 'Excellent theoretical knowledge'
        }
      },
      {
        id: '3',
        name: 'Michael Brown',
        licenseNumber: 'DL-2024-003',
        empId: 'EMP003',
        group: 'Group A',
        location: 'Brisbane',
        hireDate: '2024-01-20',
        createdAt: new Date('2024-01-20').toISOString(),
        updatedAt: new Date().toISOString(),
        overallScore: 78,
        overallStatus: 'passed',
        lastAssessmentDate: new Date().toISOString().split('T')[0],
        lastAssessmentType: 'in-cab',
        inCabAssessment: {
          score: 78,
          awareness: 26,
          knowledge: 24,
          skill: 28,
          status: 'passed',
          date: new Date().toISOString().split('T')[0],
          assessorName: 'Test User',
          assessorId: 'test-001',
          remarks: 'Satisfactory performance'
        }
      }
    ];

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sampleDrivers));
  }

  // Get all drivers synchronously
  private getAllDriversSync(): DriverRecord[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  // Save drivers to localStorage
  private saveDrivers(drivers: DriverRecord[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(drivers));
      this.notifySubscribers(drivers);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw new Error('Failed to save data');
    }
  }

  // Notify all subscribers
  private notifySubscribers(drivers: DriverRecord[]) {
    this.subscribers.forEach(callback => {
      try {
        callback(drivers);
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }

  // Create or update a driver with assessment data
  async createOrUpdateDriverAssessment(
    assessmentType: AssessmentType,
    driverData: {
      name: string;
      licenseNumber: string;
      empId?: string;
      group?: string;
      location?: string;
      hireDate?: string;
      overallScore: number;
      awareness: number;
      knowledge: number;
      skill: number;
      status: 'passed' | 'failed';
      date: string;
      assessorName: string;
      assessorId: string;
      assessmentDetails?: any;
    }
  ): Promise<string> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const drivers = this.getAllDriversSync();
      const existingDriver = drivers.find(d => d.licenseNumber === driverData.licenseNumber);
      
      const assessmentData: AssessmentData = {
        score: driverData.overallScore,
        awareness: driverData.awareness,
        knowledge: driverData.knowledge,
        skill: driverData.skill,
        status: driverData.status,
        date: driverData.date,
        assessorName: driverData.assessorName,
        assessorId: driverData.assessorId,
        remarks: this.generateRemarks(assessmentType, driverData),
        assessmentDetails: driverData.assessmentDetails
      };

      if (existingDriver) {
        // Update existing driver
        existingDriver.updatedAt = new Date().toISOString();
        existingDriver.overallScore = driverData.overallScore;
        existingDriver.overallStatus = driverData.status;
        existingDriver.lastAssessmentDate = driverData.date;
        existingDriver.lastAssessmentType = assessmentType;

        // Update basic info if provided
        if (driverData.empId) existingDriver.empId = driverData.empId;
        if (driverData.group) existingDriver.group = driverData.group;
        if (driverData.location) existingDriver.location = driverData.location;
        if (driverData.hireDate) existingDriver.hireDate = driverData.hireDate;

        // Update the specific assessment field
        const assessmentField = this.getAssessmentFieldName(assessmentType);
        (existingDriver as any)[assessmentField] = assessmentData;

        this.saveDrivers(drivers);
        return existingDriver.id;
      } else {
        // Create new driver
        const newDriver: DriverRecord = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: driverData.name,
          licenseNumber: driverData.licenseNumber,
          empId: driverData.empId || '',
          group: driverData.group || '',
          location: driverData.location || '',
          hireDate: driverData.hireDate || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          overallScore: driverData.overallScore,
          overallStatus: driverData.status,
          lastAssessmentDate: driverData.date,
          lastAssessmentType: assessmentType
        };

        // Set the specific assessment field
        const assessmentField = this.getAssessmentFieldName(assessmentType);
        (newDriver as any)[assessmentField] = assessmentData;

        drivers.push(newDriver);
        this.saveDrivers(drivers);
        return newDriver.id;
      }
    } catch (error) {
      console.error('Error creating/updating driver assessment:', error);
      throw new Error('Failed to save driver assessment');
    }
  }

  // Helper to get the correct field name for assessment type
  private getAssessmentFieldName(assessmentType: AssessmentType): string {
    switch (assessmentType) {
      case 'in-cab':
        return 'inCabAssessment';
      case 'interview':
        return 'interviewAssessment';
      case 'initial':
        return 'initialAssessment';
      default:
        return 'inCabAssessment';
    }
  }

  // Generate remarks based on assessment type and data
  private generateRemarks(assessmentType: AssessmentType, data: any): string {
    const remarks = [];

    switch (assessmentType) {
      case 'in-cab':
        if (data.assessmentDetails?.preTrip?.notes) {
          remarks.push(`Pre-trip: ${data.assessmentDetails.preTrip.notes}`);
        }
        if (data.assessmentDetails?.driving?.notes) {
          remarks.push(`Driving: ${data.assessmentDetails.driving.notes}`);
        }
        if (data.assessmentDetails?.postTrip?.notes) {
          remarks.push(`Post-trip: ${data.assessmentDetails.postTrip.notes}`);
        }
        if (data.assessmentDetails?.recommendations) {
          remarks.push(`Recommendations: ${data.assessmentDetails.recommendations}`);
        }
        break;
        
      case 'interview':
        if (data.assessmentDetails?.theoryTest?.remarks) {
          remarks.push(`Theory: ${data.assessmentDetails.theoryTest.remarks}`);
        }
        if (data.assessmentDetails?.psychotechnical?.remarks) {
          remarks.push(`Psychotechnical: ${data.assessmentDetails.psychotechnical.remarks}`);
        }
        if (data.assessmentDetails?.hrEvaluation?.remarks) {
          remarks.push(`HR Evaluation: ${data.assessmentDetails.hrEvaluation.remarks}`);
        }
        if (data.assessmentDetails?.consolidatedResults?.practicalRemarks) {
          remarks.push(`Overall: ${data.assessmentDetails.consolidatedResults.practicalRemarks}`);
        }
        break;
        
      default:
        remarks.push(`${assessmentType} assessment completed`);
    }

    return remarks.length > 0 ? remarks.join('. ') : `${assessmentType} assessment completed with score: ${data.overallScore}%`;
  }

  // Get all drivers
  async getAllDrivers(): Promise<DriverRecord[]> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const drivers = this.getAllDriversSync();
      // Sort by updatedAt descending
      return drivers.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (error) {
      console.error('Error getting drivers:', error);
      throw new Error('Failed to fetch drivers');
    }
  }

  // Get drivers filtered by assessment type
  async getDriversByAssessment(assessmentType: AssessmentType): Promise<DriverRecord[]> {
    try {
      const allDrivers = await this.getAllDrivers();
      const assessmentField = this.getAssessmentFieldName(assessmentType) as keyof DriverRecord;
      
      return allDrivers.filter(driver => driver[assessmentField] != null);
    } catch (error) {
      console.error('Error getting drivers by assessment:', error);
      return [];
    }
  }

  // Subscribe to drivers changes
  subscribeToDrivers(callback: (drivers: DriverRecord[]) => void): () => void {
    try {
      // Add subscriber
      this.subscribers.push(callback);

      // Immediately call with current data
      const drivers = this.getAllDriversSync();
      const sortedDrivers = drivers.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      callback(sortedDrivers);

      // Return unsubscribe function
      return () => {
        this.subscribers = this.subscribers.filter(sub => sub !== callback);
      };
    } catch (error) {
      console.error('Error setting up drivers subscription:', error);
      return () => {};
    }
  }

  // Subscribe to drivers filtered by assessment type
  subscribeToDriversByAssessment(
    assessmentType: AssessmentType, 
    callback: (drivers: DriverRecord[]) => void
  ): () => void {
    try {
      return this.subscribeToDrivers((allDrivers) => {
        const assessmentField = this.getAssessmentFieldName(assessmentType) as keyof DriverRecord;
        const filteredDrivers = allDrivers.filter(driver => driver[assessmentField] != null);
        callback(filteredDrivers);
      });
    } catch (error) {
      console.error('Error setting up filtered drivers subscription:', error);
      return () => {};
    }
  }

  // Get driver by ID
  async getDriverById(id: string): Promise<DriverRecord | null> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const drivers = this.getAllDriversSync();
      return drivers.find(d => d.id === id) || null;
    } catch (error) {
      console.error('Error getting driver by ID:', error);
      throw new Error('Failed to fetch driver');
    }
  }

  // Update driver
  async updateDriver(id: string, data: Partial<DriverRecord>): Promise<void> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const drivers = this.getAllDriversSync();
      const driverIndex = drivers.findIndex(d => d.id === id);
      
      if (driverIndex === -1) {
        throw new Error('Driver not found');
      }

      drivers[driverIndex] = {
        ...drivers[driverIndex],
        ...data,
        updatedAt: new Date().toISOString()
      };

      this.saveDrivers(drivers);
    } catch (error) {
      console.error('Error updating driver:', error);
      throw new Error('Failed to update driver');
    }
  }

  // Delete driver
  async deleteDriver(id: string): Promise<void> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const drivers = this.getAllDriversSync();
      const filteredDrivers = drivers.filter(d => d.id !== id);
      
      this.saveDrivers(filteredDrivers);
    } catch (error) {
      console.error('Error deleting driver:', error);
      throw new Error('Failed to delete driver');
    }
  }

  // Legacy methods for backward compatibility
  async createDriver(driverData: any): Promise<string> {
    const assessmentType: AssessmentType = driverData.type || 'in-cab';
    return this.createOrUpdateDriverAssessment(assessmentType, driverData);
  }

  // Get assessment statistics
  async getAssessmentStats(assessmentType?: AssessmentType): Promise<{
    total: number;
    passed: number;
    failed: number;
    averageScore: number;
  }> {
    try {
      let drivers: DriverRecord[];

      if (assessmentType) {
        drivers = await this.getDriversByAssessment(assessmentType);
      } else {
        drivers = await this.getAllDrivers();
      }

      const total = drivers.length;
      let passed = 0;
      let failed = 0;
      let totalScore = 0;

      drivers.forEach(driver => {
        if (assessmentType) {
          const assessmentField = this.getAssessmentFieldName(assessmentType) as keyof DriverRecord;
          const assessment = driver[assessmentField] as AssessmentData;
          if (assessment) {
            if (assessment.status === 'passed') passed++;
            else failed++;
            totalScore += assessment.score;
          }
        } else {
          if (driver.overallStatus === 'passed') passed++;
          else if (driver.overallStatus === 'failed') failed++;
          totalScore += driver.overallScore;
        }
      });

      return {
        total,
        passed,
        failed,
        averageScore: total > 0 ? Math.round(totalScore / total) : 0
      };
    } catch (error) {
      console.error('Error getting assessment stats:', error);
      return { total: 0, passed: 0, failed: 0, averageScore: 0 };
    }
  }

  // Helper method to check connection (always returns true for localStorage)
  async testConnection(): Promise<boolean> {
    try {
      // Test localStorage access
      localStorage.setItem('tristar_connection_test', 'test');
      localStorage.removeItem('tristar_connection_test');
      return true;
    } catch (error) {
      console.error('LocalStorage test failed:', error);
      return false;
    }
  }
}

export const DatabaseService = new DatabaseServiceClass();
