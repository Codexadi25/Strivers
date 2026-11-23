import React, { useState, useEffect, useMemo, useCallback } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PaymentIcon from '@mui/icons-material/Payment';
import SchoolIcon from '@mui/icons-material/School';
import SecurityIcon from '@mui/icons-material/Security';
import RefreshIcon from '@mui/icons-material/Refresh';

import { apiCall } from '../services/api';
import TelemetryMetricsGrid from '../components/telemetry/TelemetryMetricsGrid';
import DiagnosticsPanels from '../components/telemetry/DiagnosticsPanels';
import RecentActivitiesTable from '../components/telemetry/RecentActivitiesTable';
import './TelemetryPage.css';

export default function TelemetryPage({ onTabChange }) {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Interactive Metric Drilldown Modal State
  const [drilldownMetric, setDrilldownMetric] = useState(null); // 'revenue' | 'transactions' | 'subscribers' | 'logs'
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalItems, setModalItems] = useState([]);
  const [modalSearch, setModalSearch] = useState('');

  const fetchTelemetry = async () => {
    try {
      const res = await apiCall('/telemetry');
      if (res && res.telemetry) {
        setTelemetry(res.telemetry);
        setError('');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch telemetry data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 12000);
    return () => clearInterval(interval);
  }, []);

  const loadDrilldownData = useCallback(async (metricKey) => {
    setModalLoading(true);
    setModalError('');
    setModalItems([]);
    setModalSearch('');

    try {
      if (metricKey === 'revenue' || metricKey === 'transactions') {
        const res = await apiCall('/orders');
        const orders = res?.orders || [];
        if (metricKey === 'revenue') {
          // Captured successful revenue payments
          const captured = orders.filter(
            (o) => String(o.status || '').toUpperCase() === 'CAPTURED'
          );
          setModalItems(captured);
        } else {
          // All transactions (prioritizing captured and verified)
          setModalItems(orders);
        }
      } else if (metricKey === 'subscribers') {
        const res = await apiCall('/users');
        const users = res?.users || [];
        const activeSubscribers = users.filter(
          (u) =>
            u.hasActiveSubscription ||
            (Array.isArray(u.enrolledCourses) && u.enrolledCourses.length > 0)
        );
        setModalItems(activeSubscribers);
      } else if (metricKey === 'logs') {
        const res = await apiCall('/audit-logs?limit=100');
        const logs = res?.logs || [];
        setModalItems(logs);
      }
    } catch (err) {
      setModalError(err.message || 'Failed to load live records from database.');
    } finally {
      setModalLoading(false);
    }
  }, []);

  const handleSelectMetric = (metricKey) => {
    setDrilldownMetric(metricKey);
    loadDrilldownData(metricKey);
  };

  const handleCloseModal = () => {
    setDrilldownMetric(null);
    setModalItems([]);
    setModalSearch('');
  };

  // Filtered items based on search input
  const filteredModalItems = useMemo(() => {
    if (!modalSearch.trim()) return modalItems;
    const term = modalSearch.toLowerCase().trim();

    return modalItems.filter((item) => {
      if (drilldownMetric === 'revenue' || drilldownMetric === 'transactions') {
        return (
          (item.orderId || '').toLowerCase().includes(term) ||
          (item.customerEmail || '').toLowerCase().includes(term) ||
          (item.customerName || '').toLowerCase().includes(term) ||
          (item.courseTitle || '').toLowerCase().includes(term) ||
          (item.txnId || '').toLowerCase().includes(term)
        );
      }
      if (drilldownMetric === 'subscribers') {
        return (
          (item.email || '').toLowerCase().includes(term) ||
          (item.name || '').toLowerCase().includes(term) ||
          (item.userId || '').toLowerCase().includes(term) ||
          (item.role || '').toLowerCase().includes(term)
        );
      }
      if (drilldownMetric === 'logs') {
        return (
          (item.action || '').toLowerCase().includes(term) ||
          (item.event || '').toLowerCase().includes(term) ||
          (item.userEmail || '').toLowerCase().includes(term) ||
          (item.tag || '').toLowerCase().includes(term) ||
          (item.ip || '').toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [modalItems, modalSearch, drilldownMetric]);

  const getMetricMetadata = () => {
    switch (drilldownMetric) {
      case 'revenue':
        return {
          title: 'Total Revenue & Verified Captured Payments',
          targetTab: 'orders',
          tabLabel: 'Full Orders Ledger',
          Icon: AttachMoneyIcon,
          color: '#059669',
        };
      case 'transactions':
        return {
          title: 'Successful & Live Payment Transactions',
          targetTab: 'orders',
          tabLabel: 'Full Orders Ledger',
          Icon: PaymentIcon,
          color: '#2563eb',
        };
      case 'subscribers':
        return {
          title: 'Active Subscribers & Enrolled Students',
          targetTab: 'users',
          tabLabel: 'Users Access Directory',
          Icon: SchoolIcon,
          color: '#7c3aed',
        };
      case 'logs':
        return {
          title: 'Audit Logs & Security Stream',
          targetTab: 'audit',
          tabLabel: 'Full Audit Console',
          Icon: SecurityIcon,
          color: '#4f46e5',
        };
      default:
        return {
          title: 'Live Database Records',
          targetTab: 'telemetry',
          tabLabel: 'Dashboard',
          Icon: SecurityIcon,
          color: '#0f172a',
        };
    }
  };

  const currentMeta = getMetricMetadata();

  return (
    <div className="telem-page-root">
      <div className="telem-header">
        <h2 className="telem-title">System Telemetry &amp; Platform Overview</h2>
        <p className="telem-desc">
          Real-time server health, live revenue metrics, captured transactions, and system activity stream.
        </p>
      </div>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && !telemetry ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '32px 0' }}>
          <CircularProgress size={24} />
          <span>Loading live platform telemetry...</span>
        </div>
      ) : (
        <>
          <TelemetryMetricsGrid
            metrics={telemetry?.metrics || {}}
            activitiesCount={(telemetry?.activities || []).length}
            onSelectMetric={handleSelectMetric}
          />
          <DiagnosticsPanels telemetry={telemetry} />
          <RecentActivitiesTable activities={telemetry?.activities || []} />
        </>
      )}

      {/* Interactive Metric Drilldown Modal Dialog */}
      <Dialog
        open={Boolean(drilldownMetric)}
        onClose={handleCloseModal}
        maxWidth="lg"
        fullWidth
        scroll="paper"
        aria-labelledby="metric-drilldown-dialog-title"
      >
        <DialogTitle
          id="metric-drilldown-dialog-title"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1,
            pt: 2,
            px: 3,
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: `${currentMeta.color}15`,
                color: currentMeta.color,
              }}
            >
              <currentMeta.Icon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2 }}>
                {currentMeta.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Live database records &bull; {modalItems.length} total entries found
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => loadDrilldownData(drilldownMetric)}
              title="Refresh live data"
              disabled={modalLoading}
            >
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton size="small" onClick={handleCloseModal} title="Close dialog">
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Quick Filter Search Toolbar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              mb: 2,
              flexWrap: 'wrap',
            }}
          >
            <TextField
              size="small"
              placeholder="Search by email, order ID, student name..."
              value={modalSearch}
              onChange={(e) => setModalSearch(e.target.value)}
              sx={{ minWidth: { xs: '100%', sm: 320 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`${filteredModalItems.length} of ${modalItems.length} matching`}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600, fontSize: '0.75rem' }}
              />
              {onTabChange && (
                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<OpenInNewIcon sx={{ fontSize: '14px !important' }} />}
                  onClick={() => {
                    handleCloseModal();
                    onTabChange(currentMeta.targetTab);
                  }}
                  sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.78rem' }}
                >
                  Open {currentMeta.tabLabel}
                </Button>
              )}
            </Box>
          </Box>

          {modalError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {modalError}
            </Alert>
          )}

          {modalLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 8, gap: 2 }}>
              <CircularProgress size={28} />
              <Typography variant="body2" color="text.secondary">
                Querying live database records...
              </Typography>
            </Box>
          ) : filteredModalItems.length === 0 ? (
            <Alert severity="info" sx={{ my: 3 }}>
              {modalSearch.trim()
                ? `No records matching "${modalSearch}".`
                : drilldownMetric === 'revenue'
                ? 'No verified captured payment transactions recorded in the database yet.'
                : drilldownMetric === 'transactions'
                ? 'No payment transactions recorded in database yet.'
                : drilldownMetric === 'subscribers'
                ? 'No active subscribers found in database.'
                : 'No audit logs recorded in database yet.'}
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                {/* Headers according to metric */}
                {(drilldownMetric === 'revenue' || drilldownMetric === 'transactions') && (
                  <>
                    <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Program / Course</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Mode</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredModalItems.map((o, idx) => {
                        const isCaptured =
                          String(o.status || '').toUpperCase() === 'CAPTURED';
                        return (
                          <TableRow key={o.orderId || idx} hover>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 600 }}>
                              {o.orderId || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                                {o.customerName || 'Student'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {o.customerEmail || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.82rem' }}>
                              {o.courseTitle || o.planId || 'Masterclass'}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 800, color: isCaptured ? '#059669' : 'text.primary' }}>
                              ₹{Number(o.amount || 0).toLocaleString('en-IN')}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>
                              {o.paidVia || o.paymentMethod || 'UPI'}
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                              {o.date || (o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN') : 'N/A')}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={o.status || 'CREATED'}
                                size="small"
                                color={isCaptured ? 'success' : o.status?.includes('CANCEL') ? 'default' : 'warning'}
                                variant={isCaptured ? 'filled' : 'outlined'}
                                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </>
                )}

                {drilldownMetric === 'subscribers' && (
                  <>
                    <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Student / User</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>User ID</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Subscription</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Enrolled Programs</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Member Since</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredModalItems.map((u, idx) => (
                        <TableRow key={u.userId || u.email || idx} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.82rem' }}>
                              {u.name || 'Student'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {u.email}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            {u.userId || u._id || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={(u.role || 'user').toUpperCase()}
                              size="small"
                              color={u.role === 'admin' ? 'primary' : 'default'}
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={u.hasActiveSubscription ? 'ACTIVE' : 'ENROLLED'}
                              size="small"
                              color="success"
                              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.78rem' }}>
                            {Array.isArray(u.enrolledCourses) && u.enrolledCourses.length > 0
                              ? u.enrolledCourses.map((c) => c.courseTitle || c.courseId).join(', ')
                              : 'All-Access Plan'}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </>
                )}

                {drilldownMetric === 'logs' && (
                  <>
                    <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Event / Action</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Operator / Email</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>IP Address</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Details</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredModalItems.map((l, idx) => (
                        <TableRow key={l.id || idx} hover>
                          <TableCell>
                            <Chip
                              label={l.tag || 'SYSTEM'}
                              size="small"
                              variant="outlined"
                              color={l.tag === 'AUTH' ? 'primary' : l.tag === 'PAYMENT' ? 'success' : 'default'}
                              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem' }}>
                            {l.action || l.event}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                            {l.userEmail || 'system'}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            {l.ip || l.ipAddress || '127.0.0.1'}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                            {l.date || (l.createdAt ? new Date(l.createdAt).toLocaleString('en-IN') : 'N/A')}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.72rem', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {JSON.stringify(l.metadata || l.metaData || {})}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </>
                )}
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            Verified database stream &bull; {filteredModalItems.length} records shown
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={handleCloseModal} variant="outlined" size="small" sx={{ textTransform: 'none' }}>
              Close
            </Button>
            {onTabChange && (
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  handleCloseModal();
                  onTabChange(currentMeta.targetTab);
                }}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Go to {currentMeta.tabLabel} &rarr;
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>
    </div>
  );
}
