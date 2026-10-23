import React from 'react';

const COMPANIES = [
  {
    name: 'Zomato',
    logoSrc: `${process.env.PUBLIC_URL || ''}/assets/companies/zomato.svg`,
    style: { height: 40},
  },
  {
    name: 'Blinkit',
    logoSrc: `${process.env.PUBLIC_URL || ''}/assets/companies/blinkit.svg`,
    style: { height: 40},
  },
  {
    name: 'Coforge',
    logoSrc: `${process.env.PUBLIC_URL || ''}/assets/companies/coforge.svg`,
    style: { height: 40},
  },
  {
    name: 'Flipkart',
    logoSrc: `${process.env.PUBLIC_URL || ''}/assets/companies/flipkart.svg`,
    style: { height: 40},
  },
  {
    name: 'Amazon',
    logoSrc: `${process.env.PUBLIC_URL || ''}/assets/companies/amazon.svg`,
    style: { height: 40}
  },
  {
    name: 'American Express',
    logoSrc: `${process.env.PUBLIC_URL || ''}/assets/companies/american-express.svg`,
    style: { height: 40}
  },
  {
    name: 'Teleperformance',
    logoSrc: `${process.env.PUBLIC_URL || ''}/assets/companies/teleperformance.svg`,
    style: { height: 40}
  },
  {
    name: 'Cognizant',
    logoSrc: `${process.env.PUBLIC_URL || ''}/assets/companies/cognizant.svg`,
    style: { height: 40}
  },
  {
    name: 'Genpact',
    logoSrc: `${process.env.PUBLIC_URL || ''}/assets/companies/genpact.png`,
    style: { height: 40}
  },
  {
    name: 'Accenture',
    logoSrc: `${process.env.PUBLIC_URL || ''}/assets/companies/accenture.svg`,
    style: { height: 40}
  },
  {
    name: 'TCS',
    logoSrc: `${process.env.PUBLIC_URL || ''}/assets/companies/tcs.svg`,
    style: { height: 40}
  },
  {
    name: 'W3Villa',
    logoSrc: `${process.env.PUBLIC_URL || ''}/assets/companies/w3villa.webp`,
    style: { height: 40}
  },
];

export const CompanyMarquee = ({ title = 'Mentors from India’s Leading Tech Teams' }) => {
  return (
    <div className="marquee-wrapper-section">
      {title && (
        <div className="marquee-header-row">
          <span className="marquee-flashing-badge">MENTOR TRACK RECORD</span>
          <h3 className="marquee-title">{title}</h3>
          <p className="marquee-subtitle">
            Learn directly from mentors who have cracked interviews and worked with top industry organizations:
          </p>
        </div>
      )}

      {/* Ribbon Marquee running in a continuous infinite right-to-left loop */}
      <div className="marquee-ribbon-container">
        <div className="marquee-track">
          {/* First loop instance */}
          <div className="marquee-content-group">
            {COMPANIES.map((c, idx) => (
              <div
                key={`c1-${idx}`}
                className="company-pill-item"
                title={c.name}
              >
                <img
                  src={c.logoSrc}
                  alt={`${c.name} logo`}
                  className="company-original-logo-img"
                  style={{
                    objectFit: 'contain',
                    display: 'block',
                    ...c.style,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Second duplicate instance for seamless continuous loop */}
          <div className="marquee-content-group" aria-hidden="true">
            {COMPANIES.map((c, idx) => (
              <div
                key={`c2-${idx}`}
                className="company-pill-item"
                title={c.name}
              >
                <img
                  src={c.logoSrc}
                  alt={`${c.name} logo`}
                  className="company-original-logo-img"
                  style={{
                    objectFit: 'contain',
                    display: 'block',
                    ...c.style,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyMarquee;
