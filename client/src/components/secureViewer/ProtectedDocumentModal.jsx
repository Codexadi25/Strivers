import React, { useEffect, useState, useMemo } from 'react';
import '../../assets/styles/secureViewer.css';

export function ProtectedDocumentModal({ material, onClose, userEmail }) {
  const [theme, setTheme] = useState('light'); // 'light' (Paper), 'sepia', 'dark'
  const [activeTab, setActiveTab] = useState('viewport'); // 'viewport' (Native Document Engine) | 'canvas' (Canvas DRM)
  const [fontSize, setFontSize] = useState(16); // 14, 16, 18
  const [pdfBlobUrl, setPdfBlobUrl] = useState('');
  const [decodedHtml, setDecodedHtml] = useState('');
  const [decodedText, setDecodedText] = useState('');

  const watermarkLabel = useMemo(() => {
    const email = (userEmail || 'STUDENT').toLowerCase();
    return `${email} • STRIIVERS LICENSED COPY • CONFIDENTIAL`;
  }, [userEmail]);

  // Determine file type strictly
  const fileTypeLower = (material?.fileType || '').toLowerCase();
  const mimeTypeLower = (material?.mimeType || '').toLowerCase();
  const rawData = material?.fileData || '';

  const isPdf = useMemo(() => {
    if (fileTypeLower === 'pdf' || mimeTypeLower === 'application/pdf') return true;
    if (typeof rawData === 'string' && (rawData.startsWith('data:application/pdf') || rawData.startsWith('JVBERi0'))) return true;
    return false;
  }, [fileTypeLower, mimeTypeLower, rawData]);

  const isHtml = useMemo(() => {
    if (isPdf) return false;
    if (fileTypeLower === 'html' || mimeTypeLower.includes('html')) return true;
    if (typeof rawData === 'string' && rawData.startsWith('data:text/html')) return true;
    return false;
  }, [isPdf, fileTypeLower, mimeTypeLower, rawData]);

  // Decode binary / text safely based on format
  useEffect(() => {
    if (!rawData) return;

    const base64Data = rawData.includes(',') ? rawData.split(',')[1] : rawData;

    if (isPdf) {
      try {
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const blob = new Blob([byteNumbers], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);

        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (err) {
        console.error('Failed to create PDF blob:', err);
      }
    } else {
      // Decode HTML / Markdown / Text as UTF-8
      try {
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const text = new TextDecoder('utf-8').decode(byteNumbers);

        if (isHtml || text.includes('<html') || text.includes('<!DOCTYPE') || text.includes('<div style=') || text.includes('<h1>')) {
          setDecodedHtml(text);
        }
        setDecodedText(text);
      } catch {
        try {
          const fallback = atob(base64Data);
          setDecodedHtml(fallback);
          setDecodedText(fallback);
        } catch {
          setDecodedText(material.description || 'Study Guide & Notes');
        }
      }
    }
  }, [rawData, isPdf, isHtml, material]);

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

  // Render Canvas DRM
  useEffect(() => {
    if (activeTab !== 'canvas' || isPdf || !decodedText) return;
    const canvas = document.getElementById('drm-reader-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = 840;
    const rawLines = decodedText.split('\n');
    const wrappedLines = [];
    ctx.font = '15px Inter, system-ui, -apple-system, sans-serif';

    rawLines.forEach((raw) => {
      const line = raw.trim();
      if (!line) {
        wrappedLines.push({ text: '', type: 'empty' });
        return;
      }
      if (line.startsWith('# ')) {
        wrappedLines.push({ text: line.replace('# ', ''), type: 'h1' });
        return;
      }
      if (line.startsWith('## ')) {
        wrappedLines.push({ text: line.replace('## ', ''), type: 'h2' });
        return;
      }
      if (line.startsWith('### ')) {
        wrappedLines.push({ text: line.replace('### ', ''), type: 'h3' });
        return;
      }

      // Clean HTML tags from canvas lines if present
      const cleanLine = line.replace(/<[^>]*>/g, '');
      const words = cleanLine.split(' ');
      let current = '';
      words.forEach((w) => {
        const testLine = current ? current + ' ' + w : w;
        if (ctx.measureText(testLine).width > width - 80) {
          wrappedLines.push({ text: current, type: 'p' });
          current = w;
        } else {
          current = testLine;
        }
      });
      if (current) wrappedLines.push({ text: current, type: 'p' });
    });

    const totalHeight = Math.max(600, wrappedLines.length * 28 + 160);
    canvas.width = width;
    canvas.height = totalHeight;

    const isDark = theme === 'dark';
    const isSepia = theme === 'sepia';

    ctx.fillStyle = isDark ? '#0f172a' : isSepia ? '#faf5eb' : '#ffffff';
    ctx.fillRect(0, 0, width, totalHeight);

    // Top subtle banner
    ctx.fillStyle = isDark ? '#1e293b' : isSepia ? '#f2e8d7' : '#f8fafc';
    ctx.fillRect(0, 0, width, 64);
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    ctx.fillRect(0, 63, width, 1);

    ctx.fillStyle = isDark ? '#38bdf8' : '#2563eb';
    ctx.font = 'bold 16px Inter, system-ui, sans-serif';
    ctx.fillText(material.title || 'Protected Study Material', 32, 38);

    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.fillText('Protected DRM Reader · In-App Only', width - 260, 38);

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

    // Draw watermark
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
  }, [activeTab, decodedText, isPdf, material, theme, watermarkLabel]);

  // Construct styled HTML document for iframe viewport rendering
  const styledHtmlDocument = useMemo(() => {
    if (!decodedHtml && !decodedText) return '';
    const raw = decodedHtml || decodedText;

    const bg = theme === 'dark' ? '#0F172A' : theme === 'sepia' ? '#FAF5EB' : '#FFFFFF';
    const text = theme === 'dark' ? '#E2E8F0' : theme === 'sepia' ? '#382B19' : '#0F172A';
    const border = theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E2E8F0';
    const cardBg = theme === 'dark' ? '#1E293B' : theme === 'sepia' ? '#F4ECDC' : '#F8FAFC';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 32px 36px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', Helvetica, Arial, sans-serif;
            font-size: ${fontSize}px;
            line-height: 1.68;
            color: ${text};
            background-color: ${bg};
            user-select: none;
            -webkit-user-select: none;
          }
          img { max-width: 100%; height: auto; border-radius: 8px; }
          h1, h2, h3, h4 { color: ${theme === 'dark' ? '#38BDF8' : '#1D4ED8'}; margin-top: 24px; margin-bottom: 12px; }
          h1 { font-size: 1.6em; border-bottom: 2px solid ${border}; padding-bottom: 8px; }
          h2 { font-size: 1.3em; }
          h3 { font-size: 1.15em; }
          p { margin: 0 0 16px; }
          ul, ol { margin: 0 0 18px; padding-left: 24px; }
          li { margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.95em; }
          th, td { border: 1px solid ${border}; padding: 10px 14px; text-align: left; }
          th { background: ${cardBg}; font-weight: 700; }
          code { font-family: 'IBM Plex Mono', Consolas, monospace; background: ${cardBg}; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
          pre { background: #0B132B; color: #F8FAFC; padding: 16px; border-radius: 8px; overflow-x: auto; font-family: 'IBM Plex Mono', monospace; }
          pre code { background: transparent; padding: 0; color: inherit; }
          blockquote { border-left: 4px solid #2563eb; margin: 16px 0; padding: 10px 18px; background: ${cardBg}; border-radius: 0 8px 8px 0; }
          @media print { body { display: none !important; } }
        </style>
      </head>
      <body oncontextmenu="return false;">
        ${raw}
      </body>
      </html>
    `;
  }, [decodedHtml, decodedText, theme, fontSize]);

  // Simple Markdown Block Renderer for Plain Text Notes
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
              <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
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
            <h1 key={`h1-${index}`} style={{ fontSize: '1.5rem', fontWeight: 800, margin: '24px 0 12px', color: theme === 'dark' ? '#F8FAFC' : '#0F172A' }}>
              {trimmed.replace('# ', '')}
            </h1>
          );
        } else if (trimmed.startsWith('## ')) {
          elements.push(
            <h2 key={`h2-${index}`} style={{ fontSize: '1.25rem', fontWeight: 700, margin: '20px 0 10px', color: theme === 'dark' ? '#38BDF8' : '#2563EB' }}>
              {trimmed.replace('## ', '')}
            </h2>
          );
        } else if (trimmed.startsWith('### ')) {
          elements.push(
            <h3 key={`h3-${index}`} style={{ fontSize: '1.05rem', fontWeight: 700, margin: '16px 0 8px' }}>
              {trimmed.replace('### ', '')}
            </h3>
          );
        } else {
          elements.push(
            <p key={`p-${index}`} style={{ margin: '0 0 12px', lineHeight: 1.75 }}>
              {trimmed}
            </p>
          );
        }
      }
    });

    flushList('end');
    return elements;
  }

  return (
    <div className="drm-modal-backdrop" onContextMenu={(e) => e.preventDefault()}>
      <div
        className={`drm-reader-window theme-${theme}`}
        style={{
          maxWidth: '1120px',
          width: '96vw',
          maxHeight: '94vh',
          height: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: '16px',
        }}
      >
        {/* TOP CONTROLS & SECURITY TOOLBAR */}
        <div className="drm-reader-toolbar" style={{ flexShrink: 0 }}>
          {/* Document Title & Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>
              {isPdf ? '📄' : isHtml ? '🌐' : material.fileType === 'cheatsheet' ? '⚡' : '📝'}
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
                    background: isPdf
                      ? 'rgba(239, 68, 68, 0.15)'
                      : isHtml
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(59, 130, 246, 0.15)',
                    color: isPdf ? '#DC2626' : isHtml ? '#059669' : '#2563EB',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    textTransform: 'uppercase',
                  }}
                >
                  {isPdf ? 'PDF DOCUMENT' : isHtml ? 'HTML DOCUMENT' : (material.fileType || 'NOTES')}
                </span>
              </div>
              <span style={{ fontSize: '0.74rem', color: theme === 'dark' ? '#94A3B8' : '#64748B' }}>
                🔒 Stored in MongoDB · Anti-Download View-Only DRM Enforced
              </span>
            </div>
          </div>

          {/* Viewer Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Mode Switcher */}
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
                onClick={() => setActiveTab('viewport')}
                style={{
                  background: activeTab === 'viewport' ? (theme === 'dark' ? '#2563EB' : '#FFFFFF') : 'transparent',
                  color: activeTab === 'viewport' ? (theme === 'dark' ? '#FFFFFF' : '#0F172A') : (theme === 'dark' ? '#94A3B8' : '#64748B'),
                  boxShadow: activeTab === 'viewport' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {isPdf ? '📄 PDF Viewport' : isHtml ? '🌐 Web Viewport' : '📖 Reading View'}
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
                🛡️ Canvas DRM
              </button>
            </div>

            {/* Theme Selector (Paper / Sepia / Dark) */}
            {!isPdf && (
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
                  title="Sepia"
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
                  title="Dark"
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
            )}

            {/* Font Size Adjusters for text/html */}
            {!isPdf && (
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
                  title="Decrease font size"
                  onClick={() => setFontSize((s) => Math.max(13, s - 1))}
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
                  title="Increase font size"
                  onClick={() => setFontSize((s) => Math.min(22, s + 1))}
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

            {/* Close Modal Button */}
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

        {/* DOCUMENT READER VIEWPORT (Fills available space) */}
        <div
          className="drm-reader-body"
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            padding: isPdf || isHtml ? '0' : '28px 40px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* FLOATING REPEATING SVG WATERMARK OVERLAY */}
          <svg
            className="drm-watermark-overlay"
            width="100%"
            height="100%"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 25,
            }}
          >
            <defs>
              <pattern
                id="drm-watermark-pattern"
                width="360"
                height="180"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(-22)"
              >
                <text
                  x="20"
                  y="90"
                  fill={
                    theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.06)'
                      : theme === 'sepia'
                      ? 'rgba(120, 70, 30, 0.07)'
                      : 'rgba(71, 85, 105, 0.07)'
                  }
                  fontSize="12"
                  fontFamily="Inter, system-ui, -apple-system, sans-serif"
                  fontWeight="700"
                  letterSpacing="0.8px"
                >
                  {watermarkLabel}
                </text>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#drm-watermark-pattern)" />
          </svg>

          {/* VIEWPORT MODE: PDF, HTML, OR TEXT */}
          {activeTab === 'viewport' ? (
            isPdf ? (
              /* NATIVE HIGH-RES PDF VIEWPORT */
              <div style={{ flex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {pdfBlobUrl ? (
                  <iframe
                    src={`${pdfBlobUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                    title={material.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      flex: 1,
                      border: 'none',
                      background: '#334155',
                    }}
                  />
                ) : (
                  <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
                    <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
                    <p>Loading secure PDF document from MongoDB...</p>
                  </div>
                )}
              </div>
            ) : isHtml ? (
              /* NATIVE HTML WEB VIEWPORT */
              <div style={{ flex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <iframe
                  srcDoc={styledHtmlDocument}
                  title={material.title}
                  sandbox="allow-same-origin allow-scripts"
                  style={{
                    width: '100%',
                    height: '100%',
                    flex: 1,
                    border: 'none',
                    background: theme === 'dark' ? '#0F172A' : theme === 'sepia' ? '#FAF5EB' : '#FFFFFF',
                  }}
                />
              </div>
            ) : (
              /* MARKDOWN / TEXT READING MODE */
              <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
                {material.description && (
                  <div className="drm-callout-box" style={{ marginBottom: '20px' }}>
                    <strong style={{ display: 'block', fontSize: '0.88rem', marginBottom: '4px' }}>
                      Document Instructions:
                    </strong>
                    <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>{material.description}</span>
                  </div>
                )}
                <div className="drm-markdown-content" style={{ maxWidth: 840, margin: '0 auto', fontSize: `${fontSize}px` }}>
                  {renderMarkdownBlocks(decodedText)}
                </div>
              </div>
            )
          ) : (
            /* CANVAS DRM RENDERING */
            <div style={{ flex: 1, overflowY: 'auto', textAlign: 'center', padding: '16px 0' }}>
              {isPdf ? (
                <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', color: '#64748B' }}>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>
                    🔒 Protected PDF Document Mode
                  </p>
                  <p style={{ fontSize: '0.9rem', marginBottom: '18px' }}>
                    PDF documents are rendered in the high-fidelity Document Viewport with continuous floating student watermark overlays.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setActiveTab('viewport')}
                  >
                    Switch to PDF Viewport →
                  </button>
                </div>
              ) : (
                <canvas
                  id="drm-reader-canvas"
                  style={{
                    display: 'inline-block',
                    borderRadius: '10px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  }}
                />
              )}
            </div>
          )}

          {/* SUBTLE FOOTER AUDIT BAR */}
          <div
            style={{
              flexShrink: 0,
              padding: '8px 16px',
              borderTop: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
              background: theme === 'dark' ? '#0F172A' : '#F8FAFC',
              fontSize: '0.74rem',
              color: theme === 'dark' ? '#64748B' : '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 30,
            }}
          >
            <span>🛡️ Strivers Verified Document · Encrypted in MongoDB</span>
            <span>Student Watermark: <strong>{userEmail || 'Student'}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
