/**
 * Modal Components View
 * Centralized, structured modal dialog templates for the Strivers Admin GUI
 */

export class ModalsView {
  static renderAllModals() {
    return `
      <!-- MODAL: EDIT PRODUCT PRICE & DETAILS -->
      <div id="modal-edit-price" class="modal-overlay hidden">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Edit Product Pricing & Details</h3>
            <button class="btn-close" onclick="closeEditPriceModal()">&times;</button>
          </div>
          <form id="form-edit-price" onsubmit="submitPriceUpdate(event)">
            <input type="hidden" id="edit-product-id">

            <div class="form-group">
              <label for="edit-title">Product Title</label>
              <input type="text" id="edit-title" class="input-control" required>
            </div>

            <div class="grid-2col">
              <div class="form-group">
                <label for="edit-price">Selling Price (₹ INR) <span class="badge-required">*</span></label>
                <div class="input-prefix-wrap">
                  <span class="prefix">₹</span>
                  <input type="number" id="edit-price" class="input-control" min="1" step="1" required placeholder="21">
                </div>
                <span class="help-text">Paise calculated: <strong id="edit-paise-calc">2100</strong> paise</span>
              </div>

              <div class="form-group">
                <label for="edit-original-price">Original Price (₹ Strike-through)</label>
                <div class="input-prefix-wrap">
                  <span class="prefix">₹</span>
                  <input type="number" id="edit-original-price" class="input-control" min="1" step="1" placeholder="999">
                </div>
                <span class="help-text">Shown crossed-out to highlight discount</span>
              </div>
            </div>

            <div class="form-group">
              <label for="edit-badge">Promotional Badge Text</label>
              <input type="text" id="edit-badge" class="input-control" placeholder="e.g. Flash Offer ₹1 • Limited Batch">
            </div>

            <div class="form-group">
              <label for="edit-description">Description</label>
              <textarea id="edit-description" class="input-control" rows="3"></textarea>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" id="edit-is-active" checked>
                <span>Active & Purchasable in Storefront</span>
              </label>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" onclick="closeEditPriceModal()">Cancel</button>
              <button type="submit" id="btn-save-price" class="btn btn-primary">
                <span>Apply Price Change</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL: ADD NEW PRODUCT -->
      <div id="modal-add-product" class="modal-overlay hidden">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Create New Product Plan</h3>
            <button class="btn-close" onclick="closeAddProductModal()">&times;</button>
          </div>
          <form id="form-add-product" onsubmit="submitCreateProduct(event)">
            <div class="grid-2col">
              <div class="form-group">
                <label for="new-product-id">Product Identifier (Slug) <span class="badge-required">*</span></label>
                <input type="text" id="new-product-id" class="input-control" required placeholder="e.g. mock_interview_pack">
                <span class="help-text">Alphanumeric ID used in payment links</span>
              </div>

              <div class="form-group">
                <label for="new-title">Product Title <span class="badge-required">*</span></label>
                <input type="text" id="new-title" class="input-control" required placeholder="e.g. 1-on-1 Mock Interview">
              </div>
            </div>

            <div class="grid-2col">
              <div class="form-group">
                <label for="new-price">Price (₹ INR) <span class="badge-required">*</span></label>
                <div class="input-prefix-wrap">
                  <span class="prefix">₹</span>
                  <input type="number" id="new-price" class="input-control" min="1" step="1" required placeholder="49">
                </div>
              </div>

              <div class="form-group">
                <label for="new-original-price">Original Price (₹)</label>
                <div class="input-prefix-wrap">
                  <span class="prefix">₹</span>
                  <input type="number" id="new-original-price" class="input-control" min="1" step="1" placeholder="499">
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="new-badge">Badge (Optional)</label>
              <input type="text" id="new-badge" class="input-control" placeholder="e.g. Early Bird Offer">
            </div>

            <div class="form-group">
              <label for="new-description">Description</label>
              <textarea id="new-description" class="input-control" rows="2" placeholder="Brief outline of this offering..."></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" onclick="closeAddProductModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">
                <span>Create & Publish Plan</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL: GRANT MANUAL ACCESS -->
      <div id="modal-grant-access" class="modal-overlay hidden">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Grant Student Platform Access</h3>
            <button class="btn-close" onclick="closeGrantAccessModal()">&times;</button>
          </div>
          <form id="form-grant-access" onsubmit="submitGrantAccess(event)">
            <div class="form-group">
              <label for="grant-email">Student Email Address <span class="badge-required">*</span></label>
              <input type="email" id="grant-email" class="input-control" required placeholder="student@example.com">
            </div>

            <div class="grid-2col">
              <div class="form-group">
                <label for="grant-course">Grant Course Access</label>
                <select id="grant-course" class="select-control">
                  <option value="">-- No Specific Course --</option>
                  <option value="masterclass">Strivers Placement Masterclass</option>
                  <option value="channel">Strivers Paid Job Channel</option>
                  <option value="masterclass_bundle">Masterclass + Job Channel Bundle</option>
                </select>
              </div>

              <div class="form-group">
                <label for="grant-sheet">Grant Practice Sheet Access</label>
                <select id="grant-sheet" class="select-control">
                  <option value="">-- No Specific Sheet --</option>
                  <option value="non-tech-ops-zomato-blinkit">Quick Commerce Operations Lead (Zomato/Blinkit)</option>
                  <option value="non-tech-logistics-porter-amazon">Intracity Fleet & Logistics (Porter/Amazon)</option>
                  <option value="non-tech-growth-flipkart-amazon">Category Growth & Margin (Flipkart/Amazon)</option>
                  <option value="strivers-sde-sheet">Technical SDE Sheet (Template)</option>
                </select>
              </div>
            </div>

            <div class="grid-2col">
              <div class="form-group">
                <label for="grant-limit">Practice Sheet Limit</label>
                <input type="number" id="grant-limit" class="input-control" value="2" min="1" max="10">
                <span class="help-text">Max allowed practice sheets</span>
              </div>

              <div class="form-group">
                <label for="grant-role">Account Privilege</label>
                <select id="grant-role" class="select-control">
                  <option value="user">Student (User)</option>
                  <option value="admin">Administrator (Admin)</option>
                </select>
              </div>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" id="grant-is-permanent" checked onchange="togglePermanentDuration()">
                <span><strong>Permanent Lifetime Access</strong> (No Expiry Date)</span>
              </label>
            </div>

            <div class="form-group hidden" id="wrap-grant-duration">
              <label for="grant-duration">Access Duration (Days)</label>
              <input type="number" id="grant-duration" class="input-control" value="30" min="1" max="365">
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" onclick="closeGrantAccessModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">
                <span>Authorize & Grant Access</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL: RESET USER PASSWORD -->
      <div id="modal-reset-password" class="modal-overlay hidden">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Reset User Password Mechanism</h3>
            <button class="btn-close" onclick="closeResetPasswordModal()">&times;</button>
          </div>
          <form id="form-reset-password" onsubmit="submitResetPassword(event)">
            <div class="form-group">
              <label for="reset-user-email">User Email Address</label>
              <input type="email" id="reset-user-email" class="input-control" readonly style="background: rgba(255,255,255,0.05);">
            </div>

            <div class="form-group">
              <label for="reset-user-new-password">New Passkey / Password <span class="badge-required">*</span></label>
              <input type="text" id="reset-user-new-password" class="input-control" value="strivers2026" required placeholder="Enter new password">
              <span class="help-text">Will be encrypted using SHA/Scrypt and saved to user record.</span>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" onclick="closeResetPasswordModal()">Cancel</button>
              <button type="button" class="btn btn-secondary" onclick="generateResetLinkOnly()">
                <span>Generate Reset Link</span>
              </button>
              <button type="submit" class="btn btn-primary">
                <span>Set Password Directly</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL: CREATE / EDIT MASTERCLASS -->
      <div id="modal-create-masterclass" class="modal-overlay hidden">
        <div class="modal-card" style="max-width: 650px;">
          <div class="modal-header">
            <h3 id="modal-masterclass-title-text">Create Masterclass / Course</h3>
            <button class="btn-close" onclick="closeCreateMasterclassModal()">&times;</button>
          </div>
          <form id="form-create-masterclass" onsubmit="submitCreateMasterclass(event)">
            <div class="grid-2col">
              <div class="form-group">
                <label for="mc-id">Course Slug / ID <span class="badge-required">*</span></label>
                <input type="text" id="mc-id" class="input-control" required placeholder="e.g. masterclass, channel, quick_ops">
                <span class="help-text">Permanent identifier for checkout & URLs</span>
              </div>

              <div class="form-group">
                <label for="mc-category">Course Type / Track</label>
                <select id="mc-category" class="select-control">
                  <option value="masterclass">Live Placement Masterclass</option>
                  <option value="channel">Paid Job & Referral Channel</option>
                  <option value="workshop">Specialized Workshop</option>
                  <option value="course">Self-Paced Course</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="mc-title">Course Title <span class="badge-required">*</span></label>
              <input type="text" id="mc-title" class="input-control" required placeholder="e.g. Strivers Masterclass">
            </div>

            <div class="form-group">
              <label for="mc-desc">Subtitle / Blurb</label>
              <input type="text" id="mc-desc" class="input-control" placeholder="e.g. Live online session, basics to advanced.">
            </div>

            <div class="grid-2col">
              <div class="form-group">
                <label for="mc-price">Price (₹ INR) <span class="badge-required">*</span></label>
                <div class="input-prefix-wrap">
                  <span class="prefix">₹</span>
                  <input type="number" id="mc-price" class="input-control" min="0" step="1" required placeholder="21">
                </div>
              </div>

              <div class="form-group">
                <label for="mc-original-price">Original / Strike Price (₹ INR)</label>
                <div class="input-prefix-wrap">
                  <span class="prefix">₹</span>
                  <input type="number" id="mc-original-price" class="input-control" min="0" step="1" placeholder="999">
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="mc-badge">Card Badge / Tag</label>
              <input type="text" id="mc-badge" class="input-control" placeholder="e.g. Live Session Every Sunday, Fast Track">
            </div>

            <div class="form-group">
              <label for="mc-features">Key Bullet Points / Highlights (One per line)</label>
              <textarea id="mc-features" class="input-control" rows="3" placeholder="Live online session every Sunday&#10;Resume, portfolio, LinkedIn & Naukri&#10;Cold emails and data skills for placement"></textarea>
              <span class="help-text">Displayed with green checkmarks on the card</span>
            </div>

            <div class="card" style="background: #F1F5F9; padding: 14px 16px; border-radius: 8px; margin-bottom: 16px;">
              <h4 style="margin: 0 0 10px; font-size: 0.92rem; color: #0E1B3D;">🎥 Active Live Session Configuration</h4>
              <div class="grid-2col">
                <div class="form-group" style="margin-bottom: 8px;">
                  <label for="mc-meeting-link">Active Meeting Link (Google Meet / Zoom)</label>
                  <input type="url" id="mc-meeting-link" class="input-control" placeholder="https://meet.google.com/abc-defg-hij">
                </div>
                <div class="form-group" style="margin-bottom: 8px;">
                  <label for="mc-session-status">Session Status</label>
                  <select id="mc-session-status" class="select-control">
                    <option value="upcoming">Upcoming Session (Countdown)</option>
                    <option value="live">Live In Progress (Pulsing Red)</option>
                    <option value="completed">Completed / Archive</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" onclick="closeCreateMasterclassModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">
                <span>Save Course & Masterclass</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL: UPDATE ACTIVE MEETING LINK & SESSION STATUS -->
      <div id="modal-session-link" class="modal-overlay hidden">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Update Active Meeting Link & Status</h3>
            <button class="btn-close" onclick="closeSessionModal()">&times;</button>
          </div>
          <form id="form-update-session" onsubmit="submitUpdateSession(event)">
            <input type="hidden" id="session-course-id">
            <div class="form-group">
              <label id="session-course-name" style="font-weight: 700; color: #2563EB;">Course Name</label>
            </div>

            <div class="form-group">
              <label for="session-link-input">Active Google Meet / Zoom URL <span class="badge-required">*</span></label>
              <input type="url" id="session-link-input" class="input-control" required placeholder="https://meet.google.com/strivers-placement-live">
              <span class="help-text">Only enrolled users with verified lifetime access can see and join this link.</span>
            </div>

            <div class="grid-2col">
              <div class="form-group">
                <label for="session-code-input">Meeting Room Code / Password</label>
                <input type="text" id="session-code-input" class="input-control" placeholder="strivers-placement-live">
              </div>

              <div class="form-group">
                <label for="session-status-select">Session Status</label>
                <select id="session-status-select" class="select-control">
                  <option value="upcoming">📅 Upcoming (Scheduled)</option>
                  <option value="live">🔴 Live Now (Active Pulse)</option>
                  <option value="completed">✓ Completed</option>
                </select>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" onclick="closeSessionModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">
                <span>Update Active Meeting</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL: MANAGE TIMING SLOTS -->
      <div id="modal-timing-slots" class="modal-overlay hidden">
        <div class="modal-card" style="max-width: 680px;">
          <div class="modal-header">
            <div>
              <h3>Session Timing Slots</h3>
              <span id="slots-course-name" class="modal-subtitle">Manage scheduled class slots</span>
            </div>
            <button class="btn-close" onclick="closeSlotsModal()">&times;</button>
          </div>

          <div style="max-height: 65vh; overflow-y: auto; padding-right: 4px;">
            <input type="hidden" id="slots-course-id">

            <h4 class="modal-section-title">Current Timing Slots:</h4>
            <div id="slots-list-container" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px;"></div>

            <div class="admin-subcard-dashed" style="padding: 18px;">
              <h4 class="modal-section-title" style="margin-bottom: 12px;">+ Add New Timing Slot</h4>
              <form id="form-add-slot" onsubmit="submitAddSlot(event)">
                <div class="form-group">
                  <label for="slot-title">Session Title / Topic <span class="badge-required">*</span></label>
                  <input type="text" id="slot-title" class="input-control" required placeholder="e.g. Sunday Masterclass: ATS Resume Roast & Mock Interviews">
                </div>

                <div class="grid-2col">
                  <div class="form-group">
                    <label for="slot-date">Date <span class="badge-required">*</span></label>
                    <input type="text" id="slot-date" class="input-control" required placeholder="e.g. Sunday, 25 Oct 2026">
                  </div>

                  <div class="form-group">
                    <label for="slot-start-time">Time Slot <span class="badge-required">*</span></label>
                    <input type="text" id="slot-start-time" class="input-control" required placeholder="e.g. 11:00 AM - 01:30 PM IST">
                  </div>
                </div>

                <div class="grid-2col">
                  <div class="form-group">
                    <label for="slot-mentor-name">Mentor Name</label>
                    <input type="text" id="slot-mentor-name" class="input-control" placeholder="e.g. Aditya (ex-Zomato)">
                  </div>

                  <div class="form-group">
                    <label for="slot-mentor-role">Mentor Role</label>
                    <input type="text" id="slot-mentor-role" class="input-control" placeholder="e.g. Operations Lead">
                  </div>
                </div>

                <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
                  <button type="submit" class="btn btn-primary btn-sm">Add Slot to Schedule</button>
                </div>
              </form>
            </div>
          </div>

          <div class="modal-actions" style="margin-top: 18px;">
            <button type="button" class="btn btn-secondary" onclick="closeSlotsModal()">Close</button>
          </div>
        </div>
      </div>

      <!-- MODAL: MANAGE STUDY MATERIALS (VIEW-ONLY DRM) -->
      <div id="modal-study-materials" class="modal-overlay hidden">
        <div class="modal-card" style="max-width: 720px;">
          <div class="modal-header">
            <div>
              <h3>Protected Notes & Study Materials</h3>
              <span id="materials-course-name" class="modal-subtitle">Stored directly in MongoDB · View Only DRM</span>
            </div>
            <button class="btn-close" onclick="closeMaterialsModal()">&times;</button>
          </div>

          <div style="max-height: 68vh; overflow-y: auto; padding-right: 4px;">
            <input type="hidden" id="materials-course-id">

            <div class="drm-warning-callout">
              <span style="font-size: 1.4rem;">🔒</span>
              <div>
                <strong>Anti-Download DRM Protection:</strong>
                Students can only read these documents in-app via our Canvas DRM Viewer with their dynamic email watermark. <strong>File download, print, and copy shortcuts are disabled.</strong>
              </div>
            </div>

            <h4 class="modal-section-title">Documents Currently Stored in MongoDB:</h4>
            <div id="materials-list-container" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px;"></div>

            <div class="admin-subcard">
              <h4 class="modal-section-title" style="margin-bottom: 12px;">+ Upload New Study Material into MongoDB</h4>
              <form id="form-upload-material" onsubmit="submitUploadMaterial(event)">
                <div class="grid-2col">
                  <div class="form-group">
                    <label for="mat-title">Document Title <span class="badge-required">*</span></label>
                    <input type="text" id="mat-title" class="input-control" required placeholder="e.g. ATS Resume Blueprint & Action Verbs">
                  </div>

                  <div class="form-group">
                    <label for="mat-type">Document Classification</label>
                    <select id="mat-type" class="select-control">
                      <option value="notes">Lecture Notes / Summary</option>
                      <option value="pdf">PDF Presentation / Document</option>
                      <option value="cheatsheet">High-Yield Cheatsheet</option>
                      <option value="document">Case Study Docket</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label for="mat-desc">Description / Instructions</label>
                  <input type="text" id="mat-desc" class="input-control" placeholder="e.g. Mandatory reading before Sunday mock interview session">
                </div>

                <div class="form-group">
                  <label for="mat-file-input">Select File to Store in MongoDB (PDF, DOCX, TXT, MD)</label>
                  <input type="file" id="mat-file-input" class="input-control" accept=".pdf,.doc,.docx,.txt,.md">
                  <span class="help-text">File is converted to Base64 in your browser and stored directly in MongoDB.</span>
                </div>

                <div class="form-group">
                  <label for="mat-text-input">...or Paste Markdown / Text Content Directly</label>
                  <textarea id="mat-text-input" class="input-control" rows="3" placeholder="Paste study notes or cheatsheet text here if not uploading a file..."></textarea>
                </div>

                <div style="display: flex; justify-content: flex-end; margin-top: 12px;">
                  <button type="submit" id="btn-submit-mat" class="btn btn-primary">
                    <span>Save to MongoDB (View-Only DRM)</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div class="modal-actions" style="margin-top: 18px;">
            <button type="button" class="btn btn-secondary" onclick="closeMaterialsModal()">Close</button>
          </div>
        </div>
      </div>

      <!-- MODAL: CREATE OR EDIT PRACTICE SHEET -->
      <div id="modal-add-sheet" class="modal-overlay hidden">
        <div class="modal-card" style="max-width: 680px;">
          <div class="modal-header">
            <h3 id="modal-sheet-title-text">Create Practice Sheet</h3>
            <button class="btn-close" onclick="closeAddPracticeSheetModal()">&times;</button>
          </div>
          <form id="form-create-practice-sheet" onsubmit="submitCreatePracticeSheet(event)">
            <div class="grid-2col">
              <div class="form-group">
                <label for="new-sheet-id">Sheet Slug / ID <span class="badge-required">*</span></label>
                <input type="text" id="new-sheet-id" class="input-control" required placeholder="e.g. ops-zomato-blinkit, dsa-sde-sheet">
                <span class="help-text">Unique URL identifier</span>
              </div>

              <div class="form-group">
                <label for="new-sheet-role-type">Role Track</label>
                <select id="new-sheet-role-type" class="select-control">
                  <option value="non-tech">Non-Technical Operations (Live)</option>
                  <option value="tech">Technical SDE (Template)</option>
                  <option value="analytics">Data Analytics & SQL</option>
                  <option value="product">Product & Growth</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="new-sheet-title">Sheet Curriculum Title <span class="badge-required">*</span></label>
              <input type="text" id="new-sheet-title" class="input-control" required placeholder="e.g. Quick Commerce & Dark Store Operations Lead">
            </div>

            <div class="grid-2col">
              <div class="form-group">
                <label for="new-sheet-target-role">Target Job Role <span class="badge-required">*</span></label>
                <input type="text" id="new-sheet-target-role" class="input-control" required placeholder="e.g. Store Operations Lead / Dark Store Executive">
              </div>

              <div class="form-group">
                <label for="new-sheet-difficulty">Difficulty Level</label>
                <select id="new-sheet-difficulty" class="select-control">
                  <option value="All Levels">All Levels (Comprehensive)</option>
                  <option value="Beginner">Beginner / Foundation</option>
                  <option value="Intermediate">Intermediate / Core Prep</option>
                  <option value="Advanced">Advanced / Lead Level</option>
                </select>
              </div>
            </div>

            <div class="grid-2col">
              <div class="form-group">
                <label for="new-sheet-price">Enrollment Fee (₹ INR) <span class="badge-required">*</span></label>
                <div class="input-prefix-wrap">
                  <span class="prefix">₹</span>
                  <input type="number" id="new-sheet-price" class="input-control" min="0" step="1" value="0" required placeholder="0">
                </div>
                <span class="help-text">Set to 0 for 1-Click Free Enrollment</span>
              </div>

              <div class="form-group">
                <label for="new-sheet-badge">Badge / Highlight</label>
                <input type="text" id="new-sheet-badge" class="input-control" placeholder="e.g. 1-Click Free, Must Do, Top Pick">
              </div>
            </div>

            <div class="form-group">
              <label for="new-sheet-companies">Target Companies (Comma-separated)</label>
              <input type="text" id="new-sheet-companies" class="input-control" placeholder="Zomato, Blinkit, Hyperpure, Swiggy, Porter, Amazon, Flipkart">
            </div>

            <div class="form-group">
              <label for="new-sheet-desc">Curriculum Overview / Instructions</label>
              <textarea id="new-sheet-desc" class="input-control" rows="2" placeholder="Overview of operational scenarios, interview simulations, or algorithms covered in this sheet..."></textarea>
            </div>

            <div class="form-group" style="display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" id="new-sheet-is-template">
              <label for="new-sheet-is-template" style="margin: 0; font-weight: 500;">
                Mark as Template Mode (preserves as reference curriculum)
              </label>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" onclick="closeAddPracticeSheetModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">
                <span>Save Practice Sheet</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL: QUICK EDIT PRACTICE SHEET PRICE & STATUS -->
      <div id="modal-edit-sheet-price" class="modal-overlay hidden">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Edit Practice Sheet Price & Status</h3>
            <button class="btn-close" onclick="closeEditSheetPriceModal()">&times;</button>
          </div>
          <form id="form-edit-sheet-price" onsubmit="submitPracticeSheetPrice(event)">
            <input type="hidden" id="edit-sheet-id">

            <div class="form-group">
              <label for="edit-sheet-title">Sheet Title</label>
              <input type="text" id="edit-sheet-title" class="input-control" required>
            </div>

            <div class="form-group">
              <label for="edit-sheet-target-role">Target Role</label>
              <input type="text" id="edit-sheet-target-role" class="input-control" required>
            </div>

            <div class="form-group">
              <label for="edit-sheet-price">Enrollment Fee (₹ INR)</label>
              <div class="input-prefix-wrap">
                <span class="prefix">₹</span>
                <input type="number" id="edit-sheet-price" class="input-control" min="0" step="1" required>
              </div>
              <span class="help-text">Set ₹0 for 1-Click Free Enrollment</span>
            </div>

            <div class="form-group" style="display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" id="edit-sheet-is-template">
              <label for="edit-sheet-is-template" style="margin: 0; font-weight: 500;">Template Mode</label>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" onclick="closeEditSheetPriceModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Price & Details</button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL: PRACTICE SHEET CURRICULUM & PROBLEM BUILDER -->
      <div id="modal-sheet-curriculum" class="modal-overlay hidden">
        <div class="modal-card" style="max-width: 840px;">
          <div class="modal-header">
            <div>
              <h3 id="curriculum-sheet-title">Practice Sheet Curriculum Builder</h3>
              <span id="curriculum-sheet-subtitle" class="modal-subtitle">Manage topics, real-world problems & interview scenarios</span>
            </div>
            <button class="btn-close" onclick="closeCurriculumModal()">&times;</button>
          </div>

          <div style="max-height: 72vh; overflow-y: auto; padding-right: 6px;">
            <input type="hidden" id="curriculum-sheet-id">

            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <h4 class="modal-section-title" style="margin: 0;">Curriculum Structure (Topics & Problems):</h4>
              <span id="curriculum-stats-pill" class="badge badge-info">0 Topics · 0 Problems</span>
            </div>

            <div id="curriculum-topics-container" style="margin-bottom: 24px;"></div>

            <!-- Add New Topic Section -->
            <div class="admin-subcard-dashed" style="margin-bottom: 20px;">
              <h4 class="modal-section-title" style="margin-bottom: 10px;">+ Add New Topic to Sheet</h4>
              <form id="form-add-topic" onsubmit="submitAddTopic(event)" style="display: flex; gap: 10px; flex-wrap: wrap;">
                <input type="text" id="new-topic-title" class="input-control" style="flex: 2; min-width: 200px;" required placeholder="Topic Title (e.g. Dark Store Inventory & Shrinkage Control)">
                <input type="text" id="new-topic-summary" class="input-control" style="flex: 3; min-width: 250px;" placeholder="Topic summary / focus area">
                <button type="submit" class="btn btn-secondary btn-sm" style="white-space: nowrap;">+ Add Topic</button>
              </form>
            </div>

            <!-- Add Problem to Topic Section -->
            <div class="admin-subcard">
              <h4 class="modal-section-title" style="margin-bottom: 12px;">+ Add Interview Problem / Scenario to Topic</h4>
              <form id="form-add-problem" onsubmit="submitAddProblem(event)">
                <div class="grid-2col">
                  <div class="form-group">
                    <label for="prob-target-topic">Select Topic <span class="badge-required">*</span></label>
                    <select id="prob-target-topic" class="select-control" required>
                      <option value="">-- Choose a Topic --</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="prob-title">Problem Title <span class="badge-required">*</span></label>
                    <input type="text" id="prob-title" class="input-control" required placeholder="e.g. Picker Route Optimization during 8 PM Surge">
                  </div>
                </div>

                <div class="grid-2col">
                  <div class="form-group">
                    <label for="prob-company">Target Company</label>
                    <input type="text" id="prob-company" class="input-control" placeholder="e.g. Blinkit, Zomato, Porter, Google">
                  </div>

                  <div class="form-group">
                    <label for="prob-difficulty">Difficulty</label>
                    <select id="prob-difficulty" class="select-control">
                      <option value="Easy">Easy</option>
                      <option value="Medium" selected>Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div class="grid-2col">
                  <div class="form-group">
                    <label for="prob-type">Problem Classification / Type</label>
                    <input type="text" id="prob-type" class="input-control" placeholder="e.g. Operational Math, Dispatch Logic, Arrays">
                  </div>

                  <div class="form-group">
                    <label for="prob-acceptance">Acceptance Rate</label>
                    <input type="text" id="prob-acceptance" class="input-control" placeholder="e.g. 88%">
                  </div>
                </div>

                <div class="form-group">
                  <label for="prob-scenario">Problem Statement / Scenario <span class="badge-required">*</span></label>
                  <textarea id="prob-scenario" class="input-control" rows="3" required placeholder="Describe the business scenario, operational constraint, or algorithm problem statement..."></textarea>
                </div>

                <div class="form-group">
                  <label for="prob-solution">Solution Guidance / Approach</label>
                  <textarea id="prob-solution" class="input-control" rows="2" placeholder="Key steps, formula, calculation, or algorithmic solution..."></textarea>
                </div>

                <div class="grid-2col">
                  <div class="form-group">
                    <label for="prob-takeaway">Interview Takeaway / Concept</label>
                    <input type="text" id="prob-takeaway" class="input-control" placeholder="e.g. In quick commerce, prioritize aisle batching over FIFO">
                  </div>

                  <div class="form-group">
                    <label for="prob-resource">Resource Link / LeetCode Reference</label>
                    <input type="url" id="prob-resource" class="input-control" placeholder="https://leetcode.com/... or docs link">
                  </div>
                </div>

                <div style="display: flex; justify-content: flex-end; margin-top: 12px;">
                  <button type="submit" class="btn btn-primary">
                    <span>+ Add Problem to Curriculum</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div class="modal-actions" style="margin-top: 18px;">
            <button type="button" class="btn btn-secondary" onclick="closeCurriculumModal()">Close</button>
          </div>
        </div>
      </div>

      <!-- MODAL: DIRECT REFUND -->
      <div id="modal-refund" class="modal-overlay hidden">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Issue Transaction Refund</h3>
            <button class="btn-close" onclick="closeRefundModal()">&times;</button>
          </div>
          <form id="form-refund" onsubmit="submitRefund(event)">
            <div class="form-group">
              <label for="refund-order-id">Razorpay Order ID <span class="badge-required">*</span></label>
              <input type="text" id="refund-order-id" class="input-control" required placeholder="order_xxxxxxxxxxxxxx">
            </div>

            <div class="grid-2col">
              <div class="form-group">
                <label for="refund-amount">Refund Amount (₹ INR)</label>
                <div class="input-prefix-wrap">
                  <span class="prefix">₹</span>
                  <input type="number" id="refund-amount" class="input-control" min="1" step="1" placeholder="21">
                </div>
              </div>

              <div class="form-group">
                <label for="refund-type">Refund Channel</label>
                <select id="refund-type" class="select-control">
                  <option value="razorpay">Razorpay Auto Reversal</option>
                  <option value="manual_bank">Manual Bank Account / UPI Credit</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="refund-reason">Reason for Refund</label>
              <input type="text" id="refund-reason" class="input-control" required placeholder="e.g. Student request within guarantee window">
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" onclick="closeRefundModal()">Cancel</button>
              <button type="submit" class="btn btn-danger">
                <span>Confirm & Reverse Payment</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
}
