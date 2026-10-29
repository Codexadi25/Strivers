/**
 * Practice Sheets & Curriculum Model
 */

import { apiRequest } from '../services/api.js';

export class PracticeModel {
  static async getSheets() {
    const res = await apiRequest('/practice/sheets');
    return res.sheets || [];
  }

  static async createSheet(payload) {
    return await apiRequest('/practice/sheets', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async updatePrice(sheetId, payload) {
    return await apiRequest(`/practice/sheets/${encodeURIComponent(sheetId)}/price`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  static async deleteSheet(sheetId) {
    return await apiRequest(`/practice/sheets/${encodeURIComponent(sheetId)}`, {
      method: 'DELETE',
    });
  }

  static async addTopic(sheetId, payload) {
    return await apiRequest(`/practice/sheets/${encodeURIComponent(sheetId)}/topics`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async deleteTopic(sheetId, topicId) {
    return await apiRequest(`/practice/sheets/${encodeURIComponent(sheetId)}/topics/${encodeURIComponent(topicId)}`, {
      method: 'DELETE',
    });
  }

  static async addProblem(sheetId, topicId, payload) {
    return await apiRequest(`/practice/sheets/${encodeURIComponent(sheetId)}/topics/${encodeURIComponent(topicId)}/problems`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async deleteProblem(sheetId, topicId, problemId) {
    return await apiRequest(`/practice/sheets/${encodeURIComponent(sheetId)}/topics/${encodeURIComponent(topicId)}/problems/${encodeURIComponent(problemId)}`, {
      method: 'DELETE',
    });
  }
}
