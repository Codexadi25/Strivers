/**
 * Central Application Controller
 * Coordinates MVC lifecycle, router tabs, and modular UI mounts
 */

import { initTheme, toggleTheme } from '../services/theme.js';
import { AuthController } from './AuthController.js';
import { PricingController } from './PricingController.js';
import { MasterclassesController } from './MasterclassesController.js';
import { TelemetryController } from './TelemetryController.js';
import { OrdersController } from './OrdersController.js';
import { UsersController } from './UsersController.js';
import { PracticeController } from './PracticeController.js';
import { RefundsController } from './RefundsController.js';
import { LogsController } from './LogsController.js';

import { SidebarView } from '../views/components/SidebarView.js';
import { TopbarView } from '../views/components/TopbarView.js';
import { ModalsView } from '../views/components/ModalsView.js';
import { AuthPageView } from '../views/pages/AuthPageView.js';
import { PricingPageView } from '../views/pages/PricingPageView.js';
import { MasterclassesPageView } from '../views/pages/MasterclassesPageView.js';
import { TelemetryPageView } from '../views/pages/TelemetryPageView.js';
import { OrdersPageView } from '../views/pages/OrdersPageView.js';
import { UsersPageView } from '../views/pages/UsersPageView.js';
import { PracticePageView } from '../views/pages/PracticePageView.js';
import { RefundsPageView } from '../views/pages/RefundsPageView.js';
import { LogsPageView } from '../views/pages/LogsPageView.js';

export class AppController {
  static currentActiveTab = 'pricing';

  static init() {
    // 1. Initialize Theme Mode
    initTheme();

    // 2. Mount Views into DOM
    this.mountViews();

    // 3. Bind Global Window APIs for backward compatibility with DOM onclick handlers
    this.bindGlobals();

    // 4. Start Live Server Clock
    this.startServerClock();

    // 5. Check Auth Session
    AuthController.checkSession().then((isAuthenticated) => {
      if (isAuthenticated) {
        this.switchTab('pricing');
      }
    });
  }

  static mountViews() {
    const authScreen = document.getElementById('auth-screen');
    if (authScreen && !authScreen.innerHTML.trim()) {
      authScreen.innerHTML = AuthPageView.render();
    }

    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer && !sidebarContainer.innerHTML.trim()) {
      sidebarContainer.innerHTML = SidebarView.render();
    }

    const topbarContainer = document.getElementById('topbar-container');
    if (topbarContainer && !topbarContainer.innerHTML.trim()) {
      topbarContainer.innerHTML = TopbarView.render();
    }

    const pagesContainer = document.getElementById('pages-container');
    if (pagesContainer && !pagesContainer.innerHTML.trim()) {
      pagesContainer.innerHTML = [
        PricingPageView.renderPane(),
        MasterclassesPageView.renderPane(),
        TelemetryPageView.renderPane(),
        OrdersPageView.renderPane(),
        UsersPageView.renderPane(),
        PracticePageView.renderPane(),
        RefundsPageView.renderPane(),
        LogsPageView.renderPane(),
      ].join('\n');
    }

