import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import CodeIcon from '@mui/icons-material/Code';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import api from '../../utils/api';
import { auth } from '../../services/firebase';
import { BRAND } from '../../config/strivers';
import './Header.css';

const getInitialUser = (initialUser) => {
  if (initialUser !== undefined) return initialUser;
  if (typeof window === 'undefined') return null;
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function Header({ user: initialUser }) {
  const [currentUser, setCurrentUser] = useState(() => getInitialUser(initialUser));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialUser !== undefined) {
      setCurrentUser(initialUser);
    }
  }, [initialUser]);

  useEffect(() => {
    let isMounted = true;

    const syncUser = () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        if (isMounted) setCurrentUser(null);
        return;
      }

      api
        .get('/auth/me')
        .then((res) => {
          if (isMounted && res.data?.success && res.data?.user) {
            setCurrentUser(res.data.user);
            localStorage.setItem('auth_user', JSON.stringify(res.data.user));
          }
        })
        .catch((err) => {
          if (err.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            if (isMounted) setCurrentUser(null);
          }
        });
    };

    syncUser();

    // Listen to login/logout events across all components and browser tabs
    const handleAuthEvent = () => {
      const raw = localStorage.getItem('auth_user');
      if (raw) {
        try {
          setCurrentUser(JSON.parse(raw));
        } catch (_) {}
      } else {
        setCurrentUser(null);
      }
      syncUser();
    };

    window.addEventListener('auth_state_change', handleAuthEvent);
    window.addEventListener('storage', handleAuthEvent);

    return () => {
      isMounted = false;
      window.removeEventListener('auth_state_change', handleAuthEvent);
      window.removeEventListener('storage', handleAuthEvent);
    };
  }, [initialUser]);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleSignOut = async () => {
    try {
      // 1. Sign out of Firebase if initialized
      if (auth && typeof auth.signOut === 'function') {
        await auth.signOut().catch(() => {});
      }
      // 2. Notify backend to invalidate any active session
      await api.post('/auth/logout').catch(() => {});
    } catch (_) {}

    // 3. Clear all stored auth keys
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('strivers_token');
    localStorage.removeItem('strivers_user');
    sessionStorage.clear();

    setCurrentUser(null);
    setMobileOpen(false);

    // 4. Notify app listeners & route cleanly to login
    window.dispatchEvent(new Event('auth_state_change'));
    navigate('/login?logged_out=1');
  };

  const isCurrent = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="header-root">
      <div className="header-container">
        {/* BRAND LOGO */}
        <Link
          to="/"
          aria-label="Strivers Home"
          onClick={() => setMobileOpen(false)}
          className="header-brand"
        >
          <img
            src="/favicon.ico"
            alt="Strivers logo"
            width="32"
            height="32"
            className="header-brand-logo-img"
          />
          <div className="header-brand-text">
            <span className="header-brand-title">{BRAND.name}</span>
            <span className="header-brand-subtitle">Career Accelerator</span>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="header-desktop-nav">
          <Link
            to="/"
            className={`header-nav-link ${isCurrent('/') ? 'active' : ''}`}
          >
            Home
          </Link>

          <Link
            to="/courses"
            className={`header-nav-link ${isCurrent('/courses') ? 'active' : ''}`}
          >
            Courses
          </Link>

          <Link
            to="/practice"
            className={`header-nav-link ${isCurrent('/practice') ? 'active' : ''}`}
          >
            <span>Practice Sheet</span>
            <span className="header-badge-live">LIVE</span>
          </Link>

          {currentUser && (
            <Link
              to="/courses?tab=my-access"
              className={`header-nav-link ${isCurrent('/courses') ? 'active' : ''}`}
            >
              My Access
            </Link>
          )}
        </nav>

        {/* DESKTOP AUTH / ACTIONS */}
        <div className="header-desktop-actions">
          {currentUser ? (
            <div className="header-auth-controls">
              <div className="header-user-pill">
                <PersonOutlineIcon style={{ fontSize: '1rem', color: '#2563EB' }} />
                <span className="header-user-name">
                  {currentUser.name || currentUser.email}
                </span>
              </div>

              <Link to="/courses" className="btn btn-secondary btn-sm header-btn-classroom">
                Classroom
              </Link>

              <button onClick={handleSignOut} className="header-btn-signout">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="header-auth-controls">
              <Link to="/login" className="header-btn-login">
                Log In
              </Link>
              <Link to="/courses" className="header-btn-explore">
                Explore Courses →
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE MENU TOGGLE BUTTON */}
        <div className="header-mobile-trigger">
          <IconButton
            color="inherit"
            aria-label="open mobile navigation"
            edge="end"
            onClick={handleDrawerToggle}
            sx={{
              color: '#0E1B3D',
              padding: '6px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              '&:focus': { outline: 'none' },
            }}
          >
            <MenuIcon sx={{ fontSize: 24 }} />
          </IconButton>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          paper: {
            className: 'header-drawer-paper',
          },
        }}
      >
        <div className="drawer-content">
          {/* Drawer Header */}
          <div className="drawer-header">
            <div className="drawer-brand-logo">
              <img
                src="/favicon.ico"
                alt="Strivers logo"
                width="24"
                height="24"
                className="drawer-brand-logo-img"
              />
              <strong className="drawer-brand-name">{BRAND.name}</strong>
            </div>

            <IconButton
              size="small"
              onClick={handleDrawerToggle}
              aria-label="close menu"
              sx={{ color: '#64748B' }}
            >
              <CloseIcon />
            </IconButton>
          </div>

          {/* User Status Strip in Mobile Drawer */}
          {currentUser && (
            <div className="drawer-user-strip">
              <AccountCircleIcon sx={{ color: '#2563EB', fontSize: 24 }} />
              <div className="drawer-user-text-wrap">
                <div className="drawer-user-name">
                  {currentUser.name || 'Member'}
                </div>
                <div className="drawer-user-email">
                  {currentUser.email}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links in Mobile Drawer */}
          <div className="drawer-nav-list">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className={`drawer-nav-item ${isCurrent('/') ? 'active' : ''}`}
            >
              <HomeIcon sx={{ color: isCurrent('/') ? '#2563EB' : '#64748B', fontSize: 22 }} />
              <span>Home</span>
            </Link>

            <Link
              to="/courses"
              onClick={() => setMobileOpen(false)}
              className={`drawer-nav-item ${isCurrent('/courses') ? 'active' : ''}`}
            >
              <SchoolIcon sx={{ color: isCurrent('/courses') ? '#2563EB' : '#64748B', fontSize: 22 }} />
              <span>Courses Catalog</span>
            </Link>

            <Link
              to="/practice"
              onClick={() => setMobileOpen(false)}
              className={`drawer-nav-item drawer-nav-split ${isCurrent('/practice') ? 'active' : ''}`}
            >
              <div className="drawer-nav-item-label">
                <CodeIcon sx={{ color: '#2563EB', fontSize: 22 }} />
                <span>Practice Sheet</span>
              </div>
              <span className="header-badge-live">LIVE</span>
            </Link>

            {currentUser && (
              <Link
                to="/courses?tab=my-access"
                onClick={() => setMobileOpen(false)}
                className={`drawer-nav-item ${isCurrent('/courses') ? 'active' : ''}`}
              >
                <SchoolIcon sx={{ color: '#2563EB', fontSize: 22 }} />
                <span>My Access & Classroom</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Drawer Bottom Actions */}
        <div className="drawer-footer-actions">
          {currentUser ? (
            <button onClick={handleSignOut} className="drawer-btn-signout">
              <LogoutIcon sx={{ fontSize: 18 }} />
              <span>Sign Out</span>
            </button>
          ) : (
            <div className="drawer-guest-actions">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="drawer-btn-login"
              >
                <LoginIcon sx={{ fontSize: 18 }} />
                <span>Log In</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="drawer-btn-register"
              >
                <span>Create Account</span>
              </Link>
            </div>
          )}
        </div>
      </Drawer>
    </header>
  );
}

export default Header;
