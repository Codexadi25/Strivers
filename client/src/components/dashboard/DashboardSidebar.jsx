import React from 'react';
import { Link } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BarChartIcon from '@mui/icons-material/BarChart';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

export default function DashboardSidebar({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  activeTab,
  setActiveTab,
  practiceViewMode,
  setPracticeViewMode,
  userEnrolledSheets = [],
  practiceSheets = [],
  streakData,
  onOpenStreakModal,
}) {
  return (
    <aside className={`dashboard-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isSidebarCollapsed && (
          <Link to="/" className="sidebar-logo">
            <img
              src="/favicon.ico"
              alt="Strivers logo"
              width="26"
              height="26"
              style={{ borderRadius: 6, objectFit: 'contain', display: 'block' }}
            />
            <span>Strivers</span>
          </Link>
        )}
        <button
          className="sidebar-collapse-btn"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isSidebarCollapsed ? '›' : '‹'}
        </button>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item-btn ${activeTab === 'dsa' ? 'active' : ''}`}
          onClick={() => setActiveTab('dsa')}
          title="Sheets & Practice Problems"
        >
          <AssignmentIcon fontSize="small" />
          {!isSidebarCollapsed && <span>Sheets</span>}
        </button>

        {!isSidebarCollapsed && activeTab === 'dsa' && (
          <div className="sidebar-subnav">
            <button
              className={`subnav-btn ${practiceViewMode === 'my' ? 'active' : ''}`}
              onClick={() => setPracticeViewMode('my')}
            >
              My Practice Sheets ({userEnrolledSheets.length})
            </button>
            <button
              className={`subnav-btn ${practiceViewMode === 'all' ? 'active' : ''}`}
              onClick={() => setPracticeViewMode('all')}
            >
              All Practice Sheets ({practiceSheets.length})
            </button>
          </div>
        )}

        <button
          className={`nav-item-btn ${activeTab === 'mentorship' ? 'active' : ''}`}
          onClick={() => setActiveTab('mentorship')}
          title="Live Mentorship & Masterclasses"
        >
          <LiveTvIcon fontSize="small" />
          {!isSidebarCollapsed && (
            <>
              <span>Live Mentorship</span>
              <span className="nav-item-badge">LIVE</span>
            </>
          )}
        </button>

        <button
          className={`nav-item-btn ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
          title="Downloadable Notes & Cheatsheets"
        >
          <MenuBookIcon fontSize="small" />
          {!isSidebarCollapsed && <span>Downloadable Notes</span>}
        </button>

        <button
          className={`nav-item-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
          title="Profile & Consistency Analytics"
        >
          <BarChartIcon fontSize="small" />
          {!isSidebarCollapsed && <span>Profile & Stats</span>}
        </button>
      </nav>

      {!isSidebarCollapsed && (
        <div className="sidebar-footer">
          <div className="streak-card-mini" onClick={onOpenStreakModal}>
            <LocalFireDepartmentIcon sx={{ fontSize: 24, color: '#D97706' }} />
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400E' }}>
                {streakData.currentStreak}{streakData.streakSuffix} Day Streak
              </div>
              <div style={{ fontSize: '0.75rem', color: '#B45309' }}>
                {streakData.totalActiveDays} days active · Click for details
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
