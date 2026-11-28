const mongoose = require('mongoose');
const NoteStore = require('../utils/noteStore');
const UserAccess = require('../models/UserAccess');
const ActivityLog = require('../models/ActivityLog');

/**
 * 1. Get All Notes (Public & Logged-in Listing)
 */
exports.getNotes = async (req, res, next) => {
  try {
    const email = req.user?.email || '';
    const uid = req.user?.uid || '';
    let userAccess = null;
    let isAdmin = false;

    if (req.user) {
      if (mongoose.connection.readyState === 1) {
        try {
          userAccess = await UserAccess.findOne({ $or: [{ userId: uid }, { email: email.toLowerCase() }] }).maxTimeMS(1500);
        } catch (_) {}
      }
      if (!userAccess) {
        const UserStore = require('../utils/userStore');
        userAccess = UserStore.findRaw(email || uid);
      }
      isAdmin = userAccess?.role === 'admin' || req.user.role === 'admin';
    }

    const notes = NoteStore.getAll(isAdmin, userAccess);
    return res.json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Get Note Content for DRM Viewer
 */
exports.getNoteContent = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = NoteStore.getById(noteId, true);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    const email = req.user?.email || '';
    const uid = req.user?.uid || '';
    let userAccess = null;
    let isAdmin = false;

    if (req.user) {
      const UserStore = require('../utils/userStore');
      userAccess = UserStore.findRaw(email || uid);
      isAdmin = userAccess?.role === 'admin' || req.user.role === 'admin';
    }

    if (note.type === 'paid' && !isAdmin) {
      const isEnrolled = Boolean(
        userAccess?.hasActiveSubscription ||
        userAccess?.enrolledCourses?.some(
          (c) => c.courseId === note.linkedMasterclassId || c.courseId === 'masterclass'
        )
      );

      if (!isEnrolled) {
        return res.status(403).json({
          success: false,
          message: 'This is a Paid Note. You must be enrolled in the Masterclass or enter the attendee secret code to view.',
        });
      }
    }

    return res.json({
      success: true,
      noteId: note.noteId,
      title: note.title,
      fileType: note.fileType || 'html',
      mimeType: note.mimeType || 'text/html',
      fileData: note.fileData,
      watermark: email || 'student@strivers.tech',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Redeem Secret Passcode
 */
exports.redeemSecretCode = async (req, res, next) => {
  try {
    const noteId = req.params.noteId || req.body.noteId;
    const secretCode = req.body.secretCode;
    const result = NoteStore.redeemCode(noteId, secretCode);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Admin: Upload Note
 */
exports.adminUploadNote = async (req, res, next) => {
  try {
    const created = NoteStore.create(req.body);
    return res.status(201).json({
      success: true,
      message: `Note "${created.title}" saved cleanly in database.`,
      note: created,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Admin: Update Note
 */
exports.adminUpdateNote = async (req, res, next) => {
  try {
    const updated = NoteStore.update(req.params.noteId, req.body);
    if (updated) {
      return res.json({
        success: true,
        message: `Note "${updated.title}" updated cleanly.`,
        note: updated,
      });
    }
    return res.status(404).json({ success: false, message: 'Note not found.' });
  } catch (error) {
    next(error);
  }
};

/**
 * 6. Admin: Delete Note
 */
exports.adminDeleteNote = async (req, res, next) => {
  try {
    const ok = NoteStore.delete(req.params.noteId);
    if (ok) {
      return res.json({
        success: true,
        message: `Note deleted cleanly from database.`,
      });
    }
    return res.status(404).json({ success: false, message: 'Note not found.' });
  } catch (error) {
    next(error);
  }
};
