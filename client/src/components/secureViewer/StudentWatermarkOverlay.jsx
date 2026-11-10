import React, { useEffect, useId, useRef } from 'react';
import './StudentWatermarkOverlay.css';

function buildWatermarkContent(node, safeLabel, theme, patternId) {
  if (!node || typeof document === 'undefined') return;
  const fill =
    theme === 'dark'
      ? 'rgba(255, 255, 255, 0.085)'
      : theme === 'sepia'
      ? 'rgba(120, 70, 30, 0.09)'
      : 'rgba(71, 85, 105, 0.085)';
  const tiledText = `${safeLabel.toUpperCase()} • STRIVERS LICENSED COPY`;

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'student-watermark-svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('aria-hidden', 'true');

  const defs = document.createElementNS(svgNS, 'defs');
  const pattern = document.createElementNS(svgNS, 'pattern');
  pattern.setAttribute('id', patternId);
  pattern.setAttribute('width', '340');
  pattern.setAttribute('height', '170');
  pattern.setAttribute('patternUnits', 'userSpaceOnUse');
  pattern.setAttribute('patternTransform', 'rotate(-22)');

  const text = document.createElementNS(svgNS, 'text');
  text.setAttribute('x', '18');
  text.setAttribute('y', '88');
  text.setAttribute('fill', fill);
  text.setAttribute('font-size', '12');
  text.setAttribute('font-family', 'Inter, system-ui, -apple-system, sans-serif');
  text.setAttribute('font-weight', '700');
  text.setAttribute('letter-spacing', '0.7px');
  text.textContent = tiledText;

  pattern.appendChild(text);
  defs.appendChild(pattern);
  svg.appendChild(defs);

  const rect = document.createElementNS(svgNS, 'rect');
  rect.setAttribute('width', '100%');
  rect.setAttribute('height', '100%');
  rect.setAttribute('fill', `url(#${patternId})`);
  svg.appendChild(rect);

  const pill = document.createElement('div');
  pill.className = `student-watermark-pill theme-${theme}`;
  pill.textContent = `Student: ${safeLabel}`;

  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
  node.appendChild(svg);
  node.appendChild(pill);
}

/**
 * Default irremovable student watermark overlay.
 * Observes DOM mutations in its parent container and immediately restores
 * itself (re-attaching node, styles, and vector layers) without VDOM desync.
 */
export function StudentWatermarkOverlay({
  studentLabel = 'STUDENT',
  theme = 'light',
  containerRef,
}) {
  const hostRef = useRef(null);
  const patternUid = `student-wm-${useId().replace(/:/g, '')}`;
  const safeLabel = (studentLabel || 'STUDENT').trim();

  useEffect(() => {
    const node = hostRef.current;
    const parentEl = containerRef?.current || node?.parentElement;
    if (!node) return undefined;

    let restoring = false;
    const syncAndProtect = () => {
      if (restoring) return;
      restoring = true;
      try {
        if (parentEl && !parentEl.contains(node)) {
          parentEl.prepend(node);
        }
        node.hidden = false;
        node.className = 'student-watermark-root';
        node.style.display = 'block';
        node.style.visibility = 'visible';
        node.style.opacity = '1';
        node.style.pointerEvents = 'none';

        const hasSvg = Boolean(node.querySelector('.student-watermark-svg'));
        const hasPill = Boolean(node.querySelector('.student-watermark-pill'));
        if (!hasSvg || !hasPill) {
          buildWatermarkContent(node, safeLabel, theme, patternUid);
        }
      } finally {
        restoring = false;
      }
    };

    // Build initial protected watermark content
    buildWatermarkContent(node, safeLabel, theme, patternUid);
    syncAndProtect();

    if (!parentEl || typeof MutationObserver === 'undefined') return undefined;

    const observer = new MutationObserver(() => {
      const missingFromDom = !parentEl.contains(node);
      const hiddenOrStyledOff =
        node.hidden ||
        node.style.display === 'none' ||
        node.style.visibility === 'hidden' ||
        node.style.opacity === '0' ||
        !node.querySelector('.student-watermark-svg') ||
        !node.querySelector('.student-watermark-pill');

      if (missingFromDom || hiddenOrStyledOff) {
        syncAndProtect();
      }
    });

    observer.observe(parentEl, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden'],
    });

    return () => observer.disconnect();
  }, [containerRef, safeLabel, theme, patternUid]);

  return (
    <div
      ref={hostRef}
      data-testid="student-watermark-overlay"
      aria-label={`Student Watermark: ${safeLabel}`}
      className="student-watermark-root"
    />
  );
}

export default StudentWatermarkOverlay;
