import React, { useEffect, useRef } from 'react';
import { StudentWatermarkOverlay } from './StudentWatermarkOverlay';
import '../../assets/styles/secureViewer.css';
import './SecureCanvasViewer.css';

export const SecureCanvasViewer = ({ contentData, watermarkText }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !contentData) return;

    const ctx = canvas.getContext('2d');
    const width = 850;
    const height = 550;
    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px system-ui';
    ctx.fillText(contentData.title || 'Course Reading View', 40, 50);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px system-ui';
    ctx.fillText(`Edition ${contentData.version || '1.0'}`, 40, 75);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '16px system-ui';
    let lines = [];
    if (Array.isArray(contentData.sections)) {
      lines = contentData.sections;
    } else if (typeof contentData === 'string') {
      lines = contentData.split('\n');
    } else if (contentData.content) {
      lines = String(contentData.content).split('\n');
    }
    let yOffset = 130;

    lines.forEach((line) => {
      ctx.fillText(String(line), 40, yOffset);
      yOffset += 45;
    });

    ctx.save();
    ctx.rotate((-25 * Math.PI) / 180);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.font = 'bold 20px system-ui';

    for (let x = -300; x < width + 400; x += 300) {
      for (let y = -200; y < height + 400; y += 120) {
        ctx.fillText(watermarkText || 'STUDENT • LICENSED COPY', x, y);
      }
    }
    ctx.restore();
  }, [contentData, watermarkText]);

  return (
    <div ref={containerRef} className="drm-canvas-wrapper" style={{ position: 'relative' }}>
      <StudentWatermarkOverlay
        studentLabel={watermarkText || 'STUDENT'}
        theme="dark"
        containerRef={containerRef}
      />
      <canvas ref={canvasRef} className="drm-canvas" />
    </div>
  );
};
