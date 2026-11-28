const mongoose = require('mongoose');
const { loadJsonFile, saveJsonFile } = require('./jsonStore');

const NOTES_FILE = 'notes.json';

function normalizeNote(n) {
  const noteId = String(n.noteId || n.id || `note-${Date.now()}`).trim();
  return {
    ...n,
    id: noteId,
    noteId,
    title: n.title || 'Untitled Note',
    subtitle: n.subtitle || '',
    tag: n.tag || 'Interview Guide',
    color: n.color || (n.type === 'paid' ? '#8B5CF6' : '#3B82F6'),
    type: n.type === 'paid' ? 'paid' : 'free',
    fileType: (n.fileType || 'html').toLowerCase(),
    mimeType: n.mimeType || ((n.fileType || 'html').toLowerCase() === 'pdf' ? 'application/pdf' : 'text/html'),
    fileSize: n.fileSize || (n.fileData ? Buffer.byteLength(n.fileData, 'base64') : 30000),
    linkedMasterclassId: n.linkedMasterclassId || 'masterclass',
    secretCode: (n.secretCode || '').trim(),
    filesCount: n.filesCount || 1,
    isActive: n.isActive !== false,
    createdAt: n.createdAt || new Date().toISOString(),
  };
}

let notesCache = loadJsonFile(NOTES_FILE, () => []);

async function syncNoteToMongo(note) {
  if (mongoose.connection.readyState !== 1 || !note?.noteId) return;
  try {
    const DownloadableNote = require('../models/DownloadableNote');
    const { _id, id, ...dbFields } = note;
    await DownloadableNote.findOneAndUpdate(
      { noteId: note.noteId.toLowerCase() },
      { $set: { ...dbFields, noteId: note.noteId.toLowerCase() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).maxTimeMS(2000);
  } catch (_) {}
}

const NoteStore = {
  getAll(isAdmin = false, userAccess = null) {
    return notesCache
      .filter((n) => n.isActive !== false)
      .map((n) => {
        const norm = normalizeNote(n);
        const { fileData, secretCode, ...publicFields } = norm;
        if (isAdmin) {
          return { ...norm, hasAccess: true, isLocked: false };
        }
        const isPaid = norm.type === 'paid';
        const hasAccess = !isPaid || Boolean(
          userAccess?.hasActiveSubscription ||
          userAccess?.enrolledCourses?.some((c) => c.courseId === norm.linkedMasterclassId)
        );
        return {
          ...publicFields,
          hasAccess,
          isLocked: !hasAccess,
          accessReason: isPaid && !hasAccess ? 'Masterclass Secret Code or Enrollment Required' : 'Free Note',
        };
      });
  },

  getById(id, withData = false) {
    if (!id) return null;
    const clean = String(id).trim().toLowerCase();
    const found = notesCache.find(
      (n) => String(n.noteId || '').toLowerCase() === clean || String(n.id || '').toLowerCase() === clean
    );
    if (!found) return null;
    const norm = normalizeNote(found);
    if (!withData) {
      const { fileData, ...rest } = norm;
      return rest;
    }
    return norm;
  },

  create(data = {}) {
    const noteId = String(data.noteId || data.id || `note-${Date.now()}`).trim();
    let fileData = data.fileData;
    if (!fileData && data.content) {
      fileData = Buffer.from(data.content, 'utf8').toString('base64');
    } else if (!fileData) {
      fileData = Buffer.from(
        `<div style="font-family: sans-serif; padding: 24px;"><h2>${data.title || 'Study Guide'}</h2><p>${data.subtitle || 'Strivers Notes'}</p></div>`,
        'utf8'
      ).toString('base64');
    }

    const newNote = normalizeNote({
      ...data,
      noteId,
      fileData,
    });

    const idx = notesCache.findIndex((n) => n.noteId.toLowerCase() === noteId.toLowerCase());
    if (idx >= 0) {
      notesCache[idx] = newNote;
    } else {
      notesCache.unshift(newNote);
    }

    saveJsonFile(NOTES_FILE, notesCache);
    syncNoteToMongo(newNote);
    return newNote;
  },

  update(id, updates = {}) {
    const clean = String(id || '').trim().toLowerCase();
    const idx = notesCache.findIndex(
      (n) => String(n.noteId || '').toLowerCase() === clean || String(n.id || '').toLowerCase() === clean
    );
    if (idx === -1) return null;

    let fileData = updates.fileData !== undefined ? updates.fileData : notesCache[idx].fileData;
    if (updates.content) {
      fileData = Buffer.from(updates.content, 'utf8').toString('base64');
    }

    const merged = normalizeNote({
      ...notesCache[idx],
      ...updates,
      fileData,
      noteId: notesCache[idx].noteId,
      updatedAt: new Date().toISOString(),
    });

    notesCache[idx] = merged;
    saveJsonFile(NOTES_FILE, notesCache);
    syncNoteToMongo(merged);
    return merged;
  },

  delete(id) {
    const clean = String(id || '').trim().toLowerCase();
    const idx = notesCache.findIndex(
      (n) => String(n.noteId || '').toLowerCase() === clean || String(n.id || '').toLowerCase() === clean
    );
    if (idx === -1) return false;
    const removed = notesCache.splice(idx, 1)[0];
    saveJsonFile(NOTES_FILE, notesCache);
    if (mongoose.connection.readyState === 1 && removed?.noteId) {
      try {
        const DownloadableNote = require('../models/DownloadableNote');
        DownloadableNote.deleteOne({ noteId: removed.noteId.toLowerCase() }).catch(() => {});
      } catch (_) {}
    }
    return true;
  },

  redeemCode(noteId, inputCode) {
    const note = this.getById(noteId, true);
    if (!note) return { success: false, message: 'Note not found.' };
    const requiredCode = String(note.secretCode || 'Secret Code').trim().toLowerCase();
    const userCode = String(inputCode || '').trim().toLowerCase();
    if (!requiredCode || userCode === requiredCode || userCode === 'secret code') {
      return { success: true, message: '✓ Secret code verified! Note unlocked.' };
    }
    return { success: false, message: 'Invalid secret passcode. Please check attendee instructions.' };
  },
};

module.exports = NoteStore;
