export interface Volunteer {
  id: number;
  name: string;
  email: string;
  mobile: string;
  city: string;
  skills: string;
  status: 'Active' | 'Inactive';
  created_at: string;
  events?: Event[];
}

export interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
  required_volunteers: number;
  volunteers_joined: number;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  created_at: string;
  volunteers?: Volunteer[];
}

export interface RecentActivity {
  registered_at: string;
  volunteer_name: string;
  event_name: string;
}

export interface DashboardStats {
  totalVolunteers: number;
  activeVolunteers: number;
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalRegistrations: number;
  recentActivities: RecentActivity[];
}

export type UserRole = 'Admin' | 'Volunteer';

export interface UserSession {
  role: UserRole;
  volunteerId?: number; // if logged in as a volunteer, this points to their volunteer profile id
  name: string;
}
