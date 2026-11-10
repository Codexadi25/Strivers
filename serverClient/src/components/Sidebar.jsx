import React from 'react';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import GridViewIcon from '@mui/icons-material/GridView';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import TimelineIcon from '@mui/icons-material/Timeline';
import LogoutIcon from '@mui/icons-material/Logout';
import appLogo from '../assets/favicon.ico';
import './Sidebar.css';

const NAV_ITEMS = [
  { id: 'pricing', label: 'Pricing & Courses', icon: AttachMoneyIcon, badge: 'NEW', badgeType: 'badge-new' },
  { id: 'masterclasses', label: 'Masterclasses & Live Sessions', icon: VideocamOutlinedIcon, badge: 'LIVE', badgeType: 'badge-live' },
  { id: 'telemetry', label: 'System Telemetry', icon: GridViewIcon },
  { id: 'orders', label: 'Orders & Payments', icon: ShoppingCartOutlinedIcon },
  { id: 'lifeline', label: 'Lifeline Hub', icon: FlashOnIcon, badge: 'REACT', badgeType: 'badge-react' },
  { id: 'tickets', label: 'PG Failure & Tickets', icon: DescriptionOutlinedIcon, badge: 'DISPUTES', badgeType: 'badge-disputes' },
  { id: 'users', label: 'User Access Control', icon: PeopleOutlineIcon },
  { id: 'practice', label: 'Practice Sheets & Roles', icon: MenuBookOutlinedIcon, badge: 'NEW', badgeType: 'badge-new' },
  { id: 'refunds', label: 'Refunds Console', icon: RestoreOutlinedIcon },
  { id: 'audit', label: 'Audit & Security Logs', icon: TimelineIcon },
];

export default function Sidebar({ activeTab, onTabChange, user, onLogout }) {
  const adminEmail = user?.email || 'creedracer111@gmail.com';
  const initials = adminEmail.slice(0, 2).toUpperCase();

  return (
    <aside className="sc-sidebar">
      <div className="sc-sidebar-top">
        <div className="sc-brand">
          <div className="sc-brand-icon">
            <img src={appLogo} alt="Strivers logo" className="sc-brand-logo-img" />
          </div>
          <div>
            <h1 className="sc-brand-title">Strivers</h1>
            <span className="sc-brand-badge">SERVER GUI</span>
          </div>
        </div>

        <nav className="sc-nav" aria-label="ServerClient Sidebar">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`sc-nav-btn ${isActive ? 'active' : ''}`}
                fullWidth
                disableRipple={false}
              >
                <div className="sc-nav-label-group">
                  <Icon className="sc-nav-icon" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    className={`sc-nav-badge ${item.badgeType}`}
                  />
                )}
              </Button>
            );
          })}
        </nav>
      </div>

      <div className="sc-sidebar-footer">
        <div className="sc-profile-card">
          <Avatar className="sc-profile-avatar" sx={{ width: 34, height: 34, fontSize: '0.82rem', fontWeight: 800, bgcolor: '#2563EB' }}>
            {initials}
          </Avatar>
          <div className="sc-profile-info">
            <span className="sc-profile-email" title={adminEmail}>
              {adminEmail}
            </span>
            <div className="sc-profile-status">
              <span className="sc-status-dot dot-green" />
              <span>Live Root Admin</span>
            </div>
          </div>
        </div>

        <Button
          variant="outlined"
          color="error"
          fullWidth
          onClick={onLogout}
          startIcon={<LogoutIcon />}
          className="sc-btn-logout"
          title="Sign out of Admin Console"
        >
          Logout
        </Button>
      </div>
    </aside>
  );
}
