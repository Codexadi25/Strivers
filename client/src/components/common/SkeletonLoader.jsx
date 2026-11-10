import React from 'react';
import './SkeletonLoader.css';

export const SkeletonLoader = ({ height = '20px', width = '100%', style = {} }) => {
  return (
    <div
      className="skeleton-box skeleton-box-dynamic"
      style={{
        height,
        width,
        ...style,
      }}
    />
  );
};
