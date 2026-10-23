import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { BRAND } from '../../config/strivers';

export const Navbar = ({ user: initialUser }) => {
  const [currentUser, setCurrentUser] = useState(initialUser);
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '/masterclass';

  useEffect(() => {
    if (initialUser !== undefined) {
      setCurrentUser(initialUser);
      return;
    }
    let isMounted = true;
    api
      .get('/auth/me')
      .then((res) => {
        if (isMounted) setCurrentUser(res.data.user);
      })
      .catch(() => {
        if (isMounted) setCurrentUser(null);
      });

    return () => {
      isMounted = false;
    };
  }, [initialUser]);

  return (
    <header className="nav">
      <Link className="brand" to="/" aria-label="Strivers home">
        <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
          <rect width="64" height="64" rx="14" fill="#0E1B3D" />
          <path
            d="M20 44l12-24 12 24"
            fill="none"
            stroke="#FFB703"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {BRAND.name}
      </Link>

      <nav>
        {isHome ? (
          <>
            <a href="#courses">Courses</a>
          </>
        ) : (
          <>
            <Link to="/">Home</Link>
          </>
        )}
        <Link to="/practice" style={{ fontWeight: 600, color: '#2563EB', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span>Practice Sheet</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#DCFCE7', color: '#15803D', padding: '2px 7px', borderRadius: 99 }}>
            LIVE
          </span>
        </Link>
        
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link className="btn btn-ghost" to="/products">
              My Access
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                setCurrentUser(null);
                window.location.href = '/';
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--muted)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                padding: '6px 8px',
              }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link className="btn btn-ghost" to="/login">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
