'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-primary)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏛</div>
          <div className="skeleton" style={{ width: 200, height: 20 }} />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
