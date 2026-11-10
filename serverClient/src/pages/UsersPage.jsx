import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import { apiCall } from '../services/api';
import UsersTable from '../components/users/UsersTable';
import './UsersPage.css';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusMsg, setStatusMsg] = useState({ text: '', type: 'success' });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiCall('/users');
      if (res.users) {
        setUsers(res.users);
      }
    } catch (err) {
      setStatusMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showNotice = (text, type = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg({ text: '', type: 'success' }), 4000);
  };

  const handleToggleRole = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    try {
      await apiCall(`/users/${encodeURIComponent(u.userId || u.email)}`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
      });
      showNotice(`✓ User ${u.email} role updated to ${newRole.toUpperCase()}.`);
      fetchUsers();
    } catch (err) {
      showNotice(`Error updating role: ${err.message}`, 'error');
    }
  };

  const handleToggleSubscription = async (u) => {
    const newSub = !u.hasActiveSubscription;
    try {
      await apiCall(`/users/${encodeURIComponent(u.userId || u.email)}`, {
        method: 'PUT',
        body: JSON.stringify({ hasActiveSubscription: newSub }),
      });
      showNotice(`✓ Subscription status updated for ${u.email}.`);
      fetchUsers();
    } catch (err) {
      showNotice(`Error updating subscription: ${err.message}`, 'error');
    }
  };

  const handleDeleteUser = async (u) => {
    try {
      await apiCall(`/users/${encodeURIComponent(u.userId || u.email)}`, {
        method: 'DELETE',
      });
      showNotice(`✓ User ${u.email} removed from directory.`);
      fetchUsers();
    } catch (err) {
      showNotice(`Error removing user: ${err.message}`, 'error');
    }
  };

  const filtered = users.filter((u) => {
    const s = search.toLowerCase();
    return (
      !s ||
      (u.name || '').toLowerCase().includes(s) ||
      (u.email || '').toLowerCase().includes(s) ||
      (u.userId || '').toLowerCase().includes(s)
    );
  });

  return (
    <div className="users-page-root">
      <div className="users-header">
        <div>
          <h2 className="users-title">User Access Control &amp; Member Rights</h2>
          <p className="users-desc">
            Manage student roles, view enrolled masterclasses, and toggle active classroom subscriptions synced live with Student Portal.
          </p>
        </div>

        <TextField
          size="small"
          placeholder="Search candidate by name, email, user ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 280 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </div>

      {statusMsg.text && (
        <Alert severity={statusMsg.type} sx={{ mb: 2 }} onClose={() => setStatusMsg({ text: '', type: 'success' })}>
          {statusMsg.text}
        </Alert>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 0' }}>
          <CircularProgress size={24} />
          <span>Loading users directory...</span>
        </div>
      ) : (
        <UsersTable
          users={filtered}
          onToggleRole={handleToggleRole}
          onToggleSubscription={handleToggleSubscription}
          onDeleteUser={handleDeleteUser}
        />
      )}
    </div>
  );
}
