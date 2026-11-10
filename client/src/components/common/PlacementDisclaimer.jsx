import React from 'react';
import './PlacementDisclaimer.css';

export const PlacementDisclaimer = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="placement-disclaimer-compact">
        <span className="placement-disclaimer-icon-compact">ℹ️</span>
        <div>
          <strong>Guidance & Preparation Notice:</strong> Our live masterclasses and practice sheets are designed to help and guide students to sharpen their interview, resume, and technical skills. We do not provide job placement guarantees or selection assurances.
        </div>
      </div>
    );
  }

  return (
    <div className="placement-disclaimer-full">
      <div className="placement-disclaimer-icon-badge">
        ⚖️
      </div>
      <div>
        <h4 className="placement-disclaimer-heading">
          Placement Guidance & Mentorship Disclaimer
        </h4>
        <p className="placement-disclaimer-body">
          Strivers provides educational courses, curriculum roadmaps, and mentoring by industry professionals to help candidates prepare for real-world hiring rounds. <strong>We are an education and training platform, not a placement agency or staffing firm.</strong> We do not offer or imply job guarantees, employment assurances, or direct interview appointments. Final candidate selection and offers are strictly decided by the recruiting companies at their sole discretion.
        </p>
      </div>
    </div>
  );
};

export default PlacementDisclaimer;
