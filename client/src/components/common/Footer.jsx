import React from 'react';
import { Link } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedIcon from '@mui/icons-material/Verified';
import LockIcon from '@mui/icons-material/Lock';
import BoltIcon from '@mui/icons-material/Bolt';
import EmailIcon from '@mui/icons-material/Email';
import { BRAND } from '../../config/strivers';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-root">
      {/* TOP PROMISE / TRUST BANNER */}
      <div className="footer-trust-strip">
        <div className="footer-trust-container">
          <div className="footer-trust-lead">
            <BoltIcon style={{ fontSize: '1rem', color: '#FFB703' }} />
            <span>
              <strong>Practical, Mentor-Led Placement Acceleration:</strong> Learn from working professionals at Blinkit, Zomato, and Porter.
            </span>
          </div>
          <div className="footer-trust-badges">
            <span className="footer-trust-pill">
              <LockIcon style={{ fontSize: '0.95rem', color: '#10B981' }} />
              <span>Curated Study Guides & Notes</span>
            </span>
            <span className="footer-trust-pill">
              <VerifiedIcon style={{ fontSize: '0.95rem', color: '#38BDF8' }} />
              <span>Instant Enrollment & Access</span>
            </span>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER NAVIGATION GRID */}
      <div className="footer-main-container">
        <div className="footer-grid">
          {/* Brand & Mission Column */}
          <div className="footer-col-brand">
            <Link to="/" className="footer-brand-link">
              <img
                src="/favicon.ico"
                alt="Strivers logo"
                width="28"
                height="28"
                className="footer-brand-logo-img"
              />
              <span className="footer-brand-name">{BRAND.name}</span>
            </Link>

            <p className="footer-brand-bio">
              Direct, hands-on masterclasses designed to bridge the gap between college education and real tech hiring standards.
            </p>

            <div className="footer-support-box">
              <div className="footer-support-email">
                <EmailIcon style={{ fontSize: '0.95rem', color: '#38BDF8' }} />
                <span>contact@strivers.tech</span>
              </div>
              <div className="footer-support-sla">
                Support SLA: 10:00 AM – 8:00 PM IST
              </div>
            </div>
          </div>

          {/* Programs & Courses */}
          <div>
            <div className="footer-col-title">Programs & Catalog</div>
            <ul className="footer-nav-list">
              <li>
                <Link to="/courses" className="footer-nav-link">
                  All Courses & Tracks
                </Link>
              </li>
              <li>
                <Link to="/courses" className="footer-nav-link">
                  Strivers Masterclass (Live)
                </Link>
              </li>
              <li>
                <Link to="/courses" className="footer-nav-link">
                  Paid Job Channel & Links
                </Link>
              </li>
              <li>
                <Link to="/practice" className="footer-nav-link">
                  Placement Practice Sheet <span className="footer-badge-live">LIVE</span>
                </Link>
              </li>
              <li>
                <Link to="/courses" className="footer-nav-link">
                  Student Classroom & Vault
                </Link>
              </li>
            </ul>
          </div>

          {/* Student Hub & Resources */}
          <div>
            <div className="footer-col-title">Student Hub</div>
            <ul className="footer-nav-list">
              <li>
                <Link to="/practice" className="footer-nav-link">
                  Solve Practice Problems
                </Link>
              </li>
              <li>
                <Link to="/courses" className="footer-nav-link">
                  Study Notes & Cheatsheets
                </Link>
              </li>
              <li>
                <Link to="/login" className="footer-nav-link">
                  Student Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="footer-nav-link">
                  Create Member Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Policy */}
          <div className="footer-col-desktop-only">
            <div className="footer-col-title">Student Support</div>
            <ul className="footer-nav-list">
              <li>
                <Link to="/practice" className="footer-nav-link">
                  Billing & Refund Help
                </Link>
              </li>
              <li className="footer-info-item">
                5–7 Business Day Refund Policy
              </li>
              <li className="footer-info-item">
                Licensed In-App Reading Access
              </li>
              <li className="footer-info-item">
                Lifetime Classroom Re-entry
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT & LEGAL BAR */}
        <div className="footer-bottom-bar">
          <div>
            © {currentYear} {BRAND.name}. All rights reserved. Practical career mentorship for ambitious strivers.
          </div>

          <div className="footer-bottom-links">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <SecurityIcon style={{ fontSize: '0.9rem', color: '#10B981' }} />
              <span>Protected Student Privacy</span>
            </span>
            <span>•</span>
            <Link to="/" className="footer-bottom-link">
              Terms of Access
            </Link>
            <span>•</span>
            <Link to="/" className="footer-bottom-link">
              Refund Protocol
            </Link>
          </div>
        </div>

        {/* TRADEMARK DISCLAIMER */}
        <div className="footer-disclaimer">
          Disclaimer: Strivers is an independent mentorship and technical interview preparation platform. Company names, trademarks, and logos (e.g. Blinkit, Zomato, Google, Porter) referenced on the platform belong to their respective corporate entities and are used solely for candidate educational context.
        </div>
      </div>
    </footer>
  );
}
