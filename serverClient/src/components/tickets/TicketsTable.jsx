import React from 'react';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import './TicketsTable.css';

export default function TicketsTable({ tickets = [], onResolve }) {
  return (
    <Card variant="outlined" className="sc-tickets-table-card">
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Ticket ID</strong></TableCell>
              <TableCell><strong>Created</strong></TableCell>
              <TableCell><strong>Student Contact</strong></TableCell>
              <TableCell><strong>Order / Txn / Bank UTR</strong></TableCell>
              <TableCell><strong>Amount</strong></TableCell>
              <TableCell><strong>Issue Category</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>SLA Deadline</strong></TableCell>
              <TableCell><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                  No dispute tickets found.
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((t) => {
                const isResolved = t.status === 'resolved';
                return (
                  <TableRow key={t.ticketId || t._id} hover>
                    <TableCell>
                      <span className="sc-ticket-id">{t.ticketId}</span>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                      {new Date(t.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <strong>{t.customerName || 'Student'}</strong>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{t.studentContact}</div>
                    </TableCell>
                    <TableCell>
                      <code style={{ fontSize: '0.76rem' }}>{t.orderId}</code>
                      {t.bankRrn && <span className="sc-ticket-utr">UTR: {t.bankRrn}</span>}
                    </TableCell>
                    <TableCell>
                      <span className="sc-ticket-amount">₹{t.amount}</span>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={t.issueCategory} variant="outlined" sx={{ fontSize: '0.7rem' }} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={t.status}
                        color={isResolved ? 'success' : 'warning'}
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.76rem', color: 'text.secondary' }}>{t.slaDeadline}</TableCell>
                    <TableCell>
                      {!isResolved ? (
                        <Button variant="contained" size="small" onClick={() => onResolve(t.ticketId)}>
                          Resolve
                        </Button>
                      ) : (
                        <Chip size="small" label="✓ Closed" color="success" variant="outlined" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
