const { React } = require('../engine/reactEngine');

const h = React ? React.createElement : (tag, props, ...children) => ({ tag, props, children });

/**
 * Strivers Dedicated Lifeline Template (React.js Server View Engine)
 * Requirements Implemented:
 * 1. Top Search Bar: Search by Order ID, Email ID, Phone no, Txn ID, Ref ID.
 * 2. Click-to-Copy: Any ID (Order ID, Customer ID, Txn ID, Ref ID, Course ID) clicked is copied to clipboard.
 * 3. Transaction History Ledger: Removed from the main inline column and moved to a dedicated modal popup opened via the Transactions button/tab.
 * 4. Diagnostics: Explains where and why payment was canceled or failed (User Canceled, Gateway Failure, Network Issues, Bank Failure, Server Failure).
 */
function LifelineTemplate(props) {
  const initialQuery = props.initialQuery || { type: 'orderId', q: '' };
  const user = props.user || {
    name: 'Aditya Sahu',
    email: 'creedracer111@gmail.com',
    watermark: 'creedracer111@gmail.com | VERIFIED CANDIDATE',
  };

  return h('html', { lang: 'en' },
    h('head', null,
      h('meta', { charSet: 'UTF-8' }),
      h('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }),
      h('title', null, 'Strivers Lifeline & Order Investigation Hub'),
      h('link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }),
      h('link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' }),
      h('link', {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap',
      }),
      h('style', null, `
        :root {
          --bg-page: #F8FAFC;
          --bg-card: #FFFFFF;
          --border: #E2E8F0;
          --border-sub: #CBD5E1;
          --text-main: #0F172A;
          --text-muted: #64748B;
          --navy: #0E1B3D;
          --primary-blue: #2563EB;
          --accent-green: #388E3C;
          --accent-green-hover: #2E7D32;
          --green-pill-bg: #E8F5E9;
          --green-pill-text: #2E7D32;
          --blue-pill-bg: #EFF6FF;
          --blue-pill-text: #2563EB;
          --teal-pill-bg: #E6FFFA;
          --teal-pill-text: #0D9488;
          --red-pill-bg: #FEE2E2;
          --red-pill-text: #DC2626;
          --orange-pill-bg: #FEF3C7;
          --orange-pill-text: #D97706;
          --font-main: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
          --font-mono: 'IBM Plex Mono', monospace;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background-color: var(--bg-page);
          color: var(--text-main);
          font-family: var(--font-main);
          line-height: 1.5;
          min-height: 100vh;
        }

        /* Top Navigation Header (Exact Strivers Style) */
        .top-navbar {
          background: #FFFFFF;
          border-bottom: 1px solid var(--border);
          padding: 12px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .nav-logo-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }
        .nav-logo-badge {
          background: var(--navy);
          color: #FFF;
          font-weight: 800;
          padding: 5px 10px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.92rem;
        }
        .nav-title {
          font-size: 1.12rem;
          font-weight: 800;
          color: var(--navy);
          letter-spacing: -0.02em;
        }
        .nav-right-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .nav-pill-btn {
          background: #FFFFFF;
          border: 1px solid var(--border);
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #334155;
          text-decoration: none;
          transition: all 0.15s;
        }
        .nav-pill-btn:hover {
          background: #F1F5F9;
          color: var(--text-main);
        }

        /* Container Layout */
        .lifeline-layout-wrap {
          max-width: 1360px;
          margin: 22px auto 80px;
          padding: 0 20px;
        }

        /* Top Searchbar (media_1793284908060_4a6a7f99.png) */
        .top-search-card {
          background: #FFFFFF;
          border: 1px solid var(--border);
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          display: flex;
          align-items: stretch;
          overflow: hidden;
          height: 48px;
          margin-bottom: 24px;
        }
        .search-select-wrap {
          position: relative;
          display: flex;
          align-items: center;
          padding: 0 16px;
          background: #FFFFFF;
          cursor: pointer;
        }
        .search-type-select {
          appearance: none;
          -webkit-appearance: none;
          border: none;
          background: transparent;
          font-size: 0.95rem;
          font-weight: 500;
          color: #1E293B;
          font-family: inherit;
          cursor: pointer;
          outline: none;
          padding-right: 20px;
        }
        .select-caret {
          position: absolute;
          right: 14px;
          pointer-events: none;
          color: #94A3B8;
          font-size: 0.72rem;
        }
        .search-divider {
          width: 1px;
          background: #E2E8F0;
          margin: 8px 0;
        }
        .search-input-box {
          flex: 1;
          border: none;
          outline: none;
          padding: 0 18px;
          font-size: 0.98rem;
          color: #0F172A;
          font-family: inherit;
          background: transparent;
        }
        .search-input-box::placeholder {
          color: #94A3B8;
        }
        .search-submit-btn {
          background: var(--accent-green);
          border: none;
          color: #FFFFFF;
          width: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s;
        }
        .search-submit-btn:hover {
          background: var(--accent-green-hover);
        }
        .search-submit-btn svg {
          width: 20px;
          height: 20px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2.2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* 2-Column Split Grid */
        .lifeline-split-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 390px;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .lifeline-split-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Clickable Copyable IDs Style */
        .copyable-id {
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 6px;
          border-radius: 6px;
          transition: background 0.15s, color 0.15s;
          user-select: all;
        }
        .copyable-id:hover {
          background: #EFF6FF;
          color: #2563EB;
        }
        .copyable-id .copy-icon {
          font-size: 0.76rem;
          color: #94A3B8;
        }
        .copyable-id:hover .copy-icon {
          color: #2563EB;
        }

        /* Right Panel: Exact Card matching media_1793284863595_e35360ae.png */
        .right-sidebar-sticky {
          position: sticky;
          top: 86px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .order-summary-card {
          background: #FFFFFF;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px 22px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          font-size: 0.9rem;
        }

        .order-top-header {
          margin-bottom: 12px;
        }
        .order-id-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.98rem;
          font-weight: 700;
          color: #0F172A;
        }
        .info-circle-icon {
          color: #64748B;
          font-size: 0.95rem;
          cursor: pointer;
        }
        .order-date-text {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-top: 2px;
          margin-left: 20px;
        }

        /* Tabs (Comments | Transactions) */
        .order-tabs-row {
          display: flex;
          align-items: center;
          gap: 24px;
          border-bottom: 1px solid #F1F5F9;
          margin-top: 14px;
          margin-bottom: 14px;
        }
        .order-tab-btn {
          background: transparent;
          border: none;
          font-size: 0.88rem;
          font-weight: 600;
          color: #64748B;
          padding: 8px 0;
          cursor: pointer;
          position: relative;
          transition: color 0.15s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .order-tab-btn.active {
          color: #0F172A;
          font-weight: 700;
        }
        .order-tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: #0F172A;
        }

        /* Order Tags row */
        .order-tags-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .order-tags-label {
          font-size: 0.88rem;
          font-weight: 600;
          color: #1E293B;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .btn-add-tags {
          background: #FFFFFF;
          border: 1px solid #60A5FA;
          color: #2563EB;
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-add-tags:hover {
          background: #EFF6FF;
        }
        .tag-pill {
          background: #F1F5F9;
          border: 1px solid var(--border);
          color: #334155;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 0.76rem;
          font-weight: 600;
        }

        /* Customer Card Box */
        .customer-card-box {
          border: 1px solid #F1F5F9;
          border-radius: 8px;
          padding: 14px 16px;
          background: #FAFAFA;
          margin-bottom: 16px;
        }
        .cust-header-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.88rem;
          color: #475569;
          margin-bottom: 6px;
        }
        .cust-crown-icon {
          color: #EAB308;
          font-size: 0.9rem;
        }
        .cust-name-row {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .cust-contact-line {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.84rem;
          color: #475569;
          margin-bottom: 4px;
          font-family: var(--font-mono);
        }
        .contact-action-icon {
          background: transparent;
          border: none;
          cursor: pointer;
          color: #94A3B8;
          font-size: 0.85rem;
          padding: 1px 3px;
        }
        .contact-action-icon:hover {
          color: #2563EB;
        }

        /* Payment Box (media_1793284863595_e35360ae.png) */
        .payment-card-box {
          border-top: 1px solid #F1F5F9;
          padding-top: 14px;
          margin-top: 4px;
        }
        .payment-head-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .payment-label {
          font-size: 0.92rem;
          font-weight: 500;
          color: #475569;
        }
        .badge-payment-status {
          font-size: 0.78rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 6px;
        }
        .badge-success { background: var(--blue-pill-bg); color: var(--blue-pill-text); }
        .badge-canceled { background: var(--red-pill-bg); color: var(--red-pill-text); }
        .badge-failed { background: var(--red-pill-bg); color: var(--red-pill-text); }
        .badge-refunded { background: var(--orange-pill-bg); color: var(--orange-pill-text); }
        .badge-other { background: #F1F5F9; color: #475569; }

        /* Payment Diagnostics Box */
        .diag-box {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 8px;
          padding: 10px 12px;
          margin-top: 12px;
          font-size: 0.8rem;
          color: #991B1B;
          line-height: 1.45;
        }
        .diag-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 4px;
          margin-bottom: 4px;
        }
        .diag-pill-user { background: #FEF3C7; color: #92400E; }
        .diag-pill-gateway { background: #FEE2E2; color: #DC2626; }
        .diag-pill-bank { background: #E0E7FF; color: #3730A3; }
        .diag-pill-server { background: #EDE9FE; color: #5B21B6; }
        .diag-pill-network { background: #FFEDD5; color: #9A3412; }
        .diag-pill-success { background: #DCFCE7; color: #15803D; }

        .payment-amount-text {
          font-size: 1.35rem;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.01em;
          margin-bottom: 12px;
        }

        .payment-mode-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 0.88rem;
          color: #334155;
        }
        .badge-mode-online {
          background: var(--teal-pill-bg);
          color: var(--teal-pill-text);
          border: 1px solid #CCFBF1;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 6px;
        }

        .paid-via-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
          font-size: 0.88rem;
          color: #334155;
        }
        .badge-card-credit {
          background: #94A3B8;
          color: #FFFFFF;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          padding: 4px 8px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .link-view-bill {
          color: #16A34A;
          font-size: 0.88rem;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: color 0.15s;
        }
        .link-view-bill:hover {
          color: #15803D;
          text-decoration: underline;
        }

        .btn-view-txns-popup {
          width: 100%;
          background: #F8FAFC;
          border: 1px solid var(--border);
          padding: 9px 14px;
          border-radius: 8px;
          font-size: 0.84rem;
          font-weight: 700;
          color: #0F172A;
          cursor: pointer;
          margin-top: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.15s;
        }
        .btn-view-txns-popup:hover {
          background: #EFF6FF;
          border-color: #93C5FD;
          color: #2563EB;
        }

        /* Left / Main Column */
        .main-content-column {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .section-box {
          background: #FFFFFF;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 22px 24px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.02);
        }
        .section-header-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0F172A;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .section-subtitle {
          font-size: 0.86rem;
          color: var(--text-muted);
          margin-top: -8px;
          margin-bottom: 16px;
        }

        /* Items Grid */
        .items-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .item-card-row {
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 16px 18px;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          transition: border-color 0.15s, background 0.15s;
        }
        .item-card-row:hover {
          border-color: #CBD5E1;
          background: #FAFAFA;
        }
        .item-title-col strong {
          font-size: 0.96rem;
          color: #0F172A;
          display: block;
          margin-bottom: 4px;
        }
        .item-meta-details {
          font-size: 0.8rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .item-action-col {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* Access Badges */
        .badge-access-active {
          background: #DCFCE7;
          color: #15803D;
          font-size: 0.74rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 99px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .badge-access-revoked {
          background: #FEE2E2;
          color: #DC2626;
          font-size: 0.74rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 99px;
        }

        /* Masterclass Live Banner */
        .masterclass-live-card {
          background: #0B132B;
          color: #FFFFFF;
          border-radius: 14px;
          padding: 24px 28px;
          box-shadow: 0 4px 14px rgba(11, 19, 43, 0.15);
          position: relative;
          overflow: hidden;
        }
        .mc-top-badge {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.5);
          color: #F87171;
          font-size: 0.74rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          padding: 4px 12px;
          border-radius: 99px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 12px;
        }
        .mc-title {
          font-size: 1.45rem;
          font-weight: 800;
          color: #FFFFFF;
          margin-bottom: 8px;
        }
        .mc-desc {
          color: #94A3B8;
          font-size: 0.88rem;
          max-width: 650px;
          line-height: 1.5;
          margin-bottom: 18px;
        }
        .mc-mentors-row {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .mc-mentor-pill {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 6px 14px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
        }
        .mc-actions-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .btn-live-join {
          background: #2563EB;
          color: #FFFFFF;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          transition: background 0.15s;
        }
        .btn-live-join:hover {
          background: #1D4ED8;
        }
        .btn-copy-meet {
          background: rgba(255, 255, 255, 0.15);
          color: #FFFFFF;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background 0.15s;
        }
        .btn-copy-meet:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        /* Action Buttons */
        .btn-action-sm {
          padding: 5px 12px;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.15s;
        }
        .btn-grant {
          background: #DCFCE7;
          color: #15803D;
          border-color: #86EFAC;
        }
        .btn-grant:hover {
          background: #BBF7D0;
        }
        .btn-revoke {
          background: #FEE2E2;
          color: #DC2626;
          border-color: #FCA5A5;
        }
        .btn-revoke:hover {
          background: #FECACA;
        }

        /* Modal Dialog Base Styles */
        .modal-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(4px);
          z-index: 2000;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .modal-overlay.open {
          display: flex;
        }
        .modal-box {
          background: #FFFFFF;
          border-radius: 14px;
          max-width: 540px;
          width: 100%;
          padding: 24px 28px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-box-lg {
          max-width: 1100px;
        }
        .modal-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }
        .modal-header-row h3 {
          font-size: 1.18rem;
          font-weight: 800;
          color: #0F172A;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-modal-close {
          background: transparent;
          border: none;
          font-size: 1.3rem;
          color: #94A3B8;
          cursor: pointer;
        }
        .btn-modal-close:hover {
          color: #0F172A;
        }

        /* Popup Ledger Table */
        .popup-txn-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
          margin-top: 10px;
        }
        .popup-txn-table th {
          background: #F8FAFC;
          color: #475569;
          font-weight: 700;
          text-align: left;
          padding: 10px 12px;
          border-bottom: 1px solid var(--border);
        }
        .popup-txn-table td {
          padding: 12px;
          border-bottom: 1px solid var(--border);
          color: #1E293B;
          vertical-align: top;
        }
        .popup-txn-table tr:hover td {
          background: #FAFAFA;
        }

        /* Toast Notification */
        .toast-notify {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #0F172A;
          color: #FFFFFF;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: none;
          z-index: 9999;
        }

        /* Search Not Found Banner */
        .search-not-found-box {
          display: none;
          background: #FFFBEB;
          border: 1px solid #FCD34D;
          border-radius: 10px;
          padding: 16px 20px;
          margin-bottom: 20px;
          color: #92400E;
          font-size: 0.9rem;
        }
      `)
    ),
    h('body', null,
      // Top Strivers Brand Bar
      h('header', { className: 'top-navbar' },
        h('div', { className: 'nav-logo-wrap' },
          h('span', { className: 'nav-logo-badge' },
            h('span', { style: { color: '#FFB703' } }, '▲'),
            h('span', null, 'STRIVERS')
          ),
          h('span', { className: 'nav-title' }, 'Lifeline Template & Investigation Engine')
        ),
        h('div', { className: 'nav-right-actions' },
          h('span', { style: { fontSize: '0.82rem', color: 'var(--text-muted)' } }, `Operator: ${user.name}`),
          h('a', { href: '/admin', className: 'nav-pill-btn' }, 'Admin Control Center'),
          h('a', { href: '/dashboard', className: 'nav-pill-btn' }, 'Student Portal')
        )
      ),

      h('main', { className: 'lifeline-layout-wrap' },
        // Top Searchbar Component (media_1793284908060_4a6a7f99.png)
        h('div', { className: 'top-search-card' },
          h('div', { className: 'search-select-wrap' },
            h('select', { id: 'search-type-select', className: 'search-type-select' },
              h('option', { value: 'orderId' }, 'Order ID'),
              h('option', { value: 'email' }, 'Email ID'),
              h('option', { value: 'phone' }, 'Phone no.'),
              h('option', { value: 'txnId' }, 'Txn. ID'),
              h('option', { value: 'refId' }, 'Ref. ID')
            ),
            h('span', { className: 'select-caret' }, '▼')
          ),
          h('div', { className: 'search-divider' }),
          h('input', {
            type: 'text',
            id: 'search-input-box',
            className: 'search-input-box',
            placeholder: 'Search by Order ID, Email, Phone, Txn ID, Ref ID...',
            defaultValue: initialQuery.q || '8431432921',
            onKeyDown: 'if(event.key==="Enter") executeSearch()',
          }),
          h('button', {
            type: 'button',
            className: 'search-submit-btn',
            id: 'btn-search-trigger',
            onClick: 'executeSearch()',
            title: 'Search in Lifeline DB',
          },
            // Magnifying Glass SVG Icon
            h('svg', { viewBox: '0 0 24 24' },
              h('circle', { cx: '11', cy: '11', r: '7' }),
              h('line', { x1: '21', y1: '21', x2: '16.65', y2: '16.65' })
            )
          )
        ),

        // Search Not Found Alert Box
        h('div', { id: 'search-not-found-box', className: 'search-not-found-box' },
          h('strong', null, '🔍 No record found: '),
          h('span', { id: 'not-found-message' }, 'No customer or order matched this query.')
        ),

        // Split Grid Layout (Left: Masterclasses, Courses, Study Materials; Right: Order Summary Card)
        h('div', { className: 'lifeline-split-grid' },
          // Left / Main Content Column
          h('div', { className: 'main-content-column' },
            // Live Enrolled Masterclass Hero Section
            h('div', { className: 'masterclass-live-card' },
              h('div', { className: 'mc-top-badge' }, '🔴 YOUR ENROLLED BATCH • LIVE ROOM ACCESS'),
              h('h2', { className: 'mc-title', id: 'mc-hero-title' }, 'Strivers Masterclass'),
              h('p', { className: 'mc-desc', id: 'mc-hero-desc' },
                'Live online session, basics to advanced. Live Sunday interactive workshop on resume, portfolio, LinkedIn/Naukri & cold emails.'
              ),
              h('div', { className: 'mc-mentors-row', id: 'mc-mentors-container' },
                h('div', { className: 'mc-mentor-pill' },
                  h('span', { style: { color: '#60A5FA' } }, '👤'),
                  h('span', null, 'Alex Morgan • Ex-Google, Blinkit')
                ),
                h('div', { className: 'mc-mentor-pill' },
                  h('span', { style: { color: '#34D399' } }, '👤'),
                  h('span', null, 'Priya Sharma • Staff Engineer @ Zomato')
                ),
                h('div', { className: 'mc-mentor-pill' },
                  h('span', { style: { color: '#FBBF24' } }, '👤'),
                  h('span', null, 'Rahul Verma • Engineering Lead @ Porter')
                )
              ),
              h('div', { className: 'mc-actions-row' },
                h('a', {
                  href: 'https://meet.google.com/strivers-masterclass-live',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  className: 'btn-live-join',
                  id: 'btn-join-meet',
                }, '🎥 Join Live Mentorship Room (Google Meet)'),
                h('button', {
                  type: 'button',
                  className: 'btn-copy-meet',
                  onClick: "copyText('https://meet.google.com/strivers-masterclass-live', 'Meeting Link')",
                }, '📋 Copy Meeting Link')
              )
            ),

            // User Courses & Course Access Status Card
            h('div', { className: 'section-box' },
              h('div', { className: 'section-header-title' },
                h('span', null, '📚 Enrolled Courses & Access Status'),
                h('span', { id: 'courses-count-badge', style: { fontSize: '0.8rem', color: 'var(--text-muted)' } }, 'Loading...')
              ),
              h('p', { className: 'section-subtitle' },
                'Active course entitlements, transaction IDs, reference receipts and instant database access toggles. Click any ID to copy.'
              ),
              h('div', { className: 'items-grid', id: 'courses-list-container' },
                h('div', { style: { padding: '20px', textAlign: 'center', color: '#64748B' } }, 'Fetching enrolled courses...')
              )
            ),

            // Study Material, Notes & Practice Sheets Card
            h('div', { className: 'section-box' },
              h('div', { className: 'section-header-title' },
                h('span', null, '📑 Study Materials, Curriculums & Practice Tracks'),
                h('span', { id: 'materials-count-badge', style: { fontSize: '0.8rem', color: 'var(--text-muted)' } }, 'Loading...')
              ),
              h('p', { className: 'section-subtitle' },
                'Track-specific candidate materials, DRM-protected sheets and enrolled practice quotas.'
              ),
              h('div', { className: 'items-grid', id: 'materials-list-container' },
                h('div', { style: { padding: '20px', textAlign: 'center', color: '#64748B' } }, 'Fetching study materials...')
              )
            )
          ),

          // Right Column: Exact Customer & Order Summary Card (media_1793284863595_e35360ae.png)
          h('div', { className: 'right-sidebar-sticky' },
            h('div', { className: 'order-summary-card' },
              // Header: Order # with copy icon and date
              h('div', { className: 'order-top-header' },
                h('div', { className: 'order-id-title-row' },
                  h('span', { className: 'info-circle-icon', title: 'Order Details' }, 'ⓘ'),
                  h('span', null, 'Order'),
                  h('span', {
                    id: 'card-display-order-id',
                    className: 'copyable-id',
                    title: 'Click to copy Order ID',
                    onClick: "copyCurrentOrderId()",
                  },
                    h('span', { id: 'card-order-id-text' }, '#8431432921'),
                    h('span', { className: 'copy-icon' }, '📋')
                  )
                ),
                h('div', { className: 'order-date-text', id: 'card-order-date' }, 'Aug 03 2026, 10:31 PM')
              ),

              // Tabs: Comments (0) | Transactions
              h('div', { className: 'order-tabs-row' },
                h('button', {
                  type: 'button',
                  className: 'order-tab-btn',
                  id: 'tab-comments',
                  onClick: "openCommentsModal()",
                }, 'Comments (0)'),
                h('button', {
                  type: 'button',
                  className: 'order-tab-btn active',
                  id: 'tab-transactions',
                  onClick: "openTransactionsModal()",
                  title: 'Click to view full transaction ledger popup',
                },
                  h('span', null, 'Transactions'),
                  h('span', { id: 'tab-txn-count', style: { fontSize: '0.74rem', background: '#EFF6FF', color: '#2563EB', padding: '1px 6px', borderRadius: 99, fontWeight: 700 } }, '1')
                )
              ),

              // Order Tags row
              h('div', { className: 'order-tags-row' },
                h('span', { className: 'order-tags-label' }, 'Order Tags •'),
                h('button', {
                  type: 'button',
                  className: 'btn-add-tags',
                  onClick: "openAddTagModal()",
                }, '+ Add tags'),
                h('div', { id: 'card-tags-container', style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
                  h('span', { className: 'tag-pill' }, 'Direct Web')
                )
              ),

              // Customer Details Card
              h('div', { className: 'customer-card-box' },
                h('div', { className: 'cust-header-row' },
                  h('span', { className: 'cust-crown-icon' }, '👑'),
                  h('span', null, 'Customer'),
                  h('span', {
                    id: 'card-customer-id',
                    className: 'copyable-id',
                    title: 'Click to copy Customer ID',
                    onClick: "copyCurrentCustomerId()",
                  },
                    h('span', { id: 'card-customer-id-text' }, '#312795448'),
                    h('span', { className: 'copy-icon' }, '📋')
                  )
                ),
                h('div', { className: 'cust-name-row' },
                  h('span', {
                    id: 'card-customer-name',
                    className: 'copyable-id',
                    title: 'Click to copy Customer Name',
                    onClick: "copyCurrentCustomerName()",
                  },
                    h('span', { id: 'card-customer-name-text' }, 'Kamaldeep'),
                    h('span', { className: 'copy-icon' }, '📋')
                  )
                ),
                h('div', { className: 'cust-contact-line' },
                  h('span', null, '📞'),
                  h('span', {
                    id: 'card-phone-val',
                    className: 'copyable-id',
                    title: 'Click to copy phone number',
                    onClick: "copyCurrentPhone()",
                  }, 'XXXXXXXXX5543'),
                  h('button', {
                    type: 'button',
                    className: 'contact-action-icon',
                    id: 'btn-toggle-phone',
                    title: 'Toggle Mask / Unmask Phone',
                    onClick: "toggleMaskPhone()",
                  }, '👁️'),
                  h('button', {
                    type: 'button',
                    className: 'contact-action-icon',
                    title: 'Call Customer',
                    onClick: "triggerCustomerCall()",
                  }, '📞')
                ),
                h('div', { className: 'cust-contact-line' },
                  h('span', null, '✉️'),
                  h('span', {
                    id: 'card-email-val',
                    className: 'copyable-id',
                    title: 'Click to copy email address',
                    onClick: "copyCurrentEmail()",
                  }, 'XXXXXXX'),
                  h('button', {
                    type: 'button',
                    className: 'contact-action-icon',
                    id: 'btn-toggle-email',
                    title: 'Toggle Mask / Unmask Email',
                    onClick: "toggleMaskEmail()",
                  }, '👁️')
                )
              ),

              // Payment Section Box
              h('div', { className: 'payment-card-box' },
                h('div', { className: 'payment-head-row' },
                  h('span', { className: 'payment-label' }, 'Payment'),
                  h('span', { className: 'badge-payment-status badge-success', id: 'card-payment-badge' }, 'Success')
                ),
                h('div', { className: 'payment-amount-text', id: 'card-payment-amount' }, '₹ 285.03'),
                h('div', { className: 'payment-mode-row' },
                  h('span', null, 'Selected mode'),
                  h('span', { className: 'badge-mode-online', id: 'card-payment-mode' }, 'Online')
                ),
                h('div', { className: 'paid-via-row' },
                  h('span', null, 'Paid via:'),
                  h('span', { className: 'badge-card-credit', id: 'card-paid-via' },
                    h('span', null, '💳'),
                    h('span', null, 'CREDIT')
                  )
                ),
                h('a', {
                  href: 'javascript:void(0)',
                  className: 'link-view-bill',
                  onClick: "openBillModal()",
                }, 'View Order & Bill ›'),

                // Button to open Transactions Popup directly
                h('button', {
                  type: 'button',
                  className: 'btn-view-txns-popup',
                  onClick: "openTransactionsModal()",
                },
                  h('span', null, '💳'),
                  h('span', null, 'View Transactions & Gateway Ledger')
                ),

                // Payment Diagnostics box (Displays where/why canceled or failed)
                h('div', { id: 'card-diagnostics-container', style: { display: 'none' } })
              )
            )
          )
        )
      ),

      // DEDICATED POPUP MODAL: Transaction History & Gateway Ledger
      h('div', { id: 'modal-transactions-popup', className: 'modal-overlay' },
        h('div', { className: 'modal-box modal-box-lg' },
          h('div', { className: 'modal-header-row' },
            h('h3', null,
              h('span', null, '💳'),
              h('span', null, 'Transaction History & Gateway Ledger')
            ),
            h('button', { type: 'button', className: 'btn-modal-close', onClick: "closeTransactionsModal()" }, '✕')
          ),
          h('div', { id: 'popup-txn-meta-strip', style: { fontSize: '0.86rem', color: '#64748B', marginBottom: '14px', background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' } },
            'Loading transaction ledger...'
          ),
          h('div', { style: { overflowX: 'auto', maxHeight: '55vh' } },
            h('table', { className: 'popup-txn-table' },
              h('thead', null,
                h('tr', null,
                  h('th', null, 'Order ID'),
                  h('th', null, 'Txn ID'),
                  h('th', null, 'Ref. ID'),
                  h('th', null, 'Date & Time'),
                  h('th', null, 'Method'),
                  h('th', null, 'Amount'),
                  h('th', null, 'Exact Status'),
                  h('th', { style: { minWidth: '260px' } }, 'Payment Cancelation / Failure Reason'),
                  h('th', null, 'Actions')
                )
              ),
              h('tbody', { id: 'popup-txn-tbody' },
                h('tr', null,
                  h('td', { colSpan: 9, style: { textAlign: 'center', padding: '24px', color: '#64748B' } }, 'Loading transactions...')
                )
              )
            )
          ),
          h('div', { style: { marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
            h('span', { id: 'popup-total-volume-note', style: { fontSize: '0.84rem', color: '#475569', fontWeight: 600 } }, ''),
            h('button', {
              type: 'button',
              className: 'nav-pill-btn',
              style: { background: 'var(--navy)', color: '#FFF' },
              onClick: "closeTransactionsModal()",
            }, 'Close Ledger')
          )
        )
      ),

      // Modal Dialog for Order Bill & Invoice Details
      h('div', { id: 'bill-modal', className: 'modal-overlay' },
        h('div', { className: 'modal-box' },
          h('div', { className: 'modal-header-row' },
            h('h3', null, '🧾 Order & Tax Invoice Details'),
            h('button', { type: 'button', className: 'btn-modal-close', onClick: "closeBillModal()" }, '✕')
          ),
          h('div', { id: 'bill-modal-content', style: { fontSize: '0.9rem', color: '#334155', lineHeight: '1.8' } },
            'Loading invoice...'
          ),
          h('div', { style: { marginTop: '20px', textAlign: 'right' } },
            h('button', {
              type: 'button',
              className: 'nav-pill-btn',
              style: { background: 'var(--navy)', color: '#FFF' },
              onClick: "closeBillModal()",
            }, 'Close Bill')
          )
        )
      ),

      // Modal Dialog for Adding Order Tags
      h('div', { id: 'tags-modal', className: 'modal-overlay' },
        h('div', { className: 'modal-box' },
          h('div', { className: 'modal-header-row' },
            h('h3', null, '🏷️ Add Order Tag'),
            h('button', { type: 'button', className: 'btn-modal-close', onClick: "closeTagModal()" }, '✕')
          ),
          h('div', { style: { marginBottom: '14px' } },
            h('label', { style: { fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' } }, 'Tag Name:'),
            h('input', {
              type: 'text',
              id: 'input-new-tag',
              placeholder: 'e.g. VIP Student, Mentorship Priority',
              style: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem' },
            })
          ),
          h('div', { style: { textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' } },
            h('button', { type: 'button', className: 'nav-pill-btn', onClick: "closeTagModal()" }, 'Cancel'),
            h('button', {
              type: 'button',
              className: 'nav-pill-btn',
              style: { background: '#2563EB', color: '#FFF' },
              onClick: "submitNewTag()",
            }, 'Save Tag')
          )
        )
      ),

      // Toast Notification
      h('div', { id: 'toast-notify', className: 'toast-notify' }, 'Action successful'),

      // Interactive Client-Side Hydration Script
      h('script', null, `
        let currentLifelineData = null;
        let isPhoneMasked = true;
        let isEmailMasked = true;

        function showToast(msg) {
          const t = document.getElementById('toast-notify');
          if (!t) return;
          t.textContent = msg;
          t.style.display = 'block';
          clearTimeout(window._toastTimer);
          window._toastTimer = setTimeout(() => { t.style.display = 'none'; }, 2400);
        }

        // Universal Copy to Clipboard
        function copyText(val, label) {
          if (!val) return;
          const clean = String(val).trim();
          navigator.clipboard.writeText(clean).then(() => {
            showToast((label ? label + ' copied: ' : 'Copied: ') + clean);
          }).catch(() => {
            showToast('Copied: ' + clean);
          });
        }

        function copyCurrentOrderId() {
          const ordId = currentLifelineData?.order?.orderId || '8431432921';
          copyText(ordId, 'Order ID');
        }

        function copyCurrentCustomerId() {
          const custId = currentLifelineData?.customer?.customerId || '312795448';
          copyText(custId, 'Customer ID');
        }

        function copyCurrentCustomerName() {
          const name = currentLifelineData?.customer?.name || 'Kamaldeep';
          copyText(name, 'Customer Name');
        }

        function copyCurrentPhone() {
          const phone = currentLifelineData?.customer?.phone || '+91 98765 55543';
          copyText(phone, 'Phone number');
        }

        function copyCurrentEmail() {
          const email = currentLifelineData?.customer?.email || 'kamaldeep@gmail.com';
          copyText(email, 'Email address');
        }

        function toggleMaskPhone() {
          if (!currentLifelineData?.customer) return;
          isPhoneMasked = !isPhoneMasked;
          const el = document.getElementById('card-phone-val');
          if (el) {
            el.textContent = isPhoneMasked
              ? (currentLifelineData.customer.maskedPhone || 'XXXXXXXXX5543')
              : (currentLifelineData.customer.phone || 'N/A');
          }
        }

        function toggleMaskEmail() {
          if (!currentLifelineData?.customer) return;
          isEmailMasked = !isEmailMasked;
          const el = document.getElementById('card-email-val');
          if (el) {
            el.textContent = isEmailMasked
              ? (currentLifelineData.customer.maskedEmail || 'XXXXXXX')
              : (currentLifelineData.customer.email || 'student@example.com');
          }
        }

        function triggerCustomerCall() {
          if (currentLifelineData?.customer?.phone) {
            window.location.href = 'tel:' + currentLifelineData.customer.phone;
          } else {
            showToast('No phone number on record.');
          }
        }

        // Transactions Popup Controls
        function openTransactionsModal() {
          if (!currentLifelineData) {
            showToast('No customer records loaded.');
            return;
          }
          renderTransactionsPopup(currentLifelineData.transactions || []);
          document.getElementById('modal-transactions-popup').classList.add('open');
        }

        function closeTransactionsModal() {
          document.getElementById('modal-transactions-popup').classList.remove('open');
        }

        function openCommentsModal() {
          showToast('Order Comments: 0 active notes.');
        }

        function openAddTagModal() {
          document.getElementById('tags-modal').classList.add('open');
          const input = document.getElementById('input-new-tag');
          if (input) { input.value = ''; input.focus(); }
        }

        function closeTagModal() {
          document.getElementById('tags-modal').classList.remove('open');
        }

        async function submitNewTag() {
          const input = document.getElementById('input-new-tag');
          const tag = (input?.value || '').trim();
          if (!tag) return;
          const orderId = currentLifelineData?.order?.orderId;
          if (!orderId) { showToast('No active order selected'); return; }

          try {
            const res = await fetch('/api/v1/lifeline/add-order-tag', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId, tag })
            });
            const data = await res.json();
            if (data.success) {
              showToast('Tag added: ' + tag);
              closeTagModal();
              if (currentLifelineData && currentLifelineData.order) {
                currentLifelineData.order.tags = data.tags;
                renderRightSummaryCard(currentLifelineData);
              }
            } else {
              showToast('Failed to add tag: ' + data.message);
            }
          } catch (e) {
            showToast('Error saving tag');
          }
        }

        function openBillModal() {
          if (!currentLifelineData) return;
          const ord = currentLifelineData.order || {};
          const cust = currentLifelineData.customer || {};
          const diag = ord.diagnostics || {};
          const content = document.getElementById('bill-modal-content');
          if (content) {
            let diagBlock = '';
            if (diag.isFailedOrCanceled) {
              diagBlock =
                '<div style="background:#FEF2F2; border:1px solid #FECACA; border-radius:8px; padding:12px; margin-top:14px; font-size:0.84rem; color:#991B1B;">' +
                  '<strong style="display:block; margin-bottom:6px; font-size:0.92rem;">🛑 Payment Diagnostics & Cancelation Audit:</strong>' +
                  '<div><strong>Failure Category:</strong> ' + (diag.failureCategory || 'Gateway Failure') + '</div>' +
                  '<div><strong>Where Canceled / Step:</strong> ' + (diag.failureStage || 'Checkout Stage') + '</div>' +
                  '<div><strong>Which Thing Failed:</strong> ' + (diag.failedComponent || 'Payment Gateway') + '</div>' +
                  '<div><strong>Diagnostic Summary:</strong> ' + (diag.diagnosticSummary || 'Transaction incomplete') + '</div>' +
                  '<div><strong>Error Code:</strong> ' + (diag.errorCode || 'N/A') + ' &bull; <strong>Source:</strong> ' + (diag.errorSource || 'gateway') + '</div>' +
                '</div>';
            }

            content.innerHTML =
              '<div style="border-bottom:1px solid #E2E8F0; padding-bottom:12px; margin-bottom:12px;">' +
                '<strong>Order Number:</strong> <span class="copyable-id" onclick="copyText(\\'' + (ord.orderId || '') + '\\', \\'Order ID\\')">' + (ord.orderId || 'N/A') + ' 📋</span><br/>' +
                '<strong>Date & Timestamp:</strong> ' + (ord.dateFormatted || 'N/A') + '<br/>' +
                '<strong>Customer:</strong> ' + (cust.name || 'Kamaldeep') + ' (' + (cust.email || 'N/A') + ')<br/>' +
                '<strong>Phone:</strong> ' + (cust.phone || 'N/A') +
              '</div>' +
              '<div style="border-bottom:1px solid #E2E8F0; padding-bottom:12px; margin-bottom:12px;">' +
                '<strong>Gateway Txn ID:</strong> <span class="copyable-id" onclick="copyText(\\'' + (ord.txnId || '') + '\\', \\'Txn ID\\')">' + (ord.txnId || 'N/A') + ' 📋</span><br/>' +
                '<strong>Ref. ID / Receipt:</strong> <span class="copyable-id" onclick="copyText(\\'' + (ord.refId || '') + '\\', \\'Ref ID\\')">' + (ord.refId || 'N/A') + ' 📋</span><br/>' +
                '<strong>Payment Method:</strong> ' + (ord.paidVia || 'CREDIT') + ' (' + (ord.selectedMode || 'Online') + ')<br/>' +
                '<strong>Exact Status:</strong> <span style="font-weight:700; color:' + (ord.status === 'captured' ? '#16A34A' : '#DC2626') + ';">' + (ord.statusLabel || 'Success') + '</span>' +
              '</div>' +
              '<div style="font-size:1.1rem; font-weight:800; color:#0F172A; text-align:right;">' +
                'Total Amount Paid: ' + (ord.amountFormatted || '₹ 285.03') +
              '</div>' +
              diagBlock;
          }
          document.getElementById('bill-modal').classList.add('open');
        }

        function closeBillModal() {
          document.getElementById('bill-modal').classList.remove('open');
        }

        async function toggleCourseAccess(courseId, action) {
          const email = currentLifelineData?.customer?.email || 'creedracer111@gmail.com';
          try {
            const res = await fetch('/api/v1/lifeline/toggle-course-access', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, courseId, action })
            });
            const data = await res.json();
            if (data.success) {
              showToast(data.message);
              // Re-fetch search data to update entire platform view
              executeSearch();
            } else {
              showToast('Error: ' + data.message);
            }
          } catch (e) {
            showToast('Failed to mutate course access.');
          }
        }

        function renderRightSummaryCard(data) {
          const ord = data.order || {};
          const cust = data.customer || {};

          // Order ID & Date
          const ordTextEl = document.getElementById('card-order-id-text');
          if (ordTextEl) ordTextEl.textContent = ord.displayOrderId || ('#' + (ord.orderId || '8431432921'));
          const ordDateEl = document.getElementById('card-order-date');
          if (ordDateEl) ordDateEl.textContent = ord.dateFormatted || 'Aug 03 2026, 10:31 PM';

          // Tags
          const tagsCont = document.getElementById('card-tags-container');
          if (tagsCont) {
            const tags = Array.isArray(ord.tags) && ord.tags.length > 0 ? ord.tags : ['Standard Checkout'];
            tagsCont.innerHTML = tags.map(t => '<span class="tag-pill">' + t + '</span>').join('');
          }

          // Customer Card
          const custTextEl = document.getElementById('card-customer-id-text');
          if (custTextEl) custTextEl.textContent = '#' + (cust.customerId || '312795448');
          const custNameTextEl = document.getElementById('card-customer-name-text');
          if (custNameTextEl) custNameTextEl.textContent = cust.name || 'Kamaldeep';

          isPhoneMasked = true;
          isEmailMasked = true;
          const phoneEl = document.getElementById('card-phone-val');
          if (phoneEl) phoneEl.textContent = cust.maskedPhone || 'XXXXXXXXX5543';
          const emailEl = document.getElementById('card-email-val');
          if (emailEl) emailEl.textContent = cust.maskedEmail || 'XXXXXXX';

          // Payment Box
          const payBadgeEl = document.getElementById('card-payment-badge');
          if (payBadgeEl) {
            payBadgeEl.className = 'badge-payment-status ' + (ord.statusBadgeClass || 'badge-success');
            payBadgeEl.textContent = ord.statusLabel || 'Success';
          }
          const payAmtEl = document.getElementById('card-payment-amount');
          if (payAmtEl) payAmtEl.textContent = ord.amountFormatted || '₹ 285.03';
          const payModeEl = document.getElementById('card-payment-mode');
          if (payModeEl) payModeEl.textContent = ord.selectedMode || 'Online';
          const paidViaEl = document.getElementById('card-paid-via');
          if (paidViaEl) {
            paidViaEl.innerHTML = '<span>💳</span> <span>' + (ord.paidVia || 'CREDIT') + '</span>';
          }

          // Payment Diagnostics Box
          const diagCont = document.getElementById('card-diagnostics-container');
          if (diagCont) {
            const diag = ord.diagnostics || {};
            if (diag.isFailedOrCanceled) {
              let badgeCls = 'diag-pill-gateway';
              let icon = '⚠️';
              if (diag.failureCategory?.includes('User')) { badgeCls = 'diag-pill-user'; icon = '👤'; }
              else if (diag.failureCategory?.includes('Network')) { badgeCls = 'diag-pill-network'; icon = '🌐'; }
              else if (diag.failureCategory?.includes('Bank')) { badgeCls = 'diag-pill-bank'; icon = '🏦'; }
              else if (diag.failureCategory?.includes('Server')) { badgeCls = 'diag-pill-server'; icon = '⚙️'; }

              diagCont.style.display = 'block';
              diagCont.innerHTML =
                '<div class="diag-box">' +
                  '<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">' +
                    '<span class="diag-pill ' + badgeCls + '">' + icon + ' ' + (diag.failureCategory || 'Gateway Failure') + '</span>' +
                    '<span style="font-size:0.72rem; color:#64748B;">' + (diag.errorCode || 'FAILED') + '</span>' +
                  '</div>' +
                  '<div style="font-weight:700; color:#991B1B; margin-bottom:6px;">' + (diag.diagnosticSummary || 'Payment incomplete') + '</div>' +
                  '<div style="font-size:0.75rem; color:#475569; display:flex; flex-direction:column; gap:2px;">' +
                    '<div><strong>Where Canceled / Step:</strong> ' + (diag.failureStage || 'Checkout') + '</div>' +
                    '<div><strong>Which Thing Failed:</strong> ' + (diag.failedComponent || 'Gateway') + '</div>' +
                  '</div>' +
                '</div>';
            } else {
              diagCont.style.display = 'none';
              diagCont.innerHTML = '';
            }
          }

          // Update Transaction Count Badge in Tab
          const txns = data.transactions || [];
          const tabTxnCountEl = document.getElementById('tab-txn-count');
          if (tabTxnCountEl) tabTxnCountEl.textContent = txns.length;
        }

        function renderCourses(courses) {
          const cont = document.getElementById('courses-list-container');
          const badge = document.getElementById('courses-count-badge');
          if (!cont) return;

          if (!Array.isArray(courses) || courses.length === 0) {
            cont.innerHTML = '<div style="padding:16px; color:#64748B;">No courses found in catalog.</div>';
            if (badge) badge.textContent = '0 Courses';
            return;
          }

          if (badge) badge.textContent = courses.length + ' Courses Available';

          cont.innerHTML = courses.map(c => {
            const isEnrolled = c.isEnrolled;
            return (
              '<div class="item-card-row">' +
                '<div class="item-title-col">' +
                  '<strong>' + c.title + '</strong>' +
                  '<div class="item-meta-details">' +
                    '<span>💰 Price: ' + c.formattedPrice + '</span>' +
                    '<span>&bull; Paid: ' + c.amountPaid + '</span>' +
                    (c.orderId ? '<span>&bull; Order: <span class="copyable-id" onclick="copyText(\\'' + c.orderId + '\\', \\'Order ID\\')">' + c.orderId + ' 📋</span></span>' : '') +
                    (c.txnId ? '<span>&bull; Txn: <span class="copyable-id" onclick="copyText(\\'' + c.txnId + '\\', \\'Txn ID\\')">' + c.txnId + ' 📋</span></span>' : '') +
                    (c.refId ? '<span>&bull; Ref: <span class="copyable-id" onclick="copyText(\\'' + c.refId + '\\', \\'Ref ID\\')">' + c.refId + ' 📋</span></span>' : '') +
                  '</div>' +
                '</div>' +
                '<div class="item-action-col">' +
                  '<span class="' + (isEnrolled ? 'badge-access-active' : 'badge-access-revoked') + '">' +
                    (isEnrolled ? '✓ Active Lifetime Access' : '✕ Access Revoked') +
                  '</span>' +
                  (isEnrolled
                    ? '<button type="button" class="btn-action-sm btn-revoke" onclick="toggleCourseAccess(\\'' + c.productId + '\\', \\'revoke\\')">Revoke Access</button>'
                    : '<button type="button" class="btn-action-sm btn-grant" onclick="toggleCourseAccess(\\'' + c.productId + '\\', \\'grant\\')">Grant Access</button>'
                  ) +
                '</div>' +
              '</div>'
            );
          }).join('');
        }

        function renderMasterclasses(masterclasses) {
          if (!Array.isArray(masterclasses) || masterclasses.length === 0) return;
          const mc = masterclasses[0];
          const heroTitle = document.getElementById('mc-hero-title');
          if (heroTitle) heroTitle.textContent = mc.title || 'Strivers Masterclass';
          const meetBtn = document.getElementById('btn-join-meet');
          if (meetBtn && mc.activeMeetingLink) meetBtn.href = mc.activeMeetingLink;

          const mentorsCont = document.getElementById('mc-mentors-container');
          if (mentorsCont && Array.isArray(mc.mentors) && mc.mentors.length > 0) {
            mentorsCont.innerHTML = mc.mentors.map(m =>
              '<div class="mc-mentor-pill"><span>👤</span><span>' + m.name + ' • ' + (m.role || 'Mentor') + (m.company ? ' @ ' + m.company : '') + '</span></div>'
            ).join('');
          }
        }

        function renderStudyMaterials(materials) {
          const cont = document.getElementById('materials-list-container');
          const badge = document.getElementById('materials-count-badge');
          if (!cont) return;

          if (!Array.isArray(materials) || materials.length === 0) {
            cont.innerHTML = '<div style="padding:16px; color:#64748B;">No study materials configured.</div>';
            if (badge) badge.textContent = '0 Sheets';
            return;
          }

          if (badge) badge.textContent = materials.length + ' Specialized Tracks';

          cont.innerHTML = materials.map(m => {
            return (
              '<div class="item-card-row">' +
                '<div class="item-title-col">' +
                  '<strong>' + m.title + '</strong>' +
                  '<div class="item-meta-details">' +
                    '<span>Role Type: ' + m.roleType.toUpperCase() + '</span>' +
                    '<span>&bull; Fee: ' + m.formattedPrice + '</span>' +
                    '<span>&bull; Amt. Paid: ' + m.amountPaid + '</span>' +
                    '<span>&bull; Track ID: <span class="copyable-id" onclick="copyText(\\'' + m.sheetId + '\\', \\'Track ID\\')">' + m.sheetId + ' 📋</span></span>' +
                  '</div>' +
                '</div>' +
                '<div class="item-action-col">' +
                  '<span class="' + (m.isEnrolled ? 'badge-access-active' : 'badge-access-revoked') + '">' +
                    m.accessStatus +
                  '</span>' +
                  '<a href="/templates/lifeline/' + m.sheetId + '" class="nav-pill-btn" style="text-decoration:none; font-size:0.78rem;">Launch Track ›</a>' +
                '</div>' +
              '</div>'
            );
          }).join('');
        }

        // Renders the Transactions Popup Modal
        function renderTransactionsPopup(txns) {
          const tbody = document.getElementById('popup-txn-tbody');
          const metaStrip = document.getElementById('popup-txn-meta-strip');
          const volEl = document.getElementById('popup-total-volume-note');
          if (!tbody) return;

          const cust = currentLifelineData?.customer || {};
          const ord = currentLifelineData?.order || {};

          if (metaStrip) {
            metaStrip.innerHTML =
              '<strong>Order ID:</strong> <span class="copyable-id" onclick="copyText(\\'' + (ord.orderId || '') + '\\', \\'Order ID\\')">' + (ord.orderId || 'N/A') + ' 📋</span> &bull; ' +
              '<strong>Customer:</strong> <span class="copyable-id" onclick="copyText(\\'' + (cust.name || '') + '\\', \\'Customer Name\\')">' + (cust.name || 'Kamaldeep') + ' 📋</span> (' + (cust.email || 'N/A') + ') &bull; ' +
              '<strong>Total Payment Attempts:</strong> ' + txns.length;
          }

          if (!Array.isArray(txns) || txns.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:28px; color:#64748B;">No payment attempts found on record for this customer.</td></tr>';
            if (volEl) volEl.textContent = 'Total Captured Volume: ₹0.00';
            return;
          }

          const capturedSum = txns
            .filter(t => t.status === 'captured')
            .reduce((sum, t) => sum + (t.rawAmount || 0), 0);

          if (volEl) {
            volEl.textContent = 'Total Captured Volume: ₹' + capturedSum.toLocaleString('en-IN', { minimumFractionDigits: 2 });
          }

          tbody.innerHTML = txns.map(t => {
            const diag = t.diagnostics || {};
            let diagHtml = '';

            if (diag.isFailedOrCanceled) {
              let badgeCls = 'diag-pill-gateway';
              let icon = '⚠️';
              if (diag.failureCategory?.includes('User')) { badgeCls = 'diag-pill-user'; icon = '👤'; }
              else if (diag.failureCategory?.includes('Network')) { badgeCls = 'diag-pill-network'; icon = '🌐'; }
              else if (diag.failureCategory?.includes('Bank')) { badgeCls = 'diag-pill-bank'; icon = '🏦'; }
              else if (diag.failureCategory?.includes('Server')) { badgeCls = 'diag-pill-server'; icon = '⚙️'; }

              diagHtml =
                '<div style="font-size:0.78rem; line-height:1.4;">' +
                  '<span class="diag-pill ' + badgeCls + '">' + icon + ' ' + (diag.failureCategory || 'Failed') + '</span>' +
                  '<div style="font-weight:600; color:#DC2626; margin-top:2px;">' + (diag.diagnosticSummary || 'Incomplete') + '</div>' +
                  '<div style="font-size:0.72rem; color:#64748B; margin-top:2px;">' +
                    '<strong>Where:</strong> ' + (diag.failureStage || 'Checkout') + ' &bull; <strong>Failed:</strong> ' + (diag.failedComponent || 'N/A') +
                  '</div>' +
                '</div>';
            } else {
              diagHtml =
                '<div style="font-size:0.78rem; color:#15803D; font-weight:600;">' +
                  '<span class="diag-pill diag-pill-success">✓ Captured Successfully</span>' +
                  '<div style="font-size:0.72rem; color:#64748B;">No errors &bull; Verified in DB</div>' +
                '</div>';
            }

            return (
              '<tr>' +
                '<td><span class="copyable-id" onclick="copyText(\\'' + t.orderId + '\\', \\'Order ID\\')"><strong>' + t.orderId + '</strong> 📋</span></td>' +
                '<td><span class="copyable-id" style="font-family:var(--font-mono); font-size:0.8rem;" onclick="copyText(\\'' + (t.txnId || '') + '\\', \\'Txn ID\\')">' + (t.txnId || 'N/A') + ' 📋</span></td>' +
                '<td><span class="copyable-id" style="font-family:var(--font-mono); font-size:0.8rem;" onclick="copyText(\\'' + (t.refId || '') + '\\', \\'Ref ID\\')">' + (t.refId || 'N/A') + ' 📋</span></td>' +
                '<td>' + t.paidAt + '</td>' +
                '<td><span class="tag-pill">' + t.paymentMethod + '</span></td>' +
                '<td><strong>' + t.amount + '</strong></td>' +
                '<td><span class="badge-payment-status ' + t.statusBadgeClass + '">' + t.statusLabel + '</span></td>' +
                '<td>' + diagHtml + '</td>' +
                '<td><button type="button" class="btn-action-sm" style="background:#F1F5F9; color:#0F172A;" onclick="copyText(\\'' + t.orderId + '\\', \\'Order ID\\')">Copy</button></td>' +
              '</tr>'
            );
          }).join('');
        }

        async function executeSearch() {
          const select = document.getElementById('search-type-select');
          const input = document.getElementById('search-input-box');
          const notFoundBox = document.getElementById('search-not-found-box');
          const notFoundMsg = document.getElementById('not-found-message');

          const type = select ? select.value : 'orderId';
          const q = input ? input.value.trim() : '';

          showToast('Searching lifeline database...');

          try {
            const url = '/api/v1/lifeline/search?type=' + encodeURIComponent(type) + '&q=' + encodeURIComponent(q);
            const res = await fetch(url);
            const data = await res.json();

            if (data.notFound) {
              if (notFoundBox) notFoundBox.style.display = 'block';
              if (notFoundMsg) notFoundMsg.textContent = data.message || ('No customer or order matched "' + q + '".');
              showToast('No record found for query: ' + q);
              return;
            }

            if (notFoundBox) notFoundBox.style.display = 'none';

            if (data.success) {
              currentLifelineData = data;
              renderRightSummaryCard(data);
              renderCourses(data.courses);
              renderMasterclasses(data.masterclasses);
              renderStudyMaterials(data.studyMaterials);
              showToast('Customer & Order loaded.');
            } else {
              showToast('Search error: ' + data.message);
            }
          } catch (e) {
            showToast('Failed to connect to Lifeline API');
          }
        }

        // Auto execute on page load
        document.addEventListener('DOMContentLoaded', () => {
          executeSearch();
        });
      `)
    )
  );
}

module.exports = LifelineTemplate;
