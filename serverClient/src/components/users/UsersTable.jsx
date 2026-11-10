import React from 'react';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import './UsersTable.css';

export default function UsersTable({ users = [], onToggleRole, onToggleSubscription, onDeleteUser }) {
  return (
    <Card variant="outlined" className="sc-users-table-card">
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>User / Candidate</strong></TableCell>
              <TableCell><strong>Contact Info</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Classroom Access</strong></TableCell>
              <TableCell><strong>Subscription</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => {
              const isAdmin = u.role === 'admin';
              const enrolled = u.enrolledCourses || [];

              return (
                <TableRow key={u.userId || u._id || u.email} hover>
                  <TableCell>
                    <div className="sc-users-name-wrap">
                      <Avatar sx={{ width: 32, height: 32, bgcolor: isAdmin ? '#7C3AED' : '#2563EB' }}>
                        {isAdmin ? <AdminPanelSettingsIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                      </Avatar>
                      <div>
                        <strong>{u.name || 'Student Candidate'}</strong>
                        <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#64748b' }}>
                          ID: {u.userId}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div><strong>{u.email}</strong></div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{u.phone || '+91 Unspecified'}</div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={u.role ? u.role.toUpperCase() : 'USER'}
                      color={isAdmin ? 'secondary' : 'default'}
                      sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="sc-users-courses-list">
                      {enrolled.length > 0 ? (
                        enrolled.map((c, i) => (
                          <Chip key={i} size="small" variant="outlined" color="primary" label={c.courseId} />
                        ))
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No active courses</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={u.hasActiveSubscription ? '● Active Access' : '○ Free / Inactive'}
                      color={u.hasActiveSubscription ? 'success' : 'default'}
                      variant={u.hasActiveSubscription ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="sc-users-actions">
                      <Button size="small" variant="outlined" onClick={() => onToggleRole(u)}>
                        {isAdmin ? 'Demote to User' : 'Make Admin'}
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color={u.hasActiveSubscription ? 'error' : 'success'}
                        onClick={() => onToggleSubscription(u)}
                      >
                        {u.hasActiveSubscription ? 'Revoke Pass' : 'Grant Pass'}
                      </Button>
                      {onDeleteUser && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => onDeleteUser(u)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
