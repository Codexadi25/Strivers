import React from 'react';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import EditIcon from '@mui/icons-material/Edit';
import './CoursePlanCard.css';

export default function CoursePlanCard({ course, onEdit }) {
  const c = course;
  const rawPaise = c.priceInPaise || Math.round(Number(c.price || 0) * 100);
  const discountPct =
    c.originalPrice && c.originalPrice > c.price
      ? Math.round(((c.originalPrice - c.price) / c.originalPrice) * 100)
      : null;

  const isMasterclass = c.category === 'masterclass' || c.isMasterclass;
  const isChannel = c.category === 'channel' || c.productId === 'channel';

  return (
    <Card variant="outlined" className="sc-product-card">
      <div>
        {c.imageUrl && (
          <img src={c.imageUrl} alt={c.title} className="sc-course-card-thumb" />
        )}
        <div className="sc-product-card-top">
          <div className="sc-product-badges">
            {c.badge && (
              <Chip
                label={c.badge.toUpperCase()}
                size="small"
                className="sc-product-chip-promo"
              />
            )}
            <Chip
              label={isMasterclass ? '@ MASTERCLASS' : isChannel ? 'CHANNEL' : 'COURSE'}
              size="small"
              className={`sc-product-chip-cat ${isMasterclass ? 'cat-masterclass' : isChannel ? 'cat-channel' : 'cat-course'}`}
            />
          </div>
          <span className="sc-product-slug">ID: {c.productId}</span>
        </div>

        <h3 className="sc-product-title">{c.title}</h3>
        <div className="sc-course-meta-chips">
          {c.duration && <Chip size="small" variant="outlined" label={c.duration} />}
          {Array.isArray(c.curriculum) && (
            <Chip size="small" variant="outlined" color="primary" label={`${c.curriculum.length} Modules`} />
          )}
        </div>
        <p className="sc-product-desc">{c.description}</p>

        <div className="sc-product-price-box">
          <div className="sc-product-price-row">
            <span className="sc-product-price-main">₹{c.price}</span>
            {c.originalPrice && <s className="sc-product-price-was">₹{c.originalPrice}</s>}
            {discountPct && <span className="sc-product-discount-tag">{discountPct}% OFF</span>}
          </div>
          <div className="sc-product-price-meta">
            <span>Backend Raw: <code>{rawPaise} paise</code></span>
            <span>•</span>
            <span>
              Status:{' '}
              <strong style={{ color: c.isActive !== false ? '#059669' : '#DC2626' }}>
                ● {c.isActive !== false ? 'Active' : 'Inactive'}
              </strong>
            </span>
          </div>
        </div>

        <ul className="sc-product-features">
          {(c.features || []).slice(0, 6).map((f, i) => (
            <li key={i}>
              <span className="sc-tick-icon">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button
        variant="contained"
        fullWidth
        startIcon={<EditIcon />}
        onClick={() => onEdit(c)}
        className="sc-product-btn-edit"
      >
        Change Price &amp; Details
      </Button>
    </Card>
  );
}

