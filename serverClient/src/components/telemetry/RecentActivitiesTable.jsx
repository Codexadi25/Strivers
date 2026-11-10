import React, { useState } from 'react';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import './RecentActivitiesTable.css';

export default function RecentActivitiesTable({ activities = [] }) {
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(activities.length / perPage));
  const safePage = Math.min(page, totalPages);
  const displayed = activities.slice((safePage - 1) * perPage, safePage * perPage);

  return (
    <Card variant="outlined" className="sc-activities-card">
      <div className="sc-activities-head">
        <div>
          <h3 className="sc-activities-title">Recent System Activities</h3>
          <p className="sc-activities-sub">
            Live audit stream of payment verifications, session events, and curriculum actions.
          </p>
        </div>

        <div className="sc-activities-pager">
          <Select
            size="small"
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
          >
            <MenuItem value={10}>10 / page</MenuItem>
            <MenuItem value={20}>20 / page</MenuItem>
            <MenuItem value={50}>50 / page</MenuItem>
          </Select>

          <Pagination
            count={totalPages}
            page={safePage}
            onChange={(_, p) => setPage(p)}
            size="small"
            color="primary"
          />
        </div>
      </div>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Event</strong></TableCell>
              <TableCell><strong>User / Email</strong></TableCell>
              <TableCell><strong>IP Address</strong></TableCell>
              <TableCell><strong>Time</strong></TableCell>
              <TableCell><strong>Metadata</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayed.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No recent system activities recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              displayed.map((act, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>
                    <Chip
                      label={act.event || act.action}
                      size="small"
                      variant="outlined"
                      sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.72rem' }}
                    />
                  </TableCell>
                  <TableCell><strong>{act.userEmail}</strong></TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{act.ip || act.ipAddress || '::1'}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{act.time}</TableCell>
                  <TableCell>
                    <code className="sc-activity-meta-code">
                      {JSON.stringify(act.metadata || act.metaData || {})}
                    </code>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
