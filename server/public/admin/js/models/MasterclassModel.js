/**
 * Masterclass, Live Sessions & Study Materials Model
 */

import { apiRequest } from '../services/api.js';

export class MasterclassModel {
  static async getAll() {
    // Specifically fetch Masterclasses distinguished from Courses in the schema
    const res = await apiRequest('/masterclasses');
    return res.masterclasses || res.courses || [];
  }

  static async create(payload) {
    // Ensure payload is explicitly tagged as a Masterclass
    const masterclassPayload = {
      ...payload,
      category: 'masterclass',
      isMasterclass: true,
      productType: 'masterclass',
    };
    return await apiRequest('/courses', {
      method: 'POST',
      body: JSON.stringify(masterclassPayload),
    });
  }

  static async delete(productId) {
    try {
      return await apiRequest(`/masterclasses/${encodeURIComponent(productId)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      return await apiRequest(`/courses/${encodeURIComponent(productId)}`, {
        method: 'DELETE',
      });
    }
  }

  static async updateSession(productId, payload) {
    return await apiRequest(`/courses/${encodeURIComponent(productId)}/session`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  static async addTimingSlot(productId, payload) {
    return await apiRequest(`/courses/${encodeURIComponent(productId)}/slots`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async deleteTimingSlot(productId, slotId) {
    return await apiRequest(`/courses/${encodeURIComponent(productId)}/slots/${encodeURIComponent(slotId)}`, {
      method: 'DELETE',
    });
  }

  static async uploadStudyMaterial(productId, payload) {
    return await apiRequest(`/courses/${encodeURIComponent(productId)}/materials`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async deleteStudyMaterial(productId, materialId) {
    return await apiRequest(`/courses/${encodeURIComponent(productId)}/materials/${encodeURIComponent(materialId)}`, {
      method: 'DELETE',
    });
  }
}
