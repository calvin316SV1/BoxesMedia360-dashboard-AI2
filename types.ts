export interface Client {
  id: number;
  name: string; // Company Name
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  industry: string;
  status: 'prospect' | 'active' | 'former';
  totalValue: number;
  notes?: string;
  avatarUrl: string; // Contact person's avatar
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export type ServiceType = 
  | 'Web Development' 
  | 'Mobile App' 
  | 'UI/UX Design' 
  | 'Branding' 
  | 'Digital Marketing' 
  | 'Consulting' 
  | 'E-commerce' 
  | 'SEO' 
  | 'Content Creation' 
  | 'Social Media';

export interface Project {
  id: number;
  name: string;
  clientName: string;
  status: 'In Progress' | 'Completed' | 'On Hold';
  serviceType: ServiceType;
  notes?: string;
  checklist: ChecklistItem[];
  imageUrls?: string[];
}

export interface Invoice {
  id: string;
  clientName: string;
  projectIds: number[];
  description: string;
  amount: number; // Represents the subtotal before tax
  dueDate: string; // YYYY-MM-DD
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: 'Admin' | 'User' | 'Guest';
  avatarUrl: string;
}