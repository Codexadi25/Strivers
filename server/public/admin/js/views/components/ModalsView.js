/**
 * Server Core Basic GUI - Modal Components View
 * Focused strictly on User Access Control & Password Reset Modals
 * (Catalog, Orders, Masterclasses, Practice Sheets, & Refunds shifted to ServerClient GUI /api/v2/adminaccess)
 */

export class ModalsView {
  static renderAllModals() {
    return `
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
                  <option value="course_fullstack">Full-Stack Software Engineering</option>
                </select>
              </div>

              <div class="form-group">
                <label for="grant-sheet">Grant Practice Sheet Access</label>
                <select id="grant-sheet" class="select-control">
                  <option value="">-- No Specific Sheet --</option>
                  <option value="non-tech-ops-zomato-blinkit">Quick Commerce Operations Lead (Zomato/Blinkit)</option>
                  <option value="non-tech-logistics-porter-amazon">Intracity Fleet & Logistics (Porter/Amazon)</option>
                  <option value="non-tech-growth-flipkart-amazon">Category Growth & Margin (Flipkart/Amazon)</option>
                  <option value="tech-sde-dsa-75">Technical SDE Sheet</option>
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
              <span class="help-text">Will be encrypted using Scrypt and saved to user record.</span>
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
    `;
  }
}
