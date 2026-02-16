'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { DEMO_USERS } from '@/lib/auth';
import { ROLE_LABELS } from '@/types';
import styles from './login.module.css';

export default function LoginPage() {
  const [selectedUserId, setSelectedUserId] = useState(DEMO_USERS[0].id);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = () => {
    const user = DEMO_USERS.find(u => u.id === selectedUserId);
    if (user) {
      login(user);
      router.push('/dashboard');
    }
  };

  const selectedUser = DEMO_USERS.find(u => u.id === selectedUserId);

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginBackground}>
        <div className={styles.bgOrb1} />
        <div className={styles.bgOrb2} />
        <div className={styles.bgOrb3} />
      </div>

      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <div className={styles.logo}>🏛</div>
          <h1 className={styles.title}>संघीय संसद</h1>
          <p className={styles.subtitle}>Federal Parliament of Nepal</p>
          <p className={styles.description}>
            Legislative Management & AI Legal Intelligence System
          </p>
        </div>

        <div className={styles.loginForm}>
          <div className="form-group">
            <label className="form-label">Select Role to Continue</label>
            <select
              className="input"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              {DEMO_USERS.map((user) => (
                <option key={user.id} value={user.id}>
                  {ROLE_LABELS[user.role]} — {user.name}
                </option>
              ))}
            </select>
          </div>

          {selectedUser && (
            <div className={styles.userPreview}>
              <div className="avatar avatar-lg">
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <div className={styles.previewName}>{selectedUser.name}</div>
                {selectedUser.nameNe && (
                  <div className={styles.previewNameNe}>{selectedUser.nameNe}</div>
                )}
                <div className={styles.previewRole}>{ROLE_LABELS[selectedUser.role]}</div>
                {selectedUser.house && (
                  <div className={styles.previewHouse}>
                    {selectedUser.house === 'HOR' ? 'House of Representatives' : 'National Assembly'}
                  </div>
                )}
              </div>
            </div>
          )}

          <button className="btn btn-primary btn-lg w-full" onClick={handleLogin}>
            Sign In as {selectedUser?.name.split(' ')[0]}
          </button>

          <p className={styles.demoNote}>
            🔐 Demo mode — Select any role to explore the system
          </p>
        </div>
      </div>
    </div>
  );
}
