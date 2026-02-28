export type UserRole = 'user' | 'verifier';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  avatar: string | null;
  points: number;
  role: UserRole;
  tasksCreated: string[];
  tasksCompleted: string[];
  tasksInProgress: string[];
}

export type TaskStatus = 'active' | 'in_progress' | 'pending_verification' | 'completed';

export interface Task {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  photoBefore: string;
  photosBefore?: string[];
  status: TaskStatus;
  takenBy: string | null;
  photoAfter: string | null;
  photosAfter?: string[] | null;
  submitComment?: string | null;
  completedAt: string | null;
  verifiedBy: string | null;
  photoAfterCoords: { lat: number; lng: number } | null;
  points: number;
  createdAt: string;
}

export interface AppData {
  users: User[];
  tasks: Task[];
}
