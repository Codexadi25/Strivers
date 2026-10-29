import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Navbar from './Navbar';
import { SkeletonLoader } from './SkeletonLoader';

export const AdminGuard = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api
      .get('/auth/me')
      .then((res) => {
        if (isMounted) {
          const u = res.data.user;
          setUser(u);
          if (u && (u.role === 'admin' || u.isAdmin)) {
            setDenied(false);
          } else {
            setDenied(true);
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setDenied(true);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar user={user} />
        <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 20px', width: '100%' }}>
          <SkeletonLoader height="36px" width="40%" />
          <div style={{ marginTop: 24 }}>
            <SkeletonLoader height="140px" />
          </div>
        </div>
      </div>
    );
  }

  if (denied) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg)' }}>
        <Navbar user={user} />
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
          }}
        >
          <div
            style={{
              maxWidth: 480,
              width: '100%',
              backgroundColor: '#fff',
              border: '1px solid var(--line)',
              borderRadius: 16,
              padding: '40px 32px',
              textAlign: 'center',
              boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                marginBottom: 16,
              }}
            >
              🔒
            </div>
            <h2 style={{ margin: '0 0 10px', fontSize: '1.45rem', color: '#0E1B3D' }}>
              Admin Access Required
            </h2>
            <p className="muted" style={{ margin: '0 0 24px', fontSize: '0.95rem', lineHeight: 1.5 }}>
              This portal is restricted strictly to accounts with the administrator role. Your current account does not have admin permissions.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link className="btn btn-ghost" to="/">
                ← Return Home
              </Link>
              <Link className="btn btn-primary" to="/login">
                Sign In as Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminGuard;
