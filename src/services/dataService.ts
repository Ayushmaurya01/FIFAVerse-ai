import { db, isFirebaseConfigured } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  doc, 
  updateDoc, 
  setDoc,
  getDoc
} from 'firebase/firestore';

// Define TS Interfaces for operations
export interface EmergencyAlert {
  id: string;
  type: 'medical' | 'security' | 'fire' | 'lost_child' | 'evacuation';
  location: string;
  timestamp: string;
  status: 'active' | 'resolved';
  details?: string;
}

export interface VolunteerTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  timestamp: string;
}

export interface SustainabilityLog {
  walkingDistance: number; // in meters
  transitDistance: number; // in meters
  bottleRefills: number;
  digitalTickets: number;
  wasteReduced: number; // in grams
  co2Saved: number; // in kg
  timestamp: string;
}

// Initial Mock Data to seed LocalStorage
const DEFAULT_ORGANIZER_STATS = {
  totalAttendance: 68450,
  maxCapacity: 75000,
  activeVolunteers: 245,
  idleVolunteers: 18,
  securityAlertsCount: 3,
  parkingStatus: {
    lotA: 88, // % full
    lotB: 65,
    lotC: 92,
    lotD: 40,
  },
  energyUsage: {
    currentKw: 2420,
    renewablesPercentage: 74,
  },
  carbonSavedTotal: 8432.5, // in kg
  visitorDemographics: [
    { name: 'USA', value: 40 },
    { name: 'Mexico', value: 25 },
    { name: 'Canada', value: 15 },
    { name: 'Others', value: 20 },
  ],
};

const DEFAULT_VOLUNTEER_TASKS: VolunteerTask[] = [
  {
    id: 'task-1',
    title: 'Redirect Gate 4 Crowd Flow',
    description: 'Crowd density is reaching red level. Open safety filters and guide incoming fans to Gate 3.',
    status: 'pending',
    priority: 'high',
    location: 'Gate 4 Concourse',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Assist Lost Child Reunion',
    description: 'Child named Mateo (7 yo, green Mexico jersey) is with Section 112 volunteers. Wait for parents.',
    status: 'in_progress',
    priority: 'critical',
    location: 'Section 112 Information Booth',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Deliver AED Kit to Medical Station B',
    description: 'Provide secondary backup defibrillation unit to Sector 2 first-aid post.',
    status: 'completed',
    priority: 'high',
    location: 'Sector 2 Medical Room',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'task-4',
    title: 'Replenish Reusable Cup Station 6',
    description: 'Sustainability stand 6 is running low on reusable beverage bottles.',
    status: 'pending',
    priority: 'low',
    location: 'West Plaza Concourse',
    timestamp: new Date().toISOString(),
  }
];

const DEFAULT_EMERGENCY_ALERTS: EmergencyAlert[] = [
  {
    id: 'alert-1',
    type: 'medical',
    location: 'Section 108, Row 14',
    timestamp: new Date().toISOString(),
    status: 'active',
    details: 'Fan reports chest pain. Volunteer en route with AED.',
  },
  {
    id: 'alert-2',
    type: 'lost_child',
    location: 'Section 112 Booth',
    timestamp: new Date().toISOString(),
    status: 'active',
    details: 'Mateo, 7 years old, wearing Mexico shirt, separated from father.',
  }
];

const DEFAULT_SUSTAINABILITY_LOGS: SustainabilityLog = {
  walkingDistance: 2400,
  transitDistance: 12000,
  bottleRefills: 3,
  digitalTickets: 1,
  wasteReduced: 450,
  co2Saved: 3.2,
  timestamp: new Date().toISOString(),
};

// Initialize LocalStorage Data if not present
function initLocalStorage() {
  if (typeof window !== 'undefined') {
    if (!localStorage.getItem('fifa_organizer_stats')) {
      localStorage.setItem('fifa_organizer_stats', JSON.stringify(DEFAULT_ORGANIZER_STATS));
    }
    if (!localStorage.getItem('fifa_volunteer_tasks')) {
      localStorage.setItem('fifa_volunteer_tasks', JSON.stringify(DEFAULT_VOLUNTEER_TASKS));
    }
    if (!localStorage.getItem('fifa_emergency_alerts')) {
      localStorage.setItem('fifa_emergency_alerts', JSON.stringify(DEFAULT_EMERGENCY_ALERTS));
    }
    if (!localStorage.getItem('fifa_sustainability_logs')) {
      localStorage.setItem('fifa_sustainability_logs', JSON.stringify(DEFAULT_SUSTAINABILITY_LOGS));
    }
  }
}

initLocalStorage();

// ==========================================
// 1. EMERGENCY ALERTS SERVICE
// ==========================================

export async function getEmergencyAlerts(): Promise<EmergencyAlert[]> {
  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, 'emergency_alerts'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const alerts: EmergencyAlert[] = [];
      querySnapshot.forEach((doc) => {
        alerts.push({ id: doc.id, ...doc.data() } as EmergencyAlert);
      });
      return alerts;
    } catch (e) {
      console.warn('Firestore failed, loading from LocalStorage instead:', e);
    }
  }

  const raw = localStorage.getItem('fifa_emergency_alerts');
  return raw ? JSON.parse(raw) : [];
}

