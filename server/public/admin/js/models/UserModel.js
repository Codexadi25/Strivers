/**
 * User Access Control & Subscriptions Model
 */

import { apiRequest } from '../services/api.js';

export class UserModel {
  static async getUsers(search = '') {
    const query = new URLSearchParams();
    if (search) query.append('q', search);

    const res = await apiRequest(`/users?${query.toString()}`);
    return res.users || [];
  }

  static async grantAccess(payload) {
    return await apiRequest('/users/grant-access', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async revokeAccess(email) {
    return await apiRequest('/users/revoke-access', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  static async toggleRole(email, role) {
    return await apiRequest('/users/set-role', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  }

  static async resetPassword(payload) {
    return await apiRequest('/users/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}
