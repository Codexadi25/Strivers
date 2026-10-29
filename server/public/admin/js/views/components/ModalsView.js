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

            <div class="grid-2col">
              <div class="form-group">
                <label for="edit-title">Product Title</label>
                <input type="text" id="edit-title" class="input-control" required>
              </div>

              <div class="form-group">
                <label for="edit-category">Classification (Schema)</label>
                <select id="edit-category" class="select-control">
                  <option value="course">📚 Self-Paced Course (category: 'course')</option>
                  <option value="masterclass">🎯 Live Placement Masterclass (category: 'masterclass')</option>
                  <option value="channel">📢 Paid Job Channel (category: 'channel')</option>
                  <option value="workshop">⚡ Weekend Workshop (category: 'workshop')</option>
                </select>
              </div>
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
                <label for="new-category">Product Classification</label>
                <select id="new-category" class="select-control">
                  <option value="course" selected>📚 Self-Paced Course (category: 'course')</option>
                  <option value="masterclass">🎯 Live Placement Masterclass (category: 'masterclass')</option>
                  <option value="channel">📢 Paid Job Channel (category: 'channel')</option>
                  <option value="workshop">⚡ Weekend Workshop (category: 'workshop')</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="new-title">Product Title <span class="badge-required">*</span></label>
              <input type="text" id="new-title" class="input-control" required placeholder="e.g. 1-on-1 Mock Interview">
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

      <!-- MODAL: CREATE / EDIT MASTERCLASS (FULL-SCREEN VIEWPORT RATIO FIT) -->
      <div id="modal-create-masterclass" class="modal-overlay hidden">
        <div class="modal-card modal-viewport-fit">
          <div class="modal-header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="badge badge-success" style="font-size: 0.72rem; padding: 2px 7px;">STUDIO MODE</span>
                <h3 id="modal-masterclass-title-text" style="margin: 0; font-size: 1.22rem; font-weight: 700;">Masterclass & Live Session Studio</h3>
              </div>
              <span class="modal-subtitle">Design masterclass identity, interactive webinar rooms, pricing tiers, and curriculum outcomes</span>
            </div>
            <button class="btn-close" onclick="closeCreateMasterclassModal()">&times;</button>
          </div>

          <form id="form-create-masterclass" onsubmit="submitCreateMasterclass(event)" style="display: flex; flex-direction: column; flex: 1 1 auto; overflow: hidden; padding: 0;">
            <div class="modal-body-scroll">
              <!-- Section 1: Course Identity & Track -->
              <div class="studio-section-card">
                <div class="studio-section-header">
                  <h4>🎯 1. Course Track & Basic Identity</h4>
                  <span class="studio-pill">Required Metadata</span>
                </div>

                <div class="grid-2col">
                  <div class="form-group">
                    <label for="mc-id">Course Identifier (Slug) <span class="badge-required">*</span></label>
                    <input type="text" id="mc-id" class="input-control" required placeholder="e.g. masterclass, channel, quick_ops">
                    <span class="help-text">Permanent identifier used for checkout URLs & access permissions</span>
                  </div>

                  <div class="form-group">
                    <label for="mc-category">Schema Product Classification <span class="badge-required">*</span></label>
                    <select id="mc-category" class="select-control">
                      <option value="masterclass" selected>🎯 Live Placement Masterclass (isMasterclass: true)</option>
                      <option value="workshop">⚡ Interactive Workshop (isMasterclass: true)</option>
                    </select>
                    <span class="help-text">Distinguishes Masterclasses from self-paced Courses in the schema</span>
                  </div>
                </div>

                <div class="grid-2col">
                  <div class="form-group">
                    <label for="mc-title">Masterclass Title <span class="badge-required">*</span></label>
                    <input type="text" id="mc-title" class="input-control" required placeholder="e.g. Strivers Placement Masterclass">
                  </div>

                  <div class="form-group">
                    <label for="mc-badge">Promotional Card Badge / Tag</label>
                    <input type="text" id="mc-badge" class="input-control" placeholder="e.g. Live Every Sunday • Placement Guarantee">
                  </div>
                </div>

                <div class="form-group">
                  <label for="mc-desc">Subtitle / Value Proposition Blurb</label>
                  <input type="text" id="mc-desc" class="input-control" placeholder="e.g. Live online session every Sunday covering resume, LinkedIn, and cold email secrets.">
                </div>
              </div>

              <!-- Section 2: Pricing & Commercials -->
              <div class="studio-section-card">
                <div class="studio-section-header">
                  <h4>💵 2. Commercial Pricing & Access Model</h4>
                  <span class="studio-pill">Razorpay Integrated</span>
                </div>

                <div class="grid-2col">
                  <div class="form-group">
                    <label for="mc-price">Selling Price (₹ INR) <span class="badge-required">*</span></label>
                    <div class="input-prefix-wrap">
                      <span class="prefix">₹</span>
                      <input type="number" id="mc-price" class="input-control" min="0" step="1" required placeholder="21">
                    </div>
                    <span class="help-text">Gateway passes minimum 100 paise (₹1.00)</span>
                  </div>

                  <div class="form-group">
                    <label for="mc-original-price">Original Strike Price (₹ INR)</label>
                    <div class="input-prefix-wrap">
                      <span class="prefix">₹</span>
                      <input type="number" id="mc-original-price" class="input-control" min="0" step="1" placeholder="999">
                    </div>
                    <span class="help-text">Displayed crossed-out to highlight discount</span>
                  </div>
                </div>
              </div>

              <!-- Section 3: Live Broadcast Studio & Meeting Configuration -->
              <div class="studio-section-card">
                <div class="studio-section-header">
                  <h4>🎥 3. Live Broadcast Studio & Meeting Configuration</h4>
                  <span class="studio-pill">Webinar DRM</span>
                </div>

                <div class="grid-2col">
                  <div class="form-group">
                    <label for="mc-meeting-link">Active Meeting Link (Google Meet / Zoom)</label>
                    <input type="url" id="mc-meeting-link" class="input-control" placeholder="https://meet.google.com/abc-defg-hij">
                    <span class="help-text">Protected behind verified payment session</span>
                  </div>

                  <div class="form-group">
                    <label for="mc-session-status">Session Status</label>
                    <select id="mc-session-status" class="select-control">
                      <option value="upcoming">Upcoming Session (Countdown Mode)</option>
                      <option value="live">Live In Progress (Pulsing Red)</option>
                      <option value="completed">Completed / Archive</option>
                    </select>
                  </div>
                </div>

                <div class="grid-2col">
                  <div class="form-group">
                    <label for="mc-session-date">Session Schedule / Date Text</label>
                    <input type="text" id="mc-session-date" class="input-control" placeholder="e.g. Sunday, 11:00 AM IST">
                  </div>

                  <div class="form-group">
                    <label for="mc-secret-passcode">Attendee Secret Passcode (For Paid DRM Notes)</label>
                    <input type="text" id="mc-secret-passcode" class="input-control" placeholder="STRIVERS2026">
                    <span class="help-text">Announced live in class for enrolled students to unlock paid study materials for free</span>
                  </div>
                </div>
              </div>

              <!-- Section 4: Mentors & Instructors (Alex Morgan, Priya Sharma, Rahul Verma) -->
              <div class="studio-section-card">
                <div class="studio-section-header">
                  <h4>👨‍🏫 4. Mentors & Industry Instructors</h4>
                  <span class="studio-pill">Shown on Live Card</span>
                </div>

                <div class="admin-subcard" style="margin-bottom: 12px; padding: 12px 14px;">
                  <strong style="font-size: 0.85rem; color: #38bdf8;">Mentor 1:</strong>
                  <div class="grid-2col" style="margin-top: 6px;">
                    <input type="text" id="mc-m1-name" class="input-control" placeholder="Name (e.g. Alex Morgan)" value="Alex Morgan">
                    <input type="text" id="mc-m1-role" class="input-control" placeholder="Role (e.g. Ex-Google · SDE-2 @ Blinkit)" value="Ex-Google · SDE-2 @ Blinkit">
                  </div>
                  <input type="url" id="mc-m1-avatar" class="input-control" style="margin-top: 6px;" placeholder="Avatar URL" value="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80">
                </div>

                <div class="admin-subcard" style="margin-bottom: 12px; padding: 12px 14px;">
                  <strong style="font-size: 0.85rem; color: #38bdf8;">Mentor 2:</strong>
                  <div class="grid-2col" style="margin-top: 6px;">
                    <input type="text" id="mc-m2-name" class="input-control" placeholder="Name (e.g. Priya Sharma)" value="Priya Sharma">
                    <input type="text" id="mc-m2-role" class="input-control" placeholder="Role (e.g. Staff Engineer @ Zomato)" value="Staff Engineer @ Zomato">
                  </div>
                  <input type="url" id="mc-m2-avatar" class="input-control" style="margin-top: 6px;" placeholder="Avatar URL" value="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80">
                </div>

                <div class="admin-subcard" style="padding: 12px 14px;">
                  <strong style="font-size: 0.85rem; color: #38bdf8;">Mentor 3:</strong>
                  <div class="grid-2col" style="margin-top: 6px;">
                    <input type="text" id="mc-m3-name" class="input-control" placeholder="Name (e.g. Rahul Verma)" value="Rahul Verma">
                    <input type="text" id="mc-m3-role" class="input-control" placeholder="Role (e.g. Engineering Lead @ Porter)" value="Engineering Lead @ Porter">
                  </div>
                  <input type="url" id="mc-m3-avatar" class="input-control" style="margin-top: 6px;" placeholder="Avatar URL" value="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80">
                </div>
              </div>

              <!-- Section 5: Curriculum Highlights & Features -->
              <div class="studio-section-card">
                <div class="studio-section-header">
                  <h4>📝 5. Key Curriculum Outcomes & Highlights</h4>
                  <span class="studio-pill">Storefront Badges</span>
                </div>

                <div class="form-group">
                  <label for="mc-features">Curriculum Highlights (One bullet point per line)</label>
                  <textarea id="mc-features" class="input-control" rows="4" placeholder="Live online interactive session every Sunday&#10;Resume, portfolio, LinkedIn & Naukri review&#10;Cold emails, HR scripts and data skills for placements&#10;Direct entry to exclusive alumni channel"></textarea>
                  <span class="help-text">Rendered on student landing cards with green verified checkmarks</span>
                </div>
              </div>
            </div>

            <div class="modal-footer-sticky">
              <button type="button" class="btn btn-secondary" onclick="closeCreateMasterclassModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" style="padding: 9px 22px;">
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

            <div class="grid-2col">
              <div class="form-group">
                <label for="session-date-input">Session Schedule Text</label>
                <input type="text" id="session-date-input" class="input-control" placeholder="e.g. Sunday, 11:00 AM IST">
              </div>

              <div class="form-group">
                <label for="session-passcode-input">Attendee Secret Code (Notes DRM)</label>
                <input type="text" id="session-passcode-input" class="input-control" placeholder="STRIVERS2026">
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
              <h4 class="modal-section-title" style="margin-bottom: 12px;">+ Upload Downloadable Note / Study Material into MongoDB</h4>
              <form id="form-upload-material" onsubmit="submitUploadMaterial(event)">
                <div class="grid-2col">
                  <div class="form-group">
                    <label for="mat-title">Document Title <span class="badge-required">*</span></label>
                    <input type="text" id="mat-title" class="input-control" required placeholder="e.g. ATS Resume Blueprint & Dark Store Playbook">
                  </div>

                  <div class="form-group">
                    <label for="mat-type">Document Format <span class="badge-required">*</span></label>
                    <select id="mat-type" class="select-control">
                      <option value="pdf">PDF Document (.pdf)</option>
                      <option value="html">HTML Web Document (.html)</option>
                      <option value="notes">Handwritten Lecture Notes</option>
                      <option value="cheatsheet">High-Yield Cheatsheet</option>
                    </select>
                  </div>
                </div>

                <div class="grid-2col">
                  <div class="form-group">
                    <label for="mat-tier">Access Tier (Free vs Paid) <span class="badge-required">*</span></label>
                    <select id="mat-tier" class="select-control">
                      <option value="paid" selected>🔒 Paid Note (Enrolled in Masterclass / Attendee Code Required)</option>
                      <option value="free">🟢 Free Note (Accessible to all registered users)</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="mat-secret-code">Attendee Secret Passcode (For Live Masterclass)</label>
                    <input type="text" id="mat-secret-code" class="input-control" placeholder="e.g. STRIVERS2026 (Announced by mentor in class)">
                    <span class="help-text">Enrolled students attending the masterclass can enter this code to view for free.</span>
                  </div>
                </div>

                <div class="form-group">
                  <label for="mat-desc">Description / Instructions</label>
                  <input type="text" id="mat-desc" class="input-control" placeholder="e.g. Confidential interview breakdown shared during Sunday live session">
                </div>

                <div class="form-group">
                  <label for="mat-file-input">Select PDF or HTML File (Max 10MB Only)</label>
                  <input type="file" id="mat-file-input" class="input-control" accept=".pdf,.html,.htm">
                  <span class="help-text" style="color: #38bdf8;">⚡ Stored directly in MongoDB. Strict 10MB size limit. Anti-screenshot & anti-print protection enforced.</span>
                </div>

                <div class="form-group">
                  <label for="mat-text-input">...or Paste HTML / Markdown Content Directly</label>
                  <textarea id="mat-text-input" class="input-control" rows="3" placeholder="Paste formatted HTML or notes text here if not uploading a file..."></textarea>
                </div>

                <div style="display: flex; justify-content: flex-end; margin-top: 12px;">
                  <button type="submit" id="btn-submit-mat" class="btn btn-primary">
                    <span>Save Note to MongoDB (10MB Limit · View-Only DRM)</span>
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
        <div class="modal-card modal-viewport-fit" style="width: min(960px, 92vw); height: min(90vh, 840px);">
          <div class="modal-header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="badge badge-info" style="font-size: 0.72rem; padding: 2px 7px;">CURRICULUM SPEC</span>
                <h3 id="modal-sheet-title-text" style="margin: 0; font-size: 1.22rem; font-weight: 700;">Create Practice Sheet</h3>
              </div>
              <span class="modal-subtitle">Define target role, hiring companies, curriculum overview and enrollment price</span>
            </div>
            <button class="btn-close" onclick="closeAddPracticeSheetModal()">&times;</button>
          </div>

          <form id="form-create-practice-sheet" onsubmit="submitCreatePracticeSheet(event)" style="display: flex; flex-direction: column; flex: 1 1 auto; overflow: hidden; padding: 0;">
            <div class="modal-body-scroll">
              <div class="studio-section-card">
                <div class="studio-section-header">
                  <h4>🎯 Role & Sheet Identity</h4>
                  <span class="studio-pill">Required</span>
                </div>

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
              </div>

              <div class="studio-section-card">
                <div class="studio-section-header">
                  <h4>💵 Pricing & Access Configuration</h4>
                  <span class="studio-pill">Enrollment</span>
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
                  <textarea id="new-sheet-desc" class="input-control" rows="3" placeholder="Overview of operational scenarios, interview simulations, or algorithms covered in this sheet..."></textarea>
                </div>

                <div class="form-group" style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" id="new-sheet-is-template">
                  <label for="new-sheet-is-template" style="margin: 0; font-weight: 500;">
                    Mark as Template Mode (preserves as reference curriculum)
                  </label>
                </div>
              </div>
            </div>

            <div class="modal-footer-sticky">
              <button type="button" class="btn btn-secondary" onclick="closeAddPracticeSheetModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" style="padding: 9px 20px;">
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

      <!-- MODAL: PRACTICE SHEET CURRICULUM & PROBLEM BUILDER (FULL VIEWPORT RATIO FIT) -->
      <div id="modal-sheet-curriculum" class="modal-overlay hidden">
        <div class="modal-card modal-viewport-fit curriculum-wide">
          <div class="modal-header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="badge badge-info" style="font-size: 0.72rem; padding: 2px 7px;">CURRICULUM ENGINE</span>
                <h3 id="curriculum-sheet-title" style="margin: 0; font-size: 1.25rem; font-weight: 700; color: var(--text-main);">Practice Sheet Curriculum Builder</h3>
              </div>
              <span id="curriculum-sheet-subtitle" class="modal-subtitle">Manage topics, real-world problems & interview scenarios</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span id="curriculum-stats-pill" class="badge badge-info" style="font-size: 0.8rem; padding: 5px 12px;">0 Topics · 0 Problems</span>
              <button class="btn-close" onclick="closeCurriculumModal()">&times;</button>
            </div>
          </div>

          <div class="modal-body-scroll">
            <input type="hidden" id="curriculum-sheet-id">

            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
              <h4 class="modal-section-title" style="margin: 0;">Modules & Interview Scenarios:</h4>
            </div>

            <div id="curriculum-topics-container" style="margin-bottom: 24px;"></div>

            <!-- Add New Topic Section -->
            <div class="studio-section-card" style="margin-bottom: 20px;">
              <div class="studio-section-header">
                <h4>+ Add New Learning Module / Topic</h4>
                <span class="studio-pill">Curriculum Topic</span>
              </div>
              <form id="form-add-topic" onsubmit="submitAddTopic(event)" style="display: flex; gap: 10px; flex-wrap: wrap;">
                <input type="text" id="new-topic-title" class="input-control" style="flex: 2; min-width: 200px;" required placeholder="Topic Title (e.g. Dark Store Inventory & Shrinkage Control)">
                <input type="text" id="new-topic-summary" class="input-control" style="flex: 3; min-width: 250px;" placeholder="Topic summary / focus area">
                <button type="submit" class="btn btn-secondary btn-sm" style="white-space: nowrap; padding: 8px 16px;">+ Add Topic Module</button>
              </form>
            </div>

            <!-- Add Problem to Topic Section -->
            <div class="studio-section-card">
              <div class="studio-section-header">
                <h4>+ Add Real-World Problem / Interview Scenario</h4>
                <span class="studio-pill">Scenario Builder</span>
              </div>
              <form id="form-add-problem" onsubmit="submitAddProblem(event)">
                <div class="grid-2col">
                  <div class="form-group">
                    <label for="prob-target-topic">Select Module / Topic <span class="badge-required">*</span></label>
                    <select id="prob-target-topic" class="select-control" required>
                      <option value="">-- Choose a Topic --</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="prob-title">Scenario Title <span class="badge-required">*</span></label>
                    <input type="text" id="prob-title" class="input-control" required placeholder="e.g. Picker Route Optimization during 8 PM Surge">
                  </div>
                </div>

                <div class="grid-2col">
                  <div class="form-group">
                    <label for="prob-company">Target Company</label>
                    <input type="text" id="prob-company" class="input-control" placeholder="e.g. Blinkit, Zomato, Porter, Amazon, Swiggy">
                  </div>

                  <div class="form-group">
                    <label for="prob-difficulty">Difficulty Level</label>
                    <select id="prob-difficulty" class="select-control">
                      <option value="Easy">Easy / Warmup</option>
                      <option value="Medium" selected>Medium / Core Interview</option>
                      <option value="Hard">Hard / Senior & Lead</option>
                    </select>
                  </div>
                </div>

                <div class="grid-2col">
                  <div class="form-group">
                    <label for="prob-type">Classification / Problem Type</label>
                    <input type="text" id="prob-type" class="input-control" placeholder="e.g. Operational Math, Dispatch Logic, Metrics">
                  </div>

                  <div class="form-group">
                    <label for="prob-acceptance">Acceptance Rate</label>
                    <input type="text" id="prob-acceptance" class="input-control" placeholder="e.g. 88%">
                  </div>
                </div>

                <div class="form-group">
                  <label for="prob-scenario">Problem Statement / Business Scenario <span class="badge-required">*</span></label>
                  <textarea id="prob-scenario" class="input-control" rows="3" required placeholder="Describe the business scenario, operational constraint, or algorithm problem statement..."></textarea>
                </div>

                <div class="form-group">
                  <label for="prob-solution">Solution Guidance / Approach</label>
                  <textarea id="prob-solution" class="input-control" rows="2" placeholder="Key formula, calculation, approach, or algorithmic resolution..."></textarea>
                </div>

                <div class="grid-2col">
                  <div class="form-group">
                    <label for="prob-takeaway">Interview Takeaway / Key Concept</label>
                    <input type="text" id="prob-takeaway" class="input-control" placeholder="e.g. Prioritize aisle batching over individual order picking">
                  </div>

                  <div class="form-group">
                    <label for="prob-resource">Resource Link / Document Reference</label>
                    <input type="url" id="prob-resource" class="input-control" placeholder="https://leetcode.com/... or reference link">
                  </div>
                </div>

                <div style="display: flex; justify-content: flex-end; margin-top: 14px;">
                  <button type="submit" class="btn btn-primary" style="padding: 9px 20px;">
                    <span>+ Add Problem to Curriculum</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div class="modal-footer-sticky">
            <span class="text-muted" style="margin-right: auto; font-size: 0.82rem;">⚡ Changes to topics and scenarios are automatically saved to database</span>
            <button type="button" class="btn btn-secondary" onclick="closeCurriculumModal()">Close Window</button>
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

      <!-- MODAL: TRANSACTION DETAILS POPUP (Exact Merchant & Razorpay standard) -->
      <div id="modal-transaction-details" class="modal-overlay hidden" style="z-index: 99999;" onclick="if(event.target === this) closeTransactionDetailsModal()">
        <div class="txn-details-card">
          <div class="txn-details-header">
            <h3>Transaction Details</h3>
            <button class="txn-btn-close" onclick="closeTransactionDetailsModal()">&times;</button>
          </div>
          <div class="txn-details-body">
            <!-- Table 1: Transaction Information -->
            <div class="txn-table-wrap">
              <table class="txn-table">
                <thead>
                  <tr>
                    <th>Total Paid amount</th>
                    <th>Status</th>
                    <th>Txn. ref. ID</th>
                    <th>Payment mode(s)</th>
                    <th>Remark</th>
                  </tr>
                </thead>
                <tbody id="txn-modal-table-body">
                  <tr>
                    <td colspan="5" style="text-align: center; color: #6b7280; padding: 24px;">Loading transaction details...</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Middle Notice Banner -->
            <div id="txn-modal-refund-notice" class="txn-refund-banner">
              There are no refunds against this order
            </div>

            <!-- Table 2: Refund Details -->
            <div class="txn-table-wrap" style="margin-bottom: 0;">
              <table class="txn-table">
                <thead>
                  <tr>
                    <th>Refunded item</th>
                    <th>Item ID</th>
                    <th>Quantity</th>
                    <th>Refunded by</th>
                  </tr>
                </thead>
                <tbody id="txn-modal-refund-body">
                  <tr>
                    <td colspan="4" style="text-align: left; color: #1f2937; padding: 16px 18px;">No data available.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL: MANAGE PG DISPUTE / REFUND TICKET -->
      <div id="modal-manage-ticket" class="modal-overlay hidden" style="z-index: 99998;">
        <div class="modal-card" style="max-width: 600px;">
          <div class="modal-header">
            <h3>Resolve Support & Refund Ticket</h3>
            <button class="btn-close" onclick="closeManageTicketModal()">&times;</button>
          </div>
          <form id="form-manage-ticket" onsubmit="submitTicketResolution(event)">
            <input type="hidden" id="ticket-modal-id">
            <div class="form-group">
              <label>Ticket Reference & Customer</label>
              <div id="ticket-meta-preview" style="background: var(--bg-elevated); padding: 12px; border-radius: 8px; font-size: 0.9rem;"></div>
            </div>

            <div class="form-group">
              <label for="ticket-status-select">Update Resolution Status</label>
              <select id="ticket-status-select" class="select-control">
                <option value="open">Open (Awaiting SLA / Bank Reversal)</option>
                <option value="under_investigation">Under Investigation with Bank</option>
                <option value="refund_verified_pg">Refund Verified by Razorpay</option>
                <option value="manual_refund_done">Manual UPI / Bank Refund Issued</option>
                <option value="access_granted">Unlock Course Access Directly</option>
                <option value="resolved">Resolved & Closed</option>
              </select>
            </div>

            <div class="form-group">
              <label for="ticket-admin-remarks">Admin Resolution Remarks / Bank UTR</label>
              <textarea id="ticket-admin-remarks" class="input-control" rows="3" placeholder="Notes for reconciliation or student communication..."></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" onclick="closeManageTicketModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Ticket Resolution</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
}