    const modalsContainer = document.getElementById('modals-container');
    if (modalsContainer && !modalsContainer.innerHTML.trim()) {
      modalsContainer.innerHTML = ModalsView.renderAllModals();
    }
  }

  static switchTab(tabId) {
    this.currentActiveTab = tabId;

    // Update Sidebar Navigation active state
    document.querySelectorAll('.nav-item').forEach((item) => {
      item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
    });

    // Update Tab Panes active state
    document.querySelectorAll('.tab-pane').forEach((pane) => {
      pane.classList.toggle('active', pane.id === `tab-${tabId}`);
    });

    // Load data for the chosen tab
    this.loadActiveTabData(tabId);
  }

  static loadActiveTabData(tabId) {
    switch (tabId) {
      case 'pricing':
        PricingController.loadProducts();
        break;
      case 'masterclasses':
        MasterclassesController.loadMasterclasses();
        break;
      case 'telemetry':
        TelemetryController.loadTelemetry();
        break;
      case 'orders':
        OrdersController.loadOrders();
        break;
      case 'users':
        UsersController.loadUsers();
        break;
      case 'practice':
        PracticeController.loadPracticeSheets();
        break;
      case 'refunds':
        RefundsController.loadRefunds();
        break;
      case 'logs':
        LogsController.loadLogs();
        break;
      default:
        break;
    }
  }

  static refreshCurrentTab() {
    this.loadActiveTabData(this.currentActiveTab);
  }

  static startServerClock() {
    const clockEl = document.getElementById('server-clock');
    if (!clockEl) return;

    const update = () => {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST';
    };

    update();
    setInterval(update, 1000);
  }

  static bindGlobals() {
    // Navigation & Core App
    window.switchTab = (tabId) => this.switchTab(tabId);
    window.refreshCurrentTab = () => this.refreshCurrentTab();
    window.toggleTheme = () => toggleTheme();

    // Auth
    window.handleAdminLogin = (e) => AuthController.handleLogin(e);
    window.handleLogout = () => AuthController.handleLogout();

    // Pricing & Products
    window.loadProducts = () => PricingController.loadProducts();
    window.openEditPriceModal = (id) => PricingController.openEditPriceModal(id);
    window.closeEditPriceModal = () => PricingController.closeEditPriceModal();
    window.submitPriceUpdate = (e) => PricingController.submitPriceUpdate(e);
    window.openAddProductModal = () => PricingController.openAddProductModal();
    window.closeAddProductModal = () => PricingController.closeAddProductModal();
    window.submitCreateProduct = (e) => PricingController.submitCreateProduct(e);

    // Masterclasses & Study Material
    window.loadMasterclasses = () => MasterclassesController.loadMasterclasses();
    window.openCreateMasterclassModal = () => MasterclassesController.openCreateMasterclassModal();
    window.closeCreateMasterclassModal = () => MasterclassesController.closeCreateMasterclassModal();
    window.openEditMasterclassModal = (id) => MasterclassesController.openEditMasterclassModal(id);
    window.submitCreateMasterclass = (e) => MasterclassesController.submitCreateMasterclass(e);
    window.deleteMasterclass = (id) => MasterclassesController.deleteMasterclass(id);
    window.openSessionModal = (id) => MasterclassesController.openSessionModal(id);
    window.closeSessionModal = () => MasterclassesController.closeSessionModal();
    window.submitUpdateSession = (e) => MasterclassesController.submitUpdateSession(e);
    window.openSlotsModal = (id) => MasterclassesController.openSlotsModal(id);
    window.closeSlotsModal = () => MasterclassesController.closeSlotsModal();
    window.submitAddSlot = (e) => MasterclassesController.submitAddSlot(e);
    window.deleteTimingSlot = (cId, sId) => MasterclassesController.deleteTimingSlot(cId, sId);
    window.openMaterialsModal = (id) => MasterclassesController.openMaterialsModal(id);
    window.closeMaterialsModal = () => MasterclassesController.closeMaterialsModal();
    window.submitUploadMaterial = (e) => MasterclassesController.submitUploadMaterial(e);
    window.deleteStudyMaterial = (cId, mId) => MasterclassesController.deleteStudyMaterial(cId, mId);

    // Orders & Transactions
    window.loadOrders = () => OrdersController.loadOrders();
    window.debounceOrdersSearch = () => OrdersController.debounceOrdersSearch();
    window.promptRefund = (oId, amt) => OrdersController.promptRefund(oId, amt);

    // User Access
    window.loadUsers = () => UsersController.loadUsers();
    window.debounceUsersSearch = () => UsersController.debounceUsersSearch();
    window.openGrantAccessModal = (email) => UsersController.openGrantAccessModal(email);
    window.closeGrantAccessModal = () => UsersController.closeGrantAccessModal();
    window.togglePermanentDuration = () => UsersController.togglePermanentDuration();
    window.submitGrantAccess = (e) => UsersController.submitGrantAccess(e);
    window.openResetPasswordModal = (email) => UsersController.openResetPasswordModal(email);
    window.closeResetPasswordModal = () => UsersController.closeResetPasswordModal();
    window.submitResetPassword = (e) => UsersController.submitResetPassword(e);
    window.generateResetLinkOnly = () => UsersController.generateResetLinkOnly();
    window.revokeUserAccess = (email) => UsersController.revokeUserAccess(email);
    window.toggleUserRole = (email, role) => UsersController.toggleUserRole(email, role);

    // Practice Sheets & Curriculum
    window.loadPracticeSheets = () => PracticeController.loadPracticeSheets();
    window.debouncePracticeSearch = () => PracticeController.debouncePracticeSearch();
    window.openEditSheetPriceModal = (sheet) => PracticeController.openEditSheetPriceModal(sheet);
    window.closeEditSheetPriceModal = () => PracticeController.closeEditSheetPriceModal();
    window.submitPracticeSheetPrice = (e) => PracticeController.submitPracticeSheetPrice(e);
    window.openAddPracticeSheetModal = () => PracticeController.openAddPracticeSheetModal();
    window.openEditPracticeSheetModal = (id) => PracticeController.openEditPracticeSheetModal(id);
    window.closeAddPracticeSheetModal = () => PracticeController.closeAddPracticeSheetModal();
    window.submitCreatePracticeSheet = (e) => PracticeController.submitCreatePracticeSheet(e);
    window.deletePracticeSheet = (id) => PracticeController.deletePracticeSheet(id);
    window.openCurriculumModal = (id) => PracticeController.openCurriculumModal(id);
    window.closeCurriculumModal = () => PracticeController.closeCurriculumModal();
    window.submitAddTopic = (e) => PracticeController.submitAddTopic(e);
    window.deleteTopic = (sId, tId) => PracticeController.deleteTopic(sId, tId);
    window.submitAddProblem = (e) => PracticeController.submitAddProblem(e);
    window.deleteProblem = (sId, tId, pId) => PracticeController.deleteProblem(sId, tId, pId);
    window.handleEditSheetPriceClick = (buttonEl) => {
      try {
        const sheetData = JSON.parse(buttonEl.getAttribute('data-sheet'));
        PracticeController.openEditSheetPriceModal(sheetData);
      } catch (err) {
        console.error('Failed to parse sheet data', err);
      }
    };

    // Refunds
    window.loadRefunds = () => RefundsController.loadRefunds();
    window.openRefundModal = (oId, amt) => RefundsController.openRefundModal(oId, amt);
    window.closeRefundModal = () => RefundsController.closeRefundModal();
    window.submitRefund = (e) => RefundsController.submitRefund(e);

    // Logs
    window.loadLogs = () => LogsController.loadLogs();
    window.debounceLogsSearch = () => LogsController.debounceLogsSearch();
  }
}
