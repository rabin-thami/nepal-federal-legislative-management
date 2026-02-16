'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { ROLE_LABELS } from '@/types';
import styles from './Sidebar.module.css';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles?: string[];
}

const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: '📊' },
      { label: 'Bills', href: '/dashboard/bills', icon: '📜' },
    ],
  },
  {
    label: 'Legislative',
    items: [
      { label: 'Committees', href: '/dashboard/committees', icon: '🏛️' },
      { label: 'Voting', href: '/dashboard/voting', icon: '🗳️' },
      { label: 'Deadlines', href: '/dashboard/deadlines', icon: '⏰' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Secretariat', href: '/dashboard/secretariat', icon: '📋', roles: ['SECRETARIAT', 'ADMIN'] },
      { label: 'Presidential', href: '/dashboard/presidential', icon: '🏢', roles: ['PRESIDENT', 'ADMIN'] },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'AI Analysis', href: '/dashboard/ai', icon: '🤖' },
      { label: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">🏛</div>
        <div className="sidebar-brand">
          संसद
          <small>Federal Parliament</small>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_SECTIONS.map((section) => {
          const visibleItems = section.items.filter(item => {
            if (!item.roles) return true;
            return user && item.roles.includes(user.role);
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.label}>
              <div className="sidebar-section">{section.label}</div>
              {visibleItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                >
                  <span className="nav-item-icon">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          );
        })}
      </nav>

      {user && (
        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className="avatar avatar-sm">
              {user.name.charAt(0)}
            </div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userRole}>{ROLE_LABELS[user.role]}</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
