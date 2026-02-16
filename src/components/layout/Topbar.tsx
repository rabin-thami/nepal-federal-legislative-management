'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { DEMO_USERS } from '@/lib/auth';
import { ROLE_LABELS } from '@/types';
import styles from './Topbar.module.css';

export default function Topbar() {
  const { user, switchRole, logout } = useAuth();

  return (
    <header className="topbar">
      <div className={styles.left}>
        <h1 className={styles.greeting}>
          {user ? `Welcome, ${user.name.split(' ')[0]}` : 'Federal Parliament'}
        </h1>
      </div>

      <div className={styles.right}>
        {/* Role Switcher (demo only) */}
        <div className={styles.roleSwitcher}>
          <label className={styles.switchLabel}>Role:</label>
          <select
            className={`input ${styles.roleSelect}`}
            value={user?.id || ''}
            onChange={(e) => switchRole(e.target.value)}
          >
            {DEMO_USERS.map((u) => (
              <option key={u.id} value={u.id}>
                {ROLE_LABELS[u.role]} — {u.name}
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn-ghost btn-sm" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
