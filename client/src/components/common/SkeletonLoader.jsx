import React from 'react';

export const SkeletonLoader = ({ height = '20px', width = '100%', style = {} }) => {
  return (
    <div
      className="skeleton-box"
      style={{
        height,
        width,
        marginBottom: '12px',
        ...style,
      }}
    />
  );
};