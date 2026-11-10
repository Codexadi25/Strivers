import React from 'react';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import './AuditTable.css';

export default function AuditTable({ logs = [] }) {
  return (
    <Card variant="outlined" className="sc-audit-table-card">
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Event Name</strong></TableCell>
              <TableCell><strong>Initiator (User / Admin)</strong></TableCell>
              <TableCell><strong>Origin IP</strong></TableCell>
              <TableCell><strong>Timestamp</strong></TableCell>
              <TableCell><strong>Detailed Metadata</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No audit events matching filter.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((l, i) => (
                <TableRow key={i} hover>
                  <TableCell>
                    <Chip
                      size="small"
                      label={l.event || l.action}
                      variant="outlined"
                      sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.72rem' }}
                    />
                  </TableCell>
                  <TableCell><strong>{l.userEmail}</strong></TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{l.ip || l.ipAddress}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{l.time}</TableCell>
                  <TableCell>
                    <code className="sc-audit-meta">{JSON.stringify(l.metadata || l.metaData || {})}</code>
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
