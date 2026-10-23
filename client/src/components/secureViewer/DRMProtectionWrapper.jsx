import React from 'react';
import { useAntiCapture } from '../../hooks/useAntiCapture';

export const DRMProtectionWrapper = ({ children }) => {
  const { isProtected, setIsProtected } = useAntiCapture();

  return (
    <div className="drm-protected-container">
      {isProtected && (
        <div className="drm-obfuscation-screen" onClick={() => setIsProtected(false)}>
          <h2>Protected Content Hidden</h2>
          <p style={{ marginTop: '8px', color: '#94a3b8' }}>
            Screen capture, developer tools, or tab de-focus detected. Click here to resume.
          </p>
        </div>
      )}
      {children}
    </div>
  );
};