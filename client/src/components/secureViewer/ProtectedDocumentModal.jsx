import React, { useEffect, useState, useMemo, useRef } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import TextDecreaseIcon from '@mui/icons-material/TextDecrease';
import TextIncreaseIcon from '@mui/icons-material/TextIncrease';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { StudentWatermarkOverlay } from './StudentWatermarkOverlay';
import '../../assets/styles/secureViewer.css';
import './ProtectedDocumentModal.css';

export function ProtectedDocumentModal({ material, onClose, userEmail }) {
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('viewport');
  const [fontSize, setFontSize] = useState(16);
  const [pdfBlobUrl, setPdfBlobUrl] = useState('');
  const [decodedHtml, setDecodedHtml] = useState('');
  const [decodedText, setDecodedText] = useState('');
  const viewerBodyRef = useRef(null);

  const studentIdentifier = (userEmail || 'STUDENT').trim();
  const watermarkLabel = useMemo(
    () => `${studentIdentifier.toUpperCase()} • STRIVERS LICENSED COPY`,
    [studentIdentifier]
  );

  const fileTypeLower = (material?.fileType || '').toLowerCase();
  const mimeTypeLower = (material?.mimeType || '').toLowerCase();
  const rawData = material?.fileData || '';

  const isPdf = useMemo(() => {
    if (fileTypeLower === 'pdf' || mimeTypeLower === 'application/pdf') return true;
    if (
      typeof rawData === 'string' &&
      (rawData.startsWith('data:application/pdf') || rawData.startsWith('JVBERi0'))
    ) {
      return true;
    }
    return false;
  }, [fileTypeLower, mimeTypeLower, rawData]);

  const isHtml = useMemo(() => {
    if (isPdf) return false;
    if (fileTypeLower === 'html' || mimeTypeLower.includes('html')) return true;
    if (typeof rawData === 'string' && rawData.startsWith('data:text/html')) return true;
    return false;
  }, [isPdf, fileTypeLower, mimeTypeLower, rawData]);

  useEffect(() => {
    if (!rawData) return undefined;
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
        return () => URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Failed to prepare PDF view:', err);
      }
      return undefined;
    }

    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const text = new TextDecoder('utf-8').decode(byteNumbers);
      if (
        isHtml ||
        text.includes('<html') ||
        text.includes('<!DOCTYPE') ||
        text.includes('<div style=') ||
        text.includes('<h1>')
      ) {
        setDecodedHtml(text);
      }
      setDecodedText(text);
    } catch {
      try {
        const fallback = atob(base64Data);
        setDecodedHtml(fallback);
        setDecodedText(fallback);
      } catch {
        setDecodedText(material?.description || 'Study Guide & Notes');
      }
    }
    return undefined;
  }, [rawData, isPdf, isHtml, material]);

  useEffect(() => {
    function handleKeyDown(e) {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      if (isCtrlOrMeta && ['p', 's', 'c', 'u'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      if (e.key === 'Escape') {
        onClose();
      }
      return undefined;
    }

    function preventAction(e) {
      e.preventDefault();
      return false;
    }

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', preventAction, true);
    window.addEventListener('dragstart', preventAction, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', preventAction, true);
      window.removeEventListener('dragstart', preventAction, true);
    };
  }, [onClose]);

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
      const cleanLine = line.replace(/<[^>]*>/g, '');
      const words = cleanLine.split(' ');
      let current = '';
      words.forEach((w) => {
        const testLine = current ? `${current} ${w}` : w;
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

    ctx.fillStyle = isDark ? '#1e293b' : isSepia ? '#f2e8d7' : '#f8fafc';
    ctx.fillRect(0, 0, width, 64);

    ctx.fillStyle = isDark ? '#38bdf8' : '#2563eb';
    ctx.font = 'bold 16px Inter, system-ui, sans-serif';
    ctx.fillText(material.title || 'Course Reading View', 32, 38);

    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.fillText('Licensed Student Reading Mode', width - 220, 38);

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

    ctx.save();
    ctx.rotate((-22 * Math.PI) / 180);
    ctx.fillStyle = isDark
      ? 'rgba(255, 255, 255, 0.055)'
      : isSepia
      ? 'rgba(120, 70, 30, 0.06)'
      : 'rgba(71, 85, 105, 0.06)';
    ctx.font = '500 13px Inter, system-ui, sans-serif';

    for (let x = -400; x < width + 700; x += 320) {
      for (let yPos = -300; yPos < totalHeight + 700; yPos += 160) {
        ctx.fillText(watermarkLabel, x, yPos);
      }
    }
    ctx.restore();
  }, [activeTab, decodedText, isPdf, material, theme, watermarkLabel]);

  const styledHtmlDocument = useMemo(() => {
    if (!decodedHtml && !decodedText) return '';
    const raw = decodedHtml || decodedText;
    const bg = theme === 'dark' ? '#0F172A' : theme === 'sepia' ? '#FAF5EB' : '#FFFFFF';
    const text = theme === 'dark' ? '#E2E8F0' : theme === 'sepia' ? '#382B19' : '#0F172A';
    const border = theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E2E8F0';
    const cardBg = theme === 'dark' ? '#1E293B' : theme === 'sepia' ? '#F4ECDC' : '#F8FAFC';

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif; font-size: ${fontSize}px; line-height: 1.65; color: ${text}; background-color: ${bg}; user-select: none; -webkit-user-select: none; }
      img { max-width: 100%; height: auto; border-radius: 8px; }
      h1, h2, h3, h4 { color: ${theme === 'dark' ? '#38BDF8' : '#1D4ED8'}; margin-top: 22px; margin-bottom: 10px; }
      h1 { font-size: 1.5em; border-bottom: 1px solid ${border}; padding-bottom: 6px; }
      p { margin: 0 0 14px; }
      ul, ol { margin: 0 0 16px; padding-left: 22px; }
      table { width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 0.92em; }
      th, td { border: 1px solid ${border}; padding: 8px 12px; text-align: left; }
      th { background: ${cardBg}; font-weight: 700; }
      @media print { body { display: none !important; } }
    </style></head><body oncontextmenu="return false;">${raw}</body></html>`;
  }, [decodedHtml, decodedText, theme, fontSize]);

  function renderMarkdownBlocks(content) {
    if (!content) return null;
    const lines = content.split('\n');
    const elements = [];
    let currentList = [];

    const flushList = (key) => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`ul-${key}`} className="drm-md-ul">
            {currentList.map((item, idx) => (
              <li key={idx} className="drm-md-li">
                {item}
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
          elements.push(<div key={`empty-${index}`} className="drm-md-spacer" />);
        } else if (trimmed.startsWith('# ')) {
          elements.push(
            <h1 key={`h1-${index}`} className="drm-md-h1">
              {trimmed.replace('# ', '')}
            </h1>
          );
        } else if (trimmed.startsWith('## ')) {
          elements.push(
            <h2 key={`h2-${index}`} className="drm-md-h2">
              {trimmed.replace('## ', '')}
            </h2>
          );
        } else if (trimmed.startsWith('### ')) {
          elements.push(
            <h3 key={`h3-${index}`} className="drm-md-h3">
              {trimmed.replace('### ', '')}
            </h3>
          );
        } else {
          elements.push(
            <p key={`p-${index}`} className="drm-md-p">
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
      <div className={`drm-reader-window theme-${theme} drm-reader-window-layout`}>
        {/* COMPACT MINIMAL TOOLBAR */}
        <div className="drm-reader-toolbar drm-toolbar-shrink">
          <div className="drm-brand-row">
            {isPdf ? (
              <PictureAsPdfOutlinedIcon className="drm-brand-icon" />
            ) : isHtml ? (
              <LanguageOutlinedIcon className="drm-brand-icon" />
            ) : (
              <DescriptionOutlinedIcon className="drm-brand-icon" />
            )}
            <div className="drm-title-group">
              <h3 className="drm-doc-title">{material?.title || 'Study Material'}</h3>
              <span className={`drm-type-pill ${isPdf ? 'is-pdf' : isHtml ? 'is-html' : ''}`}>
                {isPdf ? 'PDF' : isHtml ? 'GUIDE' : material?.fileType || 'NOTES'}
              </span>
            </div>
          </div>

          <div className="drm-controls-wrap">
            {/* Desktop Mode Switcher (Hidden on smaller devices for minimal UI) */}
            <div className="drm-segmented-bar drm-mobile-hide">
              <button
                type="button"
                onClick={() => setActiveTab('viewport')}
                className={`drm-seg-btn ${activeTab === 'viewport' ? 'is-active' : ''}`}
              >
                Reading View
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('canvas')}
                className={`drm-seg-btn ${activeTab === 'canvas' ? 'is-active' : ''}`}
              >
                Board View
              </button>
            </div>

            {!isPdf && (
              <>
                <div className="drm-segmented-bar drm-mobile-hide">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`drm-seg-btn ${theme === 'light' ? 'is-active' : ''}`}
                  >
                    Paper
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('sepia')}
                    className={`drm-seg-btn ${theme === 'sepia' ? 'is-active' : ''}`}
                  >
                    Sepia
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`drm-seg-btn ${theme === 'dark' ? 'is-active' : ''}`}
                  >
                    Dark
                  </button>
                </div>

                <Tooltip title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
                  <IconButton
                    size="small"
                    aria-label="toggle reader theme"
                    onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                    className="drm-icon-control"
                  >
                    {theme === 'dark' ? (
                      <LightModeOutlinedIcon fontSize="small" />
                    ) : (
                      <DarkModeOutlinedIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>

                <IconButton
                  size="small"
                  aria-label="decrease font size"
                  onClick={() => setFontSize((s) => Math.max(13, s - 1))}
                  className="drm-icon-control drm-mobile-hide"
                >
                  <TextDecreaseIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label="increase font size"
                  onClick={() => setFontSize((s) => Math.min(22, s + 1))}
                  className="drm-icon-control drm-mobile-hide"
                >
                  <TextIncreaseIcon fontSize="small" />
                </IconButton>
              </>
            )}

            <IconButton
              size="small"
              aria-label="Close document reader"
              onClick={onClose}
              className="drm-close-icon-btn"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </div>

        {/* DOCUMENT VIEWPORT */}
        <div
          ref={viewerBodyRef}
          className={`drm-reader-body drm-reader-body-layout ${isPdf || isHtml ? 'is-frame' : ''}`}
        >
          {/* DEFAULT IRREMOVABLE STUDENT WATERMARK */}
          <StudentWatermarkOverlay
            studentLabel={studentIdentifier}
            theme={theme}
            containerRef={viewerBodyRef}
          />

          {activeTab === 'viewport' ? (
            isPdf ? (
              <div className="drm-frame-container">
                {pdfBlobUrl ? (
                  <iframe
                    src={`${pdfBlobUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                    title={material?.title || 'Study Document'}
                    className="drm-pdf-iframe"
                  />
                ) : (
                  <div className="drm-loading-pdf">
                    <div className="spinner drm-loading-spinner-center" />
                    <p>Preparing study document...</p>
                  </div>
                )}
              </div>
            ) : isHtml ? (
              <div className="drm-frame-container">
                <iframe
                  srcDoc={styledHtmlDocument}
                  title={material?.title || 'Study Guide'}
                  sandbox="allow-same-origin allow-scripts"
                  className="drm-html-iframe"
                />
              </div>
            ) : (
              <div className="drm-text-scroll">
                {material?.description && (
                  <div className="drm-callout-box drm-callout-spacing">
                    <strong className="drm-callout-title">Document Overview:</strong>
                    <span className="drm-callout-desc">{material.description}</span>
                  </div>
                )}
                <div className="drm-markdown-content drm-markdown-shell" style={{ fontSize: `${fontSize}px` }}>
                  {renderMarkdownBlocks(decodedText)}
                </div>
              </div>
            )
          ) : (
            <div className="drm-canvas-scroll">
              {isPdf ? (
                <div className="drm-canvas-pdf-notice">
                  <p>PDF guides are rendered directly in the document viewport with student watermarks.</p>
                </div>
              ) : (
                <canvas id="drm-reader-canvas" className="drm-canvas-surface" />
              )}
            </div>
          )}

          {/* MINIMAL FOOTER BAR */}
          <div className="drm-footer-audit">
            <span className="drm-mobile-hide">Strivers Licensed Reading Copy</span>
            <span>
              Student Watermark: <strong>{studentIdentifier}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
