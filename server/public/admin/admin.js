/**
 * Strivers Server Control Center - Main Bootstrap Entry Point
 * Architecture: Clean Modular MVC
 */

import { AppController } from './js/controllers/AppController.js';

// Initialize the Admin MVC Application once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AppController.init());
} else {
  AppController.init();
}
