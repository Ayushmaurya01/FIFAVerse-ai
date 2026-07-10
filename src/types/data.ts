export type AppLanguage = 'en' | 'es' | 'fr' | 'pt' | 'ar' | 'hi';

export interface UserSession {
  role: 'volunteer' | 'organizer' | 'fan';
  name: string;
  id: string;
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

  // Optional new platform fields
  id?: string;
  userId?: string;
  action?: string;
  points?: number;
  date?: string;
  category?: 'transit' | 'recycling' | 'energy' | 'water';
}

export interface EmergencyAlert {
  id: string;
  type: 'medical' | 'security' | 'fire' | 'lost_child' | 'evacuation';
  location: string;
  timestamp: string;
  status: 'active' | 'resolved';
  details?: string;
}
