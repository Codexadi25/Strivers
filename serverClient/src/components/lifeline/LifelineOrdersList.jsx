import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import './LifelineOrdersList.css';

const STATUS_COLOR_MAP = {
  CAPTURED: 'success',
  PAID: 'success',
  REFUNDED: 'info',
  'PAYMENT CANCELED': 'warning',
  FAILED: 'error',
};

export default function LifelineOrdersList({
  customerName,
  customerEmail,
  orders = [],
  pagination,
  loadingMore = false,
  onLoadMore,
  copiedId,
  onCopy,
}) {
  const [billOrder, setBillOrder] = useState(null);
  const [ledgerOrder, setLedgerOrder] = useState(null);
  const [tagTargetOrder, setTagTargetOrder] = useState(null);
  const [newTagText, setNewTagText] = useState('');
  const [customTagsByOrder, setCustomTagsByOrder] = useState({});

  const handleSaveTag = (e) => {
    e.preventDefault();
    const cleaned = newTagText.trim();
    if (!cleaned || !tagTargetOrder) return;
    setCustomTagsByOrder((prev) => ({
      ...prev,
      [tagTargetOrder.orderId]: [...(prev[tagTargetOrder.orderId] || []), cleaned],
    }));
    setNewTagText('');
    setTagTargetOrder(null);
  };

  return (
    <div className="sc-lifeline-orders-stack">
      {orders.length === 0 ? (
        <Card variant="outlined" className="sc-lifeline-order-card">
          <CardContent sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
            No payment orders recorded for this customer yet.
          </CardContent>
        </Card>
      ) : (
        orders.map((order, idx) => {
          const statusUpper = String(order.status || 'UNKNOWN').toUpperCase();
          const chipColor = STATUS_COLOR_MAP[statusUpper] || 'default';
          const customTags = customTagsByOrder[order.orderId] || [];

          return (
            <Card key={order.orderId || idx} variant="outlined" className="sc-lifeline-order-card">
              <CardContent>
                <div className="sc-lifeline-order-header">
                  <div>
                    <div className="sc-lifeline-order-id-row">
                      <h4 className="sc-lifeline-order-id">Order #{order.orderId}</h4>
                      <Tooltip title={copiedId === `order_${order.orderId}` ? 'Copied!' : 'Copy Order ID'}>
                        <IconButton
                          size="small"
                          onClick={() => onCopy(order.orderId, `order_${order.orderId}`)}
                        >
                          <ContentCopyIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </div>
                    <div className="sc-lifeline-order-date">{order.date}</div>
                  </div>
                  <Chip
                    size="small"
                    color={chipColor}
                    label={order.status}
                    sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                  />
                </div>

                <div className="sc-lifeline-order-tags-row">
                  <span className="sc-lifeline-tags-label">Tags:</span>
                  <Chip size="small" label={order.source || 'Direct Web'} variant="outlined" />
                  {order.planId && (
                    <Chip size="small" color="primary" variant="outlined" label={order.planId} />
                  )}
                  {customTags.map((tag, tIdx) => (
                    <Chip key={`${tag}-${tIdx}`} size="small" color="secondary" label={tag} />
                  ))}
                  <Chip
                    size="small"
                    icon={<LocalOfferIcon />}
                    label="+ Add tag"
                    clickable
                    variant="outlined"
                    onClick={() => {
                      setTagTargetOrder(order);
                      setNewTagText('');
                    }}
                  />
                </div>

                <div className="sc-lifeline-order-amount-box">
                  <div>
                    <div className="sc-lifeline-payment-caption">Payment Amount</div>
                    <div className="sc-lifeline-order-amount">
                      {order.currency || '₹'} {order.amount}
                    </div>
                  </div>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Transactions (${order.transactionsCount || 1})`}
                    sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                  />
                </div>

                <div className="sc-lifeline-meta-row">
                  <span>Selected Mode</span>
                  <Chip size="small" label={order.selectedMode || 'Online'} />
                </div>
                <div className="sc-lifeline-meta-row">
                  <span>Paid Via / Channel</span>
                  <Chip size="small" variant="outlined" label={order.paidVia || 'RAZORPAY'} />
                </div>

                <div className="sc-lifeline-order-actions">
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<ReceiptLongIcon />}
                    onClick={() => setBillOrder(order)}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    View Order &amp; Bill
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<CreditCardIcon />}
                    onClick={() => setLedgerOrder(order)}
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                  >
                    Gateway Ledger
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}

      {pagination?.hasMoreOrders && (
        <Button
          variant="outlined"
          fullWidth
          startIcon={<ExpandMoreIcon />}
          disabled={loadingMore}
          onClick={onLoadMore}
          className="sc-lifeline-load-more-btn"
        >
          {loadingMore ? 'Loading Next 3 Orders...' : 'Load Next 3 Orders'}
        </Button>
      )}

      {/* Bill Dialog */}
      <Dialog open={Boolean(billOrder)} onClose={() => setBillOrder(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Order &amp; Invoice Details</DialogTitle>
        <DialogContent dividers>
          {billOrder && (
            <div className="sc-lifeline-dialog-grid">
              <div className="sc-lifeline-dialog-row">
                <span className="sc-lifeline-dialog-key">Order ID</span>
                <span className="sc-lifeline-dialog-val">{billOrder.orderId}</span>
              </div>
              <div className="sc-lifeline-dialog-row">
                <span className="sc-lifeline-dialog-key">Customer</span>
                <span className="sc-lifeline-dialog-val">{customerName}</span>
              </div>
              <div className="sc-lifeline-dialog-row">
                <span className="sc-lifeline-dialog-key">Email</span>
                <span className="sc-lifeline-dialog-val">{customerEmail}</span>
              </div>
              <div className="sc-lifeline-dialog-row">
                <span className="sc-lifeline-dialog-key">Plan / Course</span>
                <span className="sc-lifeline-dialog-val">{billOrder.planId || 'masterclass'}</span>
              </div>
              <div className="sc-lifeline-dialog-row">
                <span className="sc-lifeline-dialog-key">Amount</span>
                <span className="sc-lifeline-dialog-val">
                  {billOrder.currency || '₹'} {billOrder.amount}
                </span>
              </div>
              <div className="sc-lifeline-dialog-row">
                <span className="sc-lifeline-dialog-key">Status</span>
                <span className="sc-lifeline-dialog-val">{billOrder.status}</span>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBillOrder(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Gateway Ledger Dialog */}
      <Dialog open={Boolean(ledgerOrder)} onClose={() => setLedgerOrder(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Gateway Transaction Ledger</DialogTitle>
        <DialogContent dividers>
          {ledgerOrder && (
            <div className="sc-lifeline-dialog-grid">
              <div className="sc-lifeline-dialog-row">
                <span className="sc-lifeline-dialog-key">Order ID</span>
                <span className="sc-lifeline-dialog-val">{ledgerOrder.orderId}</span>
              </div>
              <div className="sc-lifeline-dialog-row">
                <span className="sc-lifeline-dialog-key">Razorpay Txn ID</span>
                <span className="sc-lifeline-dialog-val">{ledgerOrder.txnId || 'N/A'}</span>
              </div>
              <div className="sc-lifeline-dialog-row">
                <span className="sc-lifeline-dialog-key">Receipt / Ref ID</span>
                <span className="sc-lifeline-dialog-val">{ledgerOrder.refId || 'N/A'}</span>
              </div>
              <div className="sc-lifeline-dialog-row">
                <span className="sc-lifeline-dialog-key">Gateway Status</span>
                <span className="sc-lifeline-dialog-val">{ledgerOrder.status}</span>
              </div>
              <div className="sc-lifeline-dialog-row">
                <span className="sc-lifeline-dialog-key">Mode</span>
                <span className="sc-lifeline-dialog-val">{ledgerOrder.selectedMode || 'Online'}</span>
              </div>
              <div className="sc-lifeline-dialog-row">
                <span className="sc-lifeline-dialog-key">Paid Via</span>
                <span className="sc-lifeline-dialog-val">{ledgerOrder.paidVia || 'RAZORPAY'}</span>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLedgerOrder(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Session Tag Dialog */}
      <Dialog open={Boolean(tagTargetOrder)} onClose={() => setTagTargetOrder(null)} maxWidth="xs" fullWidth>
        <form onSubmit={handleSaveTag}>
          <DialogTitle>Add Tag to Order</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              size="small"
              margin="dense"
              label="Tag label (e.g. Verified, Follow-up)"
              value={newTagText}
              onChange={(e) => setNewTagText(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTagTargetOrder(null)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={!newTagText.trim()}>
              Add Tag
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
