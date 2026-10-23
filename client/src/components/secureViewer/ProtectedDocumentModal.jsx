import React, { useEffect, useState, useMemo } from 'react';
import '../../assets/styles/secureViewer.css';

export function ProtectedDocumentModal({ material, onClose, userEmail }) {
  const [decodedContent, setDecodedContent] = useState('');
  const [theme, setTheme] = useState('light'); // 'light' (Paper), 'sepia', 'dark'
  const [activeTab, setActiveTab] = useState('text'); // 'text' (Reading) | 'canvas' (Secure Canvas)
  const [fontSize, setFontSize] = useState(16); // 14, 16, 18

  const watermarkLabel = useMemo(() => {
    const email = (userEmail || 'STUDENT').toLowerCase();
    return `${email} • STRIIVERS LICENSED COPY`;
  }, [userEmail]);

  // Keyboard shortcut interception to block Print, Save, Inspect, Copy
  useEffect(() => {
    function handleKeyDown(e) {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Block Ctrl+P (Print), Ctrl+S (Save), Ctrl+C (Copy), Ctrl+U (View Source)
      if (isCtrlOrMeta && ['p', 's', 'c', 'u'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Block F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Escape key to close modal
      if (e.key === 'Escape') {
        onClose();
      }
    }

    function handleContextMenu(e) {
      e.preventDefault();
      return false;
    }

    function handleDragStart(e) {
      e.preventDefault();
      return false;
    }

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('dragstart', handleDragStart, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('dragstart', handleDragStart, true);
    };
  }, [onClose]);

  // Decode Base64 content stored in MongoDB
  useEffect(() => {
    if (!material?.fileData) return;
    try {
      const rawB64 = material.fileData.includes(',')
        ? material.fileData.split(',')[1]
        : material.fileData;
      const decoded = decodeURIComponent(
        atob(rawB64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      setDecodedContent(decoded);
    } catch {
      try {
        const rawB64 = material.fileData.includes(',')
          ? material.fileData.split(',')[1]
          : material.fileData;
        setDecodedContent(atob(rawB64));
      } catch {
        setDecodedContent(material.description || 'Confidential Study Guide');
      }
    }
  }, [material]);

  // Render Canvas with High-DPI scaling and clean watermark
  useEffect(() => {
    if (activeTab !== 'canvas' || !decodedContent) return;
    const canvas = document.getElementById('drm-reader-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = 840;

    const rawLines = decodedContent.split('\n');
    const wrappedLines = [];
    ctx.font = '15px Inter, system-ui, -apple-system, sans-serif';

    rawLines.forEach((line) => {
      if (!line) {
        wrappedLines.push({ text: '', type: 'empty' });
        return;
      }
      if (line.startsWith('# ')) {
        wrappedLines.push({ text: line.replace('# ', ''), type: 'h1' });
      } else if (line.startsWith('## ')) {
        wrappedLines.push({ text: line.replace('## ', ''), type: 'h2' });
      } else if (line.startsWith('### ')) {
        wrappedLines.push({ text: line.replace('### ', ''), type: 'h3' });
      } else {
        const words = line.split(' ');
        let currentLine = '';
        for (let i = 0; i < words.length; i++) {
          const testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
          const metrics = ctx.measureText(testLine);
          if (metrics.width > 740 && i > 0) {
            wrappedLines.push({ text: currentLine, type: 'p' });
            currentLine = words[i];
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) wrappedLines.push({ text: currentLine, type: 'p' });
      }
    });

    let totalHeight = 120;
    wrappedLines.forEach((l) => {
      if (l.type === 'h1') totalHeight += 52;
      else if (l.type === 'h2') totalHeight += 42;
      else if (l.type === 'h3') totalHeight += 36;
      else if (l.type === 'empty') totalHeight += 18;
      else totalHeight += 26;
    });
    totalHeight = Math.max(totalHeight, 720);

    // High-DPI support (2x resolution)
    const dpr = 2;
    canvas.width = width * dpr;
    canvas.height = totalHeight * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${totalHeight}px`;

    ctx.scale(dpr, dpr);

    // Canvas Background depending on theme
    const isDark = theme === 'dark';
    const isSepia = theme === 'sepia';

    ctx.fillStyle = isDark ? '#0f172a' : isSepia ? '#faf5eb' : '#ffffff';
    ctx.fillRect(0, 0, width, totalHeight);

    // Top subtle banner
    ctx.fillStyle = isDark ? '#1e293b' : isSepia ? '#f2e8d7' : '#f8fafc';
    ctx.fillRect(0, 0, width, 64);
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    ctx.fillRect(0, 63, width, 1);

    // Title in header
    ctx.fillStyle = isDark ? '#38bdf8' : '#2563eb';
    ctx.font = 'bold 16px Inter, system-ui, sans-serif';
    ctx.fillText(material.title || 'Protected Study Material', 32, 38);

    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.fillText('Protected DRM Reader · In-App Only', width - 260, 38);

    // Draw document lines
    let y = 100;
    wrappedLines.forEach((l) => {
      if (l.type === 'h1') {
        ctx.fillStyle = isDark ? '#f8fafc' : isSepia ? '#2c1e0e' : '#0f172a';
        ctx.font = 'bold 22px Inter, system-ui, sans-serif';
        y += 18;
        ctx.fillText(l.text, 36, y);
        y += 34;
      } else if (l.type === 'h2') {
        ctx.fillStyle = isDark ? '#38bdf8' : isSepia ? '#9a3412' : '#1d4ed8';
        ctx.font = 'bold 17px Inter, system-ui, sans-serif';
        y += 12;
        ctx.fillText(l.text, 36, y);
        y += 28;
      } else if (l.type === 'h3') {
        ctx.fillStyle = isDark ? '#cbd5e1' : isSepia ? '#451a03' : '#334155';
        ctx.font = 'bold 15px Inter, system-ui, sans-serif';
        y += 8;
        ctx.fillText(l.text, 36, y);
        y += 24;
      } else if (l.type === 'empty') {
        y += 16;
      } else {
        ctx.fillStyle = isDark ? '#e2e8f0' : isSepia ? '#382b19' : '#334155';
        ctx.font = '14.5px Inter, system-ui, sans-serif';
        ctx.fillText(l.text, 36, y);
        y += 24;
      }
    });

    // Draw subtle, elegant watermark across canvas (non-intrusive)
    ctx.save();
    ctx.rotate((-22 * Math.PI) / 180);
    ctx.fillStyle = isDark
      ? 'rgba(255, 255, 255, 0.045)'
      : isSepia
      ? 'rgba(120, 70, 30, 0.05)'
      : 'rgba(71, 85, 105, 0.05)';
    ctx.font = '500 13px Inter, system-ui, sans-serif';

    const stepX = 320;
    const stepY = 160;
    for (let x = -400; x < width + 700; x += stepX) {
      for (let yPos = -300; yPos < totalHeight + 700; yPos += stepY) {
        ctx.fillText(watermarkLabel, x, yPos);
      }
    }
    ctx.restore();
  }, [activeTab, decodedContent, material, theme, watermarkLabel]);

  // Render parsed markdown for Reading Mode
  function renderMarkdownBlocks(content) {
    if (!content) return null;
    const lines = content.split('\n');
    const elements = [];
    let currentList = [];

    const flushList = (key) => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`ul-${key}`} style={{ margin: '0 0 16px', paddingLeft: '24px' }}>
            {currentList.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '6px' }}>
                {renderInlineFormatting(item)}
              </li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        currentList.push(trimmed.slice(2));
      } else {
        flushList(index);

        if (!trimmed) {
          elements.push(<div key={`empty-${index}`} style={{ height: '10px' }} />);
        } else if (trimmed.startsWith('# ')) {
          elements.push(
            <h1
              key={`h1-${index}`}
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                margin: '28px 0 12px',
                paddingBottom: '8px',
                borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
                color: theme === 'dark' ? '#F8FAFC' : theme === 'sepia' ? '#2C1E0E' : '#0F172A',
              }}
            >
              {trimmed.replace('# ', '')}
            </h1>
          );
        } else if (trimmed.startsWith('## ')) {
          elements.push(
            <h2
              key={`h2-${index}`}
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                margin: '22px 0 10px',
                color: theme === 'dark' ? '#38BDF8' : theme === 'sepia' ? '#9A3412' : '#2563EB',
              }}
            >
              {trimmed.replace('## ', '')}
            </h2>
          );
        } else if (trimmed.startsWith('### ')) {
          elements.push(
            <h3
              key={`h3-${index}`}
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                margin: '18px 0 8px',
                color: theme === 'dark' ? '#E2E8F0' : theme === 'sepia' ? '#451A03' : '#1E293B',
              }}
            >
              {trimmed.replace('### ', '')}
            </h3>
          );
        } else if (trimmed.startsWith('---')) {
          elements.push(
            <hr
              key={`hr-${index}`}
              style={{
                border: 'none',
                borderTop: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
                margin: '24px 0',
              }}
            />
          );
        } else {
          elements.push(
            <p
              key={`p-${index}`}
              style={{
                margin: '0 0 12px',
                lineHeight: 1.75,
                color: theme === 'dark' ? '#CBD5E1' : theme === 'sepia' ? '#3B2D18' : '#334155',
              }}
            >
              {renderInlineFormatting(trimmed)}
            </p>
          );
        }
      }
    });

    flushList('end');
    return elements;
  }

  // Simple inline parser for **bold** and *italic*
  function renderInlineFormatting(text) {
    if (!text) return '';
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} style={{ fontStyle: 'italic' }}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
  }

  return (
    <div className="drm-modal-backdrop" onContextMenu={(e) => e.preventDefault()}>
      <div className={`drm-reader-window theme-${theme}`}>
        {/* CLEAN TOP TOOLBAR */}
        <div className="drm-reader-toolbar">
          {/* Document Title & Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.35rem' }}>
              {material.fileType === 'cheatsheet' ? '⚡' : material.fileType === 'pdf' ? '📄' : '📝'}
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: theme === 'dark' ? '#F8FAFC' : theme === 'sepia' ? '#2C1E0E' : '#0F172A',
                  }}
                >
                  {material.title}
                </h3>
                <span
                  style={{
                    background: theme === 'dark' ? 'rgba(56, 189, 248, 0.15)' : '#EFF6FF',
                    color: theme === 'dark' ? '#38BDF8' : '#2563EB',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    textTransform: 'uppercase',
                  }}
                >
                  {material.fileType || 'Notes'}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                🔒 View-Only Study Document · Download Prohibited
              </span>
            </div>
          </div>

          {/* Controls: Mode, Theme, Font Size & Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* View Mode Toggle */}
            <div
              style={{
                background: theme === 'dark' ? '#1E293B' : theme === 'sepia' ? '#EAE0CF' : '#F1F5F9',
                padding: '3px',
                borderRadius: '8px',
                display: 'inline-flex',
                gap: '2px',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                style={{
                  background: activeTab === 'text' ? (theme === 'dark' ? '#2563EB' : '#FFFFFF') : 'transparent',
                  color: activeTab === 'text' ? (theme === 'dark' ? '#FFFFFF' : '#0F172A') : (theme === 'dark' ? '#94A3B8' : '#64748B'),
                  boxShadow: activeTab === 'text' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                Reading Mode
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('canvas')}
                style={{
                  background: activeTab === 'canvas' ? (theme === 'dark' ? '#2563EB' : '#FFFFFF') : 'transparent',
                  color: activeTab === 'canvas' ? (theme === 'dark' ? '#FFFFFF' : '#0F172A') : (theme === 'dark' ? '#94A3B8' : '#64748B'),
                  boxShadow: activeTab === 'canvas' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                Canvas DRM
              </button>
            </div>

            {/* Theme Selector */}
            <div
              style={{
                background: theme === 'dark' ? '#1E293B' : theme === 'sepia' ? '#EAE0CF' : '#F1F5F9',
                padding: '3px',
                borderRadius: '8px',
                display: 'inline-flex',
                gap: '2px',
              }}
            >
              <button
                type="button"
                title="Clean Paper (Light)"
                onClick={() => setTheme('light')}
                style={{
                  background: theme === 'light' ? '#FFFFFF' : 'transparent',
                  color: theme === 'light' ? '#0F172A' : '#64748B',
                  boxShadow: theme === 'light' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  border: 'none',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                ☀️ Paper
              </button>
              <button
                type="button"
                title="Sepia (Eye Comfort)"
                onClick={() => setTheme('sepia')}
                style={{
                  background: theme === 'sepia' ? '#FFFFFF' : 'transparent',
                  color: theme === 'sepia' ? '#9A3412' : '#64748B',
                  boxShadow: theme === 'sepia' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  border: 'none',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                📜 Sepia
              </button>
              <button
                type="button"
                title="Dark (Night)"
                onClick={() => setTheme('dark')}
                style={{
                  background: theme === 'dark' ? '#2563EB' : 'transparent',
                  color: theme === 'dark' ? '#FFFFFF' : '#64748B',
                  boxShadow: theme === 'dark' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  border: 'none',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                🌙 Dark
              </button>
            </div>

            {/* Font Size Adjusters for Reading Mode */}
            {activeTab === 'text' && (
              <div
                style={{
                  background: theme === 'dark' ? '#1E293B' : theme === 'sepia' ? '#EAE0CF' : '#F1F5F9',
                  padding: '3px',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  gap: '2px',
                }}
              >
                <button
                  type="button"
                  title="Smaller text"
                  onClick={() => setFontSize((s) => Math.max(14, s - 1))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '4px 8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: theme === 'dark' ? '#CBD5E1' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  A-
                </button>
                <button
                  type="button"
                  title="Larger text"
                  onClick={() => setFontSize((s) => Math.min(20, s + 1))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '4px 8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: theme === 'dark' ? '#CBD5E1' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  A+
                </button>
              </div>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span>✕</span>
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* DOCUMENT READER BODY */}
        <div className="drm-reader-body" style={{ fontSize: `${fontSize}px` }}>
          {/* REFINED SVG WATERMARK OVERLAY (Discrete, Clean & Non-Cluttered) */}
          <svg className="drm-watermark-overlay" width="100%" height="100%">
            <defs>
              <pattern
                id="drm-watermark-pattern"
                width="340"
                height="170"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(-22)"
              >
                <text
                  x="20"
                  y="90"
                  fill={
                    theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : theme === 'sepia'
                      ? 'rgba(120, 70, 30, 0.055)'
                      : 'rgba(71, 85, 105, 0.055)'
                  }
                  fontSize="12.5"
                  fontFamily="Inter, system-ui, -apple-system, sans-serif"
                  fontWeight="600"
                  letterSpacing="0.8px"
                >
                  {watermarkLabel}
                </text>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#drm-watermark-pattern)" />
          </svg>

          {/* Header Verification Seal */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              borderRadius: '8px',
              background: theme === 'dark' ? 'rgba(30, 41, 59, 0.6)' : theme === 'sepia' ? 'rgba(235, 220, 197, 0.5)' : '#F8FAFC',
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E2E8F0',
              marginBottom: '28px',
              fontSize: '0.78rem',
              color: theme === 'dark' ? '#94A3B8' : '#64748B',
            }}
          >
            <span>🛡️ Official Strivers Study Material · Confidential</span>
            <span>Licensed to: <strong>{userEmail || 'Student'}</strong></span>
          </div>

          {activeTab === 'canvas' ? (
            /* CANVAS DRM RENDERING */
            <div style={{ maxWidth: '100%', overflowX: 'auto', textAlign: 'center', padding: '10px 0' }}>
              <canvas
                id="drm-reader-canvas"
                style={{
                  display: 'inline-block',
                  borderRadius: '10px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                }}
              />
            </div>
          ) : (
            /* FORMATTED INTERACTIVE READING MODE (Clean Paper Typography) */
            <div className="drm-markdown-content" style={{ maxWidth: 820, margin: '0 auto' }}>
              {material.description && (
                <div className="drm-callout-box">
                  <strong style={{ display: 'block', fontSize: '0.88rem', marginBottom: '4px' }}>
                    Document Summary & Instructions:
                  </strong>
                  <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>
                    {material.description}
                  </span>
                </div>
              )}

              {renderMarkdownBlocks(decodedContent)}
            </div>
          )}

          {/* Footer Security Notice */}
          <div
            style={{
              marginTop: '40px',
              paddingTop: '20px',
              borderTop: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
              textAlign: 'center',
              fontSize: '0.75rem',
              color: theme === 'dark' ? '#64748B' : '#94A3B8',
            }}
          >
            🔒 Protected by Strivers In-App DRM Architecture · Watermarked for {userEmail || 'Student'} · Unauthorized distribution, downloading, or printing is strictly prohibited.
          </div>
        </div>
      </div>
    </div>
  );
}
