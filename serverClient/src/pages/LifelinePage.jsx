import React, { useState, useEffect, useCallback } from 'react';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import BoltIcon from '@mui/icons-material/Bolt';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import { apiCall } from '../services/api';
import LifelineSearchBar from '../components/lifeline/LifelineSearchBar';
import LifelineCustomerPanel, { LifelineProfileCard } from '../components/lifeline/LifelineCustomerPanel';
import LifelineOrdersList from '../components/lifeline/LifelineOrdersList';
import './LifelinePage.css';

export const LIFELINE_CATEGORIES = [
  { id: 'order_id', label: 'Order ID' },
  { id: 'customer_id', label: 'Customer ID' },
  { id: 'customer_email', label: 'Customer Email' },
  { id: 'customer_phone', label: 'Customer Phone' },
  { id: 'txn_id', label: 'Txn / Payment ID' },
  { id: 'ref_id', label: 'Reference / Receipt ID' },
];

export default function LifelinePage() {
  const [selectedCategory, setSelectedCategory] = useState('customer_email');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [notFoundQuery, setNotFoundQuery] = useState('');
  const [lifelineData, setLifelineData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState('');
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [quickSuggestions, setQuickSuggestions] = useState([]);
  const [dbMaterials, setDbMaterials] = useState([]);
  const [dbPracticeTracks, setDbPracticeTracks] = useState([]);

  // Fetch initial telemetry, sample database records, materials & practice sheets
  useEffect(() => {
    let isMounted = true;

    const bootstrapContext = async () => {
      const results = await Promise.allSettled([
        apiCall('/telemetry'),
        apiCall('/orders?q='),
        apiCall('/masterclasses'),
        apiCall('/practice'),
      ]);

      if (!isMounted) return;

      const [telRes, ordRes, mcRes, prRes] = results;

      if (telRes.status === 'fulfilled' && telRes.value?.success) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('error');
      }

      if (ordRes.status === 'fulfilled' && Array.isArray(ordRes.value?.orders)) {
        const seenEmails = new Set();
        const suggestions = [];
        for (const ord of ordRes.value.orders) {
          if (ord.customerEmail && !seenEmails.has(ord.customerEmail)) {
            seenEmails.add(ord.customerEmail);
            suggestions.push({
              param: 'customer_email',
              value: ord.customerEmail,
              label: `Email: ${ord.customerEmail}`,
            });
          }
          if (suggestions.length < 3 && ord.orderId) {
            suggestions.push({
              param: 'order_id',
              value: ord.orderId,
              label: `Order: ${ord.orderId}`,
            });
          }
          if (suggestions.length >= 4) break;
        }
        setQuickSuggestions(suggestions);
      }

      if (mcRes.status === 'fulfilled' && Array.isArray(mcRes.value?.masterclasses)) {
        const mats = [];
        for (const mc of mcRes.value.masterclasses) {
          for (const mat of mc.materials || []) {
            mats.push({
              ...mat,
              courseId: mc.productId,
              courseTitle: mc.title,
            });
          }
        }
        setDbMaterials(mats);
      }

      if (prRes.status === 'fulfilled' && Array.isArray(prRes.value?.sheets)) {
        setDbPracticeTracks(prRes.value.sheets);
      }
    };

    bootstrapContext();
    return () => {
      isMounted = false;
    };
  }, []);

  const executeSearch = useCallback(async (param, query, pageNum = 1) => {
    const q = (query || '').trim();
    if (!q) {
      setLifelineData(null);
      setError('');
      setNotFoundQuery('');
      return;
    }

    if (pageNum === 1) {
      setLoading(true);
      setError('');
      setNotFoundQuery('');
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await apiCall(
        `/lifeline?param=${encodeURIComponent(param)}&value=${encodeURIComponent(q)}&page=${pageNum}&limit=3`
      );

      if (res.success && res.matched && res.data) {
        setBackendStatus('connected');
        if (pageNum === 1) {
          setLifelineData(res.data);
        } else {
          setLifelineData((prev) => ({
            ...res.data,
            orders: [...(prev?.orders || []), ...(res.data.orders || [])],
          }));
        }
        setCurrentPage(pageNum);
      } else {
        if (pageNum === 1) {
          setLifelineData(null);
          setNotFoundQuery(q);
        }
      }
    } catch (err) {
      setBackendStatus('error');
      setError(err.message || 'Unable to execute Lifeline database query.');
      if (pageNum === 1) {
        setLifelineData(null);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Parse URL params (?param=...&value=... or /lifeline/<param>/<value>) on initial load
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    let p =
      urlParams.get('category') ||
      urlParams.get('param') ||
      urlParams.get('type') ||
      urlParams.get('searchParameter');
    let v =
      urlParams.get('value') ||
      urlParams.get('q') ||
      urlParams.get('query') ||
      urlParams.get('email');

    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const lifelineIdx = pathParts.findIndex((part) => part.toLowerCase() === 'lifeline');
    if (lifelineIdx !== -1 && pathParts.length >= lifelineIdx + 3) {
      p = p || pathParts[lifelineIdx + 1];
      v = v || pathParts[lifelineIdx + 2];
    }

    let resolvedCategory = 'customer_email';
    if (p) {
      const normalized = p.toLowerCase();
      const match = LIFELINE_CATEGORIES.find(
        (c) =>
          c.id === normalized ||
          c.label.toLowerCase().includes(normalized) ||
          (normalized === 'email' && c.id === 'customer_email') ||
          (normalized === 'phone' && c.id === 'customer_phone')
      );
      if (match) {
        resolvedCategory = match.id;
        setSelectedCategory(match.id);
      }
    }

    if (v) {
      setSearchValue(v);
      executeSearch(resolvedCategory, v, 1);
    }
  }, [executeSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    executeSearch(selectedCategory, searchValue, 1);
  };

  const handleSelectSuggestion = (param, value) => {
    setSelectedCategory(param);
    setSearchValue(value);
    executeSearch(param, value, 1);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    setLifelineData(null);
    setError('');
    setNotFoundQuery('');
    setCurrentPage(1);
  };

  const handleLoadMoreOrders = () => {
    if (lifelineData?.pagination?.hasMoreOrders) {
      executeSearch(selectedCategory, searchValue, currentPage + 1);
    }
  };

  const handleCopy = (text, key) => {
    if (!text) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(String(text)).catch(() => {});
    }
    setCopiedId(key);
    setTimeout(() => setCopiedId(''), 1800);
  };

  // Match materials relevant to enrolled courses if any exist, otherwise show active catalog materials
  const relevantMaterials = (() => {
    if (!lifelineData) return [];
    const enrolledIds = new Set((lifelineData.enrolledCourses || []).map((c) => c.courseId));
    if (enrolledIds.size === 0) return dbMaterials.slice(0, 4);
    const matched = dbMaterials.filter((m) => enrolledIds.has(m.courseId));
    return matched.length > 0 ? matched : dbMaterials.slice(0, 4);
  })();

  const relevantPracticeTracks = (() => {
    if (!lifelineData) return [];
    return (lifelineData.practiceTracks || dbPracticeTracks).slice(0, 4);
  })();

  return (
    <div className="sc-lifeline-page-root">
      <div className="sc-lifeline-page-header">
        <div>
          <div className="sc-lifeline-title-row">
            <h2 className="sc-lifeline-title">Lifeline Customer &amp; Payment Investigation Hub</h2>
            <Chip
              size="small"
              icon={<BoltIcon fontSize="small" />}
              color={backendStatus === 'connected' ? 'success' : backendStatus === 'error' ? 'error' : 'default'}
              label={
                backendStatus === 'connected'
                  ? 'Live DB Sync'
                  : backendStatus === 'error'
                  ? 'API Disconnected'
                  : 'Checking...'
              }
              sx={{ fontWeight: 700 }}
            />
          </div>
          <p className="sc-lifeline-desc">
            Real-time student lookup by Order ID, Customer Email, Phone, or Gateway Txn ID directly synced with MongoDB &amp; Student Portal.
          </p>
        </div>

        <div className="sc-lifeline-header-actions">
          <Button
            size="small"
            variant="outlined"
            endIcon={<OpenInNewIcon fontSize="small" />}
            onClick={() => window.open('http://localhost:8080/admin', '_blank', 'noopener,noreferrer')}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            Basic Server GUI
          </Button>
          <Button
            size="small"
            variant="outlined"
            endIcon={<OpenInNewIcon fontSize="small" />}
            onClick={() => window.open('http://localhost:3000', '_blank', 'noopener,noreferrer')}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            Student Portal
          </Button>
        </div>
      </div>

      <LifelineSearchBar
        categories={LIFELINE_CATEGORIES}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchValue={searchValue}
        onSearchValueChange={setSearchValue}
        loading={loading}
        onSubmit={handleSearchSubmit}
        onClear={handleClearSearch}
        quickSuggestions={quickSuggestions}
        onSelectSuggestion={handleSelectSuggestion}
      />

      {error && (
        <Alert severity="error" className="sc-lifeline-alert" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {notFoundQuery && !loading && (
        <Alert severity="info" className="sc-lifeline-alert">
          No customer or order record matched <strong>&ldquo;{notFoundQuery}&rdquo;</strong> under parameter{' '}
          <strong>{LIFELINE_CATEGORIES.find((c) => c.id === selectedCategory)?.label}</strong>.
        </Alert>
      )}

      {!loading && !lifelineData && !notFoundQuery && !error && (
        <Paper variant="outlined" className="sc-lifeline-empty-state">
          <ManageSearchIcon sx={{ fontSize: 44, color: '#64748b' }} />
          <h3 className="sc-lifeline-empty-title">Ready to Investigate a Record</h3>
          <p className="sc-lifeline-empty-desc">
            Enter a student email, Razorpay order ID, payment ID, or click one of the recent live records above to inspect live subscriptions, batch access, materials, and order ledger history.
          </p>
        </Paper>
      )}

      {loading && !lifelineData && (
        <div className="sc-lifeline-investigation-grid">
          <div className="sc-lifeline-col">
            <Paper variant="outlined" className="sc-lifeline-skeleton-card">
              <Skeleton variant="text" width="50%" height={32} />
              <Skeleton variant="text" width="90%" height={20} />
              <Skeleton variant="rounded" width="100%" height={110} sx={{ mt: 2 }} />
            </Paper>
            <Paper variant="outlined" className="sc-lifeline-skeleton-card">
              <Skeleton variant="text" width="60%" height={28} />
              <Skeleton variant="rounded" width="100%" height={90} sx={{ mt: 2 }} />
            </Paper>
          </div>
          <div className="sc-lifeline-right-col">
            <Paper variant="outlined" className="sc-lifeline-skeleton-card">
              <Skeleton variant="text" width="45%" height={28} />
              <Skeleton variant="text" width="75%" height={24} />
              <Skeleton variant="rounded" width="100%" height={80} sx={{ mt: 2 }} />
            </Paper>
          </div>
        </div>
      )}

      {lifelineData && (
        <main className="sc-lifeline-investigation-grid">
          <LifelineCustomerPanel
            data={lifelineData}
            materials={relevantMaterials}
            practiceTracks={relevantPracticeTracks}
            copiedId={copiedId}
            onCopy={handleCopy}
          />

          <div className="sc-lifeline-right-col">
            <LifelineProfileCard
              data={lifelineData}
              showPhone={showPhone}
              onTogglePhone={() => setShowPhone((p) => !p)}
              showEmail={showEmail}
              onToggleEmail={() => setShowEmail((e) => !e)}
              copiedId={copiedId}
              onCopy={handleCopy}
            />

            <LifelineOrdersList
              customerName={lifelineData.name}
              customerEmail={lifelineData.email}
              orders={lifelineData.orders || []}
              pagination={lifelineData.pagination}
              loadingMore={loadingMore}
              onLoadMore={handleLoadMoreOrders}
              copiedId={copiedId}
              onCopy={handleCopy}
            />
          </div>
        </main>
      )}
    </div>
  );
}
