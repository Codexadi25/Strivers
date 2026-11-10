import React from 'react';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import './OrdersTable.css';

export default function OrdersTable({ orders = [] }) {
  return (
    <Card variant="outlined" className="sc-orders-table-card">
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Date &amp; Time</strong></TableCell>
              <TableCell><strong>Order ID</strong></TableCell>
              <TableCell><strong>Txn ID (Payment)</strong></TableCell>
              <TableCell><strong>Ref ID (Receipt)</strong></TableCell>
              <TableCell><strong>Customer Email</strong></TableCell>
              <TableCell><strong>Course / Plan</strong></TableCell>
              <TableCell><strong>Amount</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Remark / Diagnostics</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                  No transactions found matching criteria.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o, idx) => {
                const isCaptured = o.status === 'CAPTURED';
                const isCanceled = o.status === 'PAYMENT CANCELED';
                const isRefunded = o.status === 'REFUNDED';
                const chipColor = isCaptured ? 'success' : isRefunded ? 'info' : isCanceled ? 'warning' : 'error';

                return (
                  <TableRow key={o.orderId || idx} hover>
                    <TableCell sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>{o.date}</TableCell>
                    <TableCell>
                      <span className="sc-orders-id-link">{o.orderId}</span>
                    </TableCell>
                    <TableCell>
                      <span className="sc-orders-ref-dim">{o.txnId || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="sc-orders-ref-dim">{o.refId}</span>
                    </TableCell>
                    <TableCell><strong>{o.customerEmail}</strong></TableCell>
                    <TableCell>
                      <Chip size="small" label={o.planId} color="primary" variant="outlined" sx={{ fontSize: '0.7rem', fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>
                      <span className="sc-orders-amount">₹{o.amount}</span>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={o.status} color={chipColor} sx={{ fontWeight: 800, fontSize: '0.7rem' }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.78rem', color: 'text.secondary', maxWidth: 220 }}>
                      {o.remark}
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
