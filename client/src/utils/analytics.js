/**
 * Google Analytics 4 (GA4) Tracking Utility for Strivers Platform
 * Measurement ID: G-YWN34VP94L
 * Tracks page navigation, user interactions, button clicks, and payments.
 */

export const GA_MEASUREMENT_ID = 'G-YWN34VP94L';

/**
 * Safe invocation of window.gtag
 */
export const gtag = function () {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag(...arguments);
  } else if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(arguments);
  }
};

/**
 * Track SPA Route / Page View
 */
export const trackPageView = (path, title) => {
  try {
    const pagePath = path || (window.location.pathname + window.location.search);
    const pageTitle = title || document.title;
    gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
      page_location: window.location.href,
      send_to: GA_MEASUREMENT_ID,
    });
  } catch (_) {}
};

/**
 * Track Custom Activity / Action
 */
export const trackEvent = (eventName, params = {}) => {
  try {
    gtag('event', eventName, {
      ...params,
      timestamp: new Date().toISOString(),
      send_to: GA_MEASUREMENT_ID,
    });
  } catch (_) {}
};

/**
 * Associate authenticated user with analytics session
 */
export const identifyUser = (user) => {
  try {
    if (!user) return;
    gtag('set', 'user_properties', {
      user_id: user.uid || user.id,
      user_email: user.email,
      user_role: user.role || 'student',
    });
    trackEvent('login', {
      method: user.provider || 'email',
      user_email: user.email,
    });
  } catch (_) {}
};

/**
 * Global User Activity Listener
 * Captures all button clicks, links, interactive toggles, and modal triggers.
 */
export const setupGlobalActivityTracking = () => {
  if (typeof window === 'undefined' || window._hasSetupGlobalGA) return;
  window._hasSetupGlobalGA = true;

  document.addEventListener('click', (e) => {
    try {
      const interactiveEl = e.target.closest('button, a, [role="button"], input[type="submit"], input[type="button"], select');
      if (!interactiveEl) return;

      const rawText = interactiveEl.innerText || interactiveEl.getAttribute('aria-label') || interactiveEl.title || interactiveEl.value || '';
      const cleanText = rawText.replace(/\s+/g, ' ').trim().slice(0, 60);
      const tag = interactiveEl.tagName.toLowerCase();
      const href = interactiveEl.getAttribute('href');

      trackEvent('user_click', {
        element_tag: tag,
        element_text: cleanText || '(unlabeled)',
        element_id: interactiveEl.id || undefined,
        element_class: interactiveEl.className ? String(interactiveEl.className).slice(0, 60) : undefined,
        href: href || undefined,
        page_location: window.location.pathname,
      });
    } catch (_) {}
  }, true);
};

