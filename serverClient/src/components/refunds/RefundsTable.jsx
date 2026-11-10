import React from 'react';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import './RefundsTable.css';

export default function RefundsTable({ refunds = [] }) {
  return (
    <Card variant="outlined" className="sc-refunds-table-card">
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Refund ID</strong></TableCell>
              <TableCell><strong>Order Reference</strong></TableCell>
              <TableCell><strong>Student Email</strong></TableCell>
              <TableCell><strong>Amount</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Bank ARN / UTR</strong></TableCell>
              <TableCell><strong>Processed Date</strong></TableCell>
              <TableCell><strong>Reconciliation Mode</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {refunds.map((r) => (
              <TableRow key={r.refundId} hover>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{r.refundId}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', color: '#2563eb' }}>{r.orderId}</TableCell>
                <TableCell><strong>{r.customerEmail}</strong></TableCell>
                <TableCell><strong>₹{r.amount}</strong></TableCell>
                <TableCell>
                  <Chip size="small" color="success" label={`● ${r.status}`} sx={{ fontWeight: 800, fontSize: '0.7rem' }} />
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{r.arn}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{r.date}</TableCell>
                <TableCell><strong>{r.mode}</strong></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
