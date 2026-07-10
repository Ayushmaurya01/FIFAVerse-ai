export interface MatchItem {
  id: string;
  teams: string;
  time: string;
  gate: string;
  status: 'upcoming' | 'live' | 'finished';
  attendance: string;
}

export const MATCH_SCHEDULE: MatchItem[] = [
  { id: 'm1', teams: '🇺🇸 USA vs 🏴󠁧󠁢󠁥󠁮󠁧󠁿 England', time: 'Today, 18:00 (CST)', gate: 'Gates A & B', status: 'live', attendance: '92% Capacity' },
  { id: 'm2', teams: '🇲🇽 Mexico vs 🇦🇷 Argentina', time: 'Tomorrow, 20:00 (CST)', gate: 'All Gates', status: 'upcoming', attendance: '98% Capacity' },
  { id: 'm3', teams: '🇨🇦 Canada vs 🇫🇷 France', time: 'Jul 12, 15:00 (EST)', gate: 'Gates C & D', status: 'upcoming', attendance: '88% Capacity' },
  { id: 'm4', teams: '🇧🇷 Brazil vs 🇩🇪 Germany', time: 'Jul 13, 19:30 (PST)', gate: 'Gates E & F', status: 'upcoming', attendance: '95% Capacity' },
];

export const WORLD_CUP_WEATHER = [
  { city: 'Dallas (AT&T Stadium)', temp: '32°C', cond: 'Sunny / Warm', wind: '12 km/h', hum: '45%' },
  { city: 'Vancouver (BC Place)', temp: '19°C', cond: 'Partly Cloudy', wind: '8 km/h', hum: '60%' },
  { city: 'Mexico City (Estadio Azteca)', temp: '24°C', cond: 'Rain / Thunder', wind: '15 km/h', hum: '75%' },
  { city: 'New York (MetLife Stadium)', temp: '28°C', cond: 'Sunny', wind: '10 km/h', hum: '50%' },
];

export interface LostItem {
  id: string;
  description: string;
  category: string;
  locationFound: string;
  status: 'claimed' | 'unclaimed';
  date: string;
}

export const LOST_AND_FOUND_DB: LostItem[] = [
  { id: 'lf1', description: 'Black leather wallet with credit cards and ID', category: 'Wallet/ID', locationFound: 'Section 105, Row 12', status: 'unclaimed', date: 'Today, 14:15' },
  { id: 'lf2', description: 'iPhone 15 Pro with a clear blue plastic case', category: 'Electronics', locationFound: 'Gate B Concourse Restrooms', status: 'unclaimed', date: 'Today, 15:30' },
  { id: 'lf3', description: 'Keys with a red lanyard and a mini soccer ball keychain', category: 'Keys', locationFound: 'Section 220, Row 3', status: 'claimed', date: 'Yesterday' },
  { id: 'lf4', description: 'Official FWC 2026 match souvenir cap, green/white', category: 'Apparel', locationFound: 'Food Court Area 3', status: 'unclaimed', date: 'Today, 16:00' },
  { id: 'lf5', description: 'Black backpack containing water bottle and program guide', category: 'Bags', locationFound: 'Section 114, Row 18', status: 'unclaimed', date: 'Today, 12:45' },
];