export async function createEmergencyAlert(alert: Omit<EmergencyAlert, 'id' | 'timestamp' | 'status'>): Promise<EmergencyAlert> {
  const newAlert: EmergencyAlert = {
    ...alert,
    id: 'alert-' + Date.now(),
    timestamp: new Date().toISOString(),
    status: 'active',
  };

  if (isFirebaseConfigured) {
    try {
      const docRef = await addDoc(collection(db, 'emergency_alerts'), newAlert);
      newAlert.id = docRef.id;
      return newAlert;
    } catch (e) {
      console.warn('Firestore failed, writing to LocalStorage instead:', e);
    }
  }

  const alerts = await getEmergencyAlerts();
  alerts.unshift(newAlert);
  localStorage.setItem('fifa_emergency_alerts', JSON.stringify(alerts));

  // Sync to organizer stats
  const stats = await getOrganizerStats();
  stats.securityAlertsCount += 1;
  await saveOrganizerStats(stats);

  return newAlert;
}

export async function resolveEmergencyAlert(id: string): Promise<void> {
  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'emergency_alerts', id);
      await updateDoc(docRef, { status: 'resolved' });
      return;
    } catch (e) {
      console.warn('Firestore update failed, editing LocalStorage:', e);
    }
  }

  const alerts = await getEmergencyAlerts();
  const index = alerts.findIndex((a) => a.id === id);
  if (index !== -1) {
    alerts[index].status = 'resolved';
    localStorage.setItem('fifa_emergency_alerts', JSON.stringify(alerts));
  }
}

// ==========================================
// 2. VOLUNTEER TASKS SERVICE
// ==========================================

export async function getVolunteerTasks(): Promise<VolunteerTask[]> {
  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, 'volunteer_tasks'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const tasks: VolunteerTask[] = [];
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() } as VolunteerTask);
      });
      return tasks;
    } catch (e) {
      console.warn('Firestore task loading failed, reading LocalStorage:', e);
    }
  }

  const raw = localStorage.getItem('fifa_volunteer_tasks');
  return raw ? JSON.parse(raw) : [];
}

export async function updateTaskStatus(id: string, status: 'pending' | 'in_progress' | 'completed'): Promise<void> {
  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'volunteer_tasks', id);
      await updateDoc(docRef, { status });
      return;
    } catch (e) {
      console.warn('Firestore task update failed, editing LocalStorage:', e);
    }
  }

  const tasks = await getVolunteerTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index !== -1) {
    tasks[index].status = status;
    localStorage.setItem('fifa_volunteer_tasks', JSON.stringify(tasks));
  }
}

export async function addVolunteerTask(task: Omit<VolunteerTask, 'id' | 'timestamp'>): Promise<VolunteerTask> {
  const newTask: VolunteerTask = {
    ...task,
    id: 'task-' + Date.now(),
    timestamp: new Date().toISOString(),
  };

  if (isFirebaseConfigured) {
    try {
      const docRef = await addDoc(collection(db, 'volunteer_tasks'), newTask);
      newTask.id = docRef.id;
      return newTask;
    } catch (e) {
      console.warn('Firestore task creation failed, saving locally:', e);
    }
  }

  const tasks = await getVolunteerTasks();
  tasks.unshift(newTask);
  localStorage.setItem('fifa_volunteer_tasks', JSON.stringify(tasks));
  return newTask;
}

// ==========================================
// 3. SUSTAINABILITY SERVICE
// ==========================================

export async function getSustainabilityLogs(): Promise<SustainabilityLog> {
  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'sustainability', 'user_global_score');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as SustainabilityLog;
      }
    } catch (e) {
      console.warn('Firestore load failed, loading from LocalStorage:', e);
    }
  }

  const raw = localStorage.getItem('fifa_sustainability_logs');
  return raw ? JSON.parse(raw) : DEFAULT_SUSTAINABILITY_LOGS;
}

export async function logSustainabilityAction(
  action: Partial<Omit<SustainabilityLog, 'timestamp'>>
): Promise<SustainabilityLog> {
  const current = await getSustainabilityLogs();
  
  const updated: SustainabilityLog = {
    walkingDistance: current.walkingDistance + (action.walkingDistance || 0),
    transitDistance: current.transitDistance + (action.transitDistance || 0),
    bottleRefills: current.bottleRefills + (action.bottleRefills || 0),
    digitalTickets: current.digitalTickets + (action.digitalTickets || 0),
    wasteReduced: current.wasteReduced + (action.wasteReduced || 0),
    co2Saved: Number((current.co2Saved + (action.co2Saved || 0)).toFixed(2)),
    timestamp: new Date().toISOString(),
  };

  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'sustainability', 'user_global_score');
      await setDoc(docRef, updated);
      return updated;
    } catch (e) {
      console.warn('Firestore save failed, saving locally:', e);
    }
  }

  localStorage.setItem('fifa_sustainability_logs', JSON.stringify(updated));

  // Sync carbon savings to organizer dashboard total as well!
  const stats = await getOrganizerStats();
  stats.carbonSavedTotal = Number((stats.carbonSavedTotal + (action.co2Saved || 0)).toFixed(2));
  await saveOrganizerStats(stats);

  return updated;
}

// ==========================================
// 4. ORGANIZER PLATFORM STATS
// ==========================================

export async function getOrganizerStats(): Promise<typeof DEFAULT_ORGANIZER_STATS> {
  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'organizer', 'live_dashboard_stats');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as typeof DEFAULT_ORGANIZER_STATS;
      }
    } catch (e) {
      console.warn('Firestore organizer load failed:', e);
    }
  }

  const raw = localStorage.getItem('fifa_organizer_stats');
  return raw ? JSON.parse(raw) : DEFAULT_ORGANIZER_STATS;
}

export async function saveOrganizerStats(stats: typeof DEFAULT_ORGANIZER_STATS): Promise<void> {
  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'organizer', 'live_dashboard_stats');
      await setDoc(docRef, stats);
      return;
    } catch (e) {
      console.warn('Firestore organizer write failed:', e);
    }
  }

  localStorage.setItem('fifa_organizer_stats', JSON.stringify(stats));
}
