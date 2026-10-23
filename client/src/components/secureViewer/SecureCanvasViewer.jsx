import React, { useEffect, useRef } from 'react';

export const SecureCanvasViewer = ({ contentData, watermarkText }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !contentData) return;

    const ctx = canvas.getContext('2d');
    const width = 850;
    const height = 550;
    canvas.width = width;
    canvas.height = height;

    // Draw Dark Card Canvas Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Dynamic Title
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px system-ui';
    ctx.fillText(contentData.title || 'Secured Data Stream', 40, 50);

    ctx.fillStyle = '#64748b';
    ctx.font = '14px system-ui';
    ctx.fillText(`Version: ${contentData.version || '1.0'} | Realtime Buffer`, 40, 75);

    // Draw Content Paragraphs
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '16px system-ui';
    const lines = contentData.sections || [];
    let yOffset = 130;

    lines.forEach((line) => {
      ctx.fillText(line, 40, yOffset);
      yOffset += 45;
    });

    // Dynamic Diagonal Watermark to deter photo capture by physical camera
    ctx.save();
    ctx.rotate((-25 * Math.PI) / 180);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.font = 'bold 20px system-ui';

    for (let x = -300; x < width + 400; x += 300) {
      for (let y = -200; y < height + 400; y += 120) {
        ctx.fillText(watermarkText || 'CONFIDENTIAL - LICENSED', x, y);
      }
    }
    ctx.restore();
  }, [contentData, watermarkText]);

  return (
    <div className="drm-canvas-wrapper">
      <canvas ref={canvasRef} className="drm-canvas" />
    </div>
  );
};