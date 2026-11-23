import React from 'react';
import { Link } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BarChartIcon from '@mui/icons-material/BarChart';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

export default function DashboardHeader({
  activeTab,
  setActiveTab,
  practiceViewMode,
  setPracticeViewMode,
  searchQuery,
  setSearchQuery,
  mobileDrawerOpen,
  setMobileDrawerOpen,
  userProfile,
  userAuthData,
  streakData,
  userEnrolledSheets = [],
  practiceSheets = [],
  onOpenStreakModal,
}) {
  const userName =
    userProfile?.name ||
    userAuthData?.name ||
    userAuthData?.email?.split('@')[0] ||
    'Student';

  const userInitials = (
    (userName || 'ST')
      .split(' ')
      .map((n) => n[0])
      .join('') || 'ST'
  )
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Top Header Bar */}
      <header className="dashboard-topbar">
        <div className="mobile-nav-toggle-wrap">
          <IconButton
            size="medium"
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="open dashboard menu"
            sx={{ color: '#0E1B3D', padding: '6px' }}
          >
            <MenuIcon />
          </IconButton>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              textDecoration: 'none',
              marginLeft: 4,
            }}
          >
            <img
              src="/favicon.ico"
              alt="Strivers logo"
              width="24"
              height="24"
              style={{ borderRadius: 6, objectFit: 'contain', display: 'block' }}
            />
            <span
              style={{
                fontWeight: 800,
                fontSize: '1.05rem',
                color: '#0E1B3D',
                fontFamily: 'var(--display)',
              }}
            >
              Strivers
            </span>
          </Link>
        </div>

        <div className="topbar-search">
          <SearchIcon sx={{ fontSize: 18, color: '#64748B' }} />
          <input
            type="text"
            placeholder={
              activeTab === 'notes'
                ? 'Search study notes, cheatsheets...'
                : 'Search topics, problems, companies...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="topbar-actions">
          <button className="streak-pill-btn" onClick={onOpenStreakModal}>
            <LocalFireDepartmentIcon sx={{ fontSize: 16, color: '#D97706' }} />
            <span>
              {streakData.currentStreak}
              {streakData.streakSuffix} day streak
            </span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div className="user-profile-badge">
              <div className="user-avatar-circle">{userInitials}</div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0F172A' }}>
                {userName}
              </span>
            </div>
          </button>

          <Link
            className="btn btn-ghost pd-mobile-hide"
            to="/"
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
          >
            Home
          </Link>
        </div>
      </header>

      {/* Mobile Persistent Horizontal Tab Strip using Material UI Tabs */}
      <div className="mobile-dashboard-tabs-bar">
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: 40,
            width: '100%',
            '& .MuiTabs-indicator': {
              backgroundColor: '#2563EB',
              height: 2.5,
              borderRadius: '2px 2px 0 0',
            },
            '& .MuiTabs-flexContainer': { gap: '4px' },
            '& .MuiTab-root': {
              minHeight: 40,
              minWidth: 'auto',
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'none',
              color: '#64748B',
              borderRadius: '6px 6px 0 0',
              whiteSpace: 'nowrap',
              '&.Mui-selected': {
                color: '#2563EB',
                background: 'rgba(37, 99, 235, 0.06)',
              },
            },
          }}
        >
          <Tab
            value="dsa"
            icon={<AssignmentIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="Sheets"
          />
          <Tab
            value="mentorship"
            icon={<LiveTvIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="Mentorship"
          />
          <Tab
            value="notes"
            icon={<MenuBookIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="Notes"
          />
          <Tab
            value="analytics"
            icon={<BarChartIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="Stats"
          />
        </Tabs>
      </div>

      {/* Mobile Material UI Sidebar Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          paper: {
            sx: {
              width: 'min(82vw, 300px)',
              background: '#FFFFFF',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
            },
          },
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 20px',
              borderBottom: '1px solid #E2E8F0',
            }}
          >
            <Link
              to="/"
              className="sidebar-logo"
              onClick={() => setMobileDrawerOpen(false)}
            >
              <img
                src="/favicon.ico"
                alt="Strivers logo"
                width="26"
                height="26"
                style={{ borderRadius: 6, objectFit: 'contain', display: 'block' }}
              />
              <span>Strivers</span>
            </Link>

            <IconButton
              size="small"
              onClick={() => setMobileDrawerOpen(false)}
              aria-label="close navigation drawer"
              sx={{ color: '#64748B' }}
            >
              <CloseIcon />
            </IconButton>
          </div>

          <nav
            style={{
              padding: '16px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <button
              className={`nav-item-btn ${activeTab === 'dsa' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('dsa');
                setMobileDrawerOpen(false);
              }}
              style={{ width: '100%' }}
            >
              <AssignmentIcon fontSize="small" />
              <span>Sheets &amp; Tracks</span>
            </button>

            {activeTab === 'dsa' && (
              <div
                style={{
                  paddingLeft: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <button
                  className={`subnav-btn ${practiceViewMode === 'my' ? 'active' : ''}`}
                  onClick={() => {
                    setPracticeViewMode('my');
                    setMobileDrawerOpen(false);
                  }}
                >
                  My Practice Sheets ({userEnrolledSheets.length})
                </button>
                <button
                  className={`subnav-btn ${practiceViewMode === 'all' ? 'active' : ''}`}
                  onClick={() => {
                    setPracticeViewMode('all');
                    setMobileDrawerOpen(false);
                  }}
                >
                  All Practice Sheets ({practiceSheets.length})
                </button>
              </div>
            )}

            <button
              className={`nav-item-btn ${activeTab === 'mentorship' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('mentorship');
                setMobileDrawerOpen(false);
              }}
              style={{ width: '100%' }}
            >
              <LiveTvIcon fontSize="small" />
              <span style={{ flex: 1, textAlign: 'left' }}>Live Mentorship</span>
              <span className="nav-item-badge">LIVE</span>
            </button>

            <button
              className={`nav-item-btn ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('notes');
                setMobileDrawerOpen(false);
              }}
              style={{ width: '100%' }}
            >
              <MenuBookIcon fontSize="small" />
              <span>Downloadable Notes</span>
            </button>

            <button
              className={`nav-item-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('analytics');
                setMobileDrawerOpen(false);
              }}
              style={{ width: '100%' }}
            >
              <BarChartIcon fontSize="small" />
              <span>Profile &amp; Stats</span>
            </button>
          </nav>
        </div>

        <div
          style={{
            padding: '16px',
            borderTop: '1px solid #E2E8F0',
            background: '#F8FAFC',
          }}
        >
          <div
            className="streak-card-mini"
            onClick={() => {
              onOpenStreakModal();
              setMobileDrawerOpen(false);
            }}
            style={{ cursor: 'pointer' }}
          >
            <LocalFireDepartmentIcon sx={{ fontSize: 24, color: '#D97706' }} />
            <div>
              <div
                style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400E' }}
              >
                {streakData.currentStreak}
                {streakData.streakSuffix} Day Streak
              </div>
              <div style={{ fontSize: '0.75rem', color: '#B45309' }}>
                {streakData.totalActiveDays} days active · Tap for details
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <Link
              to="/"
              onClick={() => setMobileDrawerOpen(false)}
              className="btn btn-ghost btn-block"
              style={{ fontSize: '0.82rem', padding: '8px' }}
            >
              Home
            </Link>
            <Link
              to="/courses"
              onClick={() => setMobileDrawerOpen(false)}
              className="btn btn-primary btn-block"
              style={{ fontSize: '0.82rem', padding: '8px' }}
            >
              My Access
            </Link>
          </div>
        </div>
      </Drawer>
    </>
  );
}
