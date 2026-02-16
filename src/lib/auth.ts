import { UserRole } from '@/types';

// ─── Demo Authentication System ───
// In production, this would integrate with Nepal e-Government SSO

export interface SessionUser {
  id: string;
  name: string;
  nameNe?: string;
  email: string;
  role: UserRole;
  house?: 'HOR' | 'NA';
  party?: string;
}

// Demo users for each role
export const DEMO_USERS: SessionUser[] = [
  {
    id: 'user-ministry-1',
    name: 'Ram Prasad Sharma',
    nameNe: 'राम प्रसाद शर्मा',
    email: 'ministry@gov.np',
    role: 'MINISTRY',
  },
  {
    id: 'user-mp-1',
    name: 'Sita Devi Thapa',
    nameNe: 'सीता देवी थापा',
    email: 'mp.hor@parliament.np',
    role: 'MP',
    house: 'HOR',
    party: 'Nepal Democratic Party',
  },
  {
    id: 'user-mp-2',
    name: 'Bishnu Kumar KC',
    nameNe: 'बिष्णु कुमार केसी',
    email: 'mp.na@parliament.np',
    role: 'MP',
    house: 'NA',
    party: 'National Unity Party',
  },
  {
    id: 'user-committee-1',
    name: 'Krishna Bahadur Magar',
    nameNe: 'कृष्ण बहादुर मगर',
    email: 'committee@parliament.np',
    role: 'COMMITTEE_MEMBER',
    house: 'HOR',
  },
  {
    id: 'user-secretariat-1',
    name: 'Ganesh Prasad Timilsina',
    nameNe: 'गणेश प्रसाद तिमिल्सिना',
    email: 'secretariat@parliament.np',
    role: 'SECRETARIAT',
  },
  {
    id: 'user-speaker-1',
    name: 'Dev Raj Ghimire',
    nameNe: 'देव राज घिमिरे',
    email: 'speaker@parliament.np',
    role: 'SPEAKER',
  },
  {
    id: 'user-president-1',
    name: 'Ram Chandra Paudel',
    nameNe: 'राम चन्द्र पौडेल',
    email: 'president@rashtrapatibhawan.np',
    role: 'PRESIDENT',
  },
  {
    id: 'user-admin-1',
    name: 'Admin User',
    email: 'admin@parliament.np',
    role: 'ADMIN',
  },
];

// Session management (client-side for demo)
const SESSION_KEY = 'nepal-legislature-session';

export function setSession(user: SessionUser): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
}

export function getSession(): SessionUser | null {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(SESSION_KEY);
    if (data) {
      try {
        return JSON.parse(data) as SessionUser;
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function hasPermission(user: SessionUser | null, permission: string): boolean {
  if (!user) return false;

  const { ROLE_PERMISSIONS } = require('@/types');
  const permissions = ROLE_PERMISSIONS[user.role] || [];

  if (permissions.includes('*')) return true;
  return permissions.includes(permission);
}
