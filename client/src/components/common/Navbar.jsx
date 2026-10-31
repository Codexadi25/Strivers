import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import api from '../../utils/api';
import { BRAND } from '../../config/strivers';

export const Navbar = ({ user: initialUser }) => {
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleSignOut = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setCurrentUser(null);
    setMobileOpen(false);
    window.location.href = '/';
  };

  return (
    <header className="nav" style={{ width: '100%', boxSizing: 'border-box' }}>
      <Link className="brand" to="/" aria-label="Strivers home" onClick={() => setMobileOpen(false)}>
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
        <span>{BRAND.name}</span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="desktop-nav">
        {isHome ? (
          <a href="#courses">Courses</a>
        ) : (
          <Link to="/">Home</Link>
        )}
        <Link
          to="/practice"
          style={{
            fontWeight: 600,
            color: '#2563EB',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>Practice Sheet</span>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              background: '#DCFCE7',
              color: '#15803D',
              padding: '2px 7px',
              borderRadius: 99,
            }}
          >
            LIVE
          </span>
        </Link>

        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link className="btn btn-ghost" to="/products">
              My Access
            </Link>
            <button
              onClick={handleSignOut}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--muted, #64748B)',
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

      {/* Mobile Hamburger Toggle Button */}
      <div className="mobile-menu-trigger">
        <IconButton
          color="inherit"
          aria-label="open navigation drawer"
          edge="end"
          onClick={handleDrawerToggle}
          sx={{
            color: '#0E1B3D',
            padding: '8px',
            '&:focus': { outline: 'none' },
          }}
        >
          <MenuIcon sx={{ fontSize: 28 }} />
        </IconButton>
      </div>

      {/* Mobile Material UI Slide-out Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: 'min(82vw, 320px)',
            background: '#FFFFFF',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
          },
        }}
      >
        <div style={{ padding: '20px 18px' }}>
          {/* Drawer Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '16px',
              borderBottom: '1px solid #E2E8F0',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 64 64" aria-hidden="true">
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
              <strong style={{ fontSize: '1.15rem', color: '#0E1B3D', fontFamily: 'var(--display)' }}>
                {BRAND.name}
              </strong>
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

          {/* User Status Strip in Drawer */}
          {currentUser && (
            <div
              style={{
                background: '#F1F5F9',
                borderRadius: '8px',
                padding: '10px 12px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AccountCircleIcon sx={{ color: '#2563EB', fontSize: 24 }} />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {currentUser.name || 'Member'}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748B', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {currentUser.email}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '8px',
                color: '#0F172A',
                fontWeight: 600,
                textDecoration: 'none',
                background: location.pathname === '/' ? '#EFF6FF' : 'transparent',
              }}
            >
              <HomeIcon sx={{ color: location.pathname === '/' ? '#2563EB' : '#64748B', fontSize: 22 }} />
              <span>Home</span>
            </Link>

            {isHome ? (
              <a
                href="#courses"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  color: '#0F172A',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <SchoolIcon sx={{ color: '#64748B', fontSize: 22 }} />
                <span>Courses Catalog</span>
              </a>
            ) : (
              <Link
                to="/#courses"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  color: '#0F172A',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <SchoolIcon sx={{ color: '#64748B', fontSize: 22 }} />
                <span>Courses Catalog</span>
              </Link>
            )}

            <Link
              to="/practice"
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '8px',
                color: '#2563EB',
                fontWeight: 700,
                textDecoration: 'none',
                background: location.pathname.startsWith('/practice') ? '#EFF6FF' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CodeIcon sx={{ color: '#2563EB', fontSize: 22 }} />
                <span>Practice Sheet</span>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  background: '#DCFCE7',
                  color: '#15803D',
                  padding: '2px 8px',
                  borderRadius: 99,
                }}
              >
                LIVE
              </span>
            </Link>

            {currentUser && (
              <Link
                to="/products"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  color: '#0F172A',
                  fontWeight: 600,
                  textDecoration: 'none',
                  background: location.pathname === '/products' ? '#EFF6FF' : 'transparent',
                }}
              >
                <SchoolIcon sx={{ color: '#2563EB', fontSize: 22 }} />
                <span>My Access & Classroom</span>
              </Link>
            )}
          </div>
        </div>

        {/* Drawer Bottom Actions */}
        <div style={{ padding: '18px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          {currentUser ? (
            <button
              onClick={handleSignOut}
              className="btn btn-block"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#FEE2E2',
                color: '#DC2626',
                border: '1px solid #FECACA',
                fontWeight: 700,
                fontSize: '0.95rem',
                padding: '10px',
                cursor: 'pointer',
                borderRadius: '8px',
              }}
            >
              <LogoutIcon sx={{ fontSize: 18 }} />
              <span>Sign Out</span>
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="btn btn-primary btn-block"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                textDecoration: 'none',
                fontWeight: 700,
                padding: '11px',
                borderRadius: '8px',
              }}
            >
              <LoginIcon sx={{ fontSize: 18 }} />
              <span>Login to Strivers</span>
            </Link>
          )}
        </div>
      </Drawer>
    </header>
  );
};

export default Navbar;
