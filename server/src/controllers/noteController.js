const mongoose = require('mongoose');
const DownloadableNote = require('../models/DownloadableNote');
const UserAccess = require('../models/UserAccess');
const ActivityLog = require('../models/ActivityLog');

// Default initial seed notes in case the database is freshly initialized
const DEFAULT_SEED_NOTES = [
  {
    noteId: 'note-internship-guide-2026',
    title: 'Internship Programs & Referral Vault',
    subtitle: '25+ High-Growth Tech Internship & Hackathon Programs for Students',
    tag: 'Career & Off-Campus',
    color: '#3B82F6',
    type: 'free',
    fileType: 'html',
    mimeType: 'text/html',
    fileSize: 42000,
    linkedMasterclassId: 'masterclass',
    secretCode: '',
    fileData: Buffer.from(`
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #1e293b; line-height: 1.6;">
        <h1 style="color: #2563eb; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">🎓 2026 Engineering Internship & Hackathon Handbook</h1>
        <p style="font-size: 1.05rem; color: #475569;">Curated roadmap with active intake timelines for Google STEP, Amazon WOW, Microsoft Engage, and Flipkart GRiD.</p>
        <h2 style="color: #0f172a; margin-top: 24px;">1. Preparation Timeline</h2>
        <ul>
          <li><strong>Resume ATS Formatting:</strong> Single column, no tables, metric-driven bullet points (XYZ format).</li>
          <li><strong>Core DSA Checklist:</strong> Two Pointers, Sliding Window, Trees BFS/DFS, Top K elements.</li>
          <li><strong>Cold Outreach Playbook:</strong> Email templates for reaching Engineering Managers directly on LinkedIn.</li>
        </ul>
        <h2 style="color: #0f172a; margin-top: 24px;">2. Direct Referral Protocols</h2>
        <p>Always attach a hosted live URL of your side project along with GitHub pull requests demonstrating clean commit history.</p>
      </div>
    `).toString('base64'),
  },
  {
    noteId: 'note-cs-fundamentals-mastery',
    title: 'CS Fundamentals & OS / DBMS Cheatsheet',
    subtitle: 'Operating Systems, Deadlocks, SQL Indexing, ACID & Network Protocols',
    tag: 'Core Academic',
    color: '#10B981',
    type: 'free',
    fileType: 'html',
    mimeType: 'text/html',
    fileSize: 64000,
    linkedMasterclassId: 'masterclass',
    secretCode: '',
    fileData: Buffer.from(`
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #1e293b; line-height: 1.6;">
        <h1 style="color: #059669; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">💻 CS Core Fundamentals Revision Compendium</h1>
        <h2 style="color: #0f172a;">Operating Systems: Critical Topics</h2>
        <ul>
          <li><strong>Process vs Thread:</strong> Process has private virtual address space; threads share heap, code, data.</li>
          <li><strong>Virtual Memory:</strong> Paging, TLB cache lookups, Page faults, and LRU replacement.</li>
          <li><strong>Deadlock Conditions:</strong> Mutual exclusion, Hold & wait, No preemption, Circular wait.</li>
        </ul>
        <h2 style="color: #0f172a; margin-top: 24px;">DBMS & Indexing</h2>
        <ul>
          <li><strong>B+ Trees:</strong> Why databases prefer B+ Trees over Hash Indexes for range scans.</li>
          <li><strong>ACID Guarantees:</strong> Isolation levels (Read Committed vs Repeatable Read vs Serializable).</li>
        </ul>
      </div>
    `).toString('base64'),
  },
  {
    noteId: 'note-strivers-placement-masterclass-docket',
    title: '🔒 Strivers VIP Placement Masterclass Strategic Playbook',
    subtitle: 'Exclusive Operational Case Studies, Dark Store Metrics & Live Masterclass Secrets',
    tag: 'VIP Masterclass',
    color: '#8B5CF6',
    type: 'paid', // PAID Note
    fileType: 'html',
    mimeType: 'text/html',
    fileSize: 88000,
    linkedMasterclassId: 'masterclass',
    secretCode: 'STRIVERS2026', // Secret code for masterclass attendees
    fileData: Buffer.from(`
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 28px; color: #0f172a; line-height: 1.65;">
        <div style="background: #f5f3ff; border: 1.5px solid #c4b5fd; border-radius: 10px; padding: 18px 24px; margin-bottom: 24px;">
          <h2 style="margin: 0 0 6px; color: #6d28d9;">⭐ Strivers VIP Masterclass Attendee Exclusive</h2>
          <p style="margin: 0; color: #5b21b6; font-size: 0.95rem;">Confidential interview playbooks shared during Sunday Live Sessions for Unicorn Operations & Tech Hiring.</p>
        </div>
        <h2 style="color: #1e1b4b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">1. Operational Metrics & Dark Store Math</h2>
        <p>Key formulas demanded in Zomato, Blinkit, and Porter interviews:</p>
        <ul>
          <li><strong>Picker Order Processing Speed:</strong> Total items picked divided by active session minutes. Standard benchmark: &lt; 85 seconds per tote.</li>
          <li><strong>Rider Batching Efficiency:</strong> Consolidating 2 drop locations within an 800m delivery radius without violating 10-minute delivery SLAs.</li>
          <li><strong>Inventory Safety Stock:</strong> Dynamic lead-time demand buffer calculated via normal distribution variance.</li>
        </ul>
        <h2 style="color: #1e1b4b; margin-top: 24px;">2. Interview Framing Framework: STAR-P</h2>
        <p>Situation · Task · Action · Result · <strong>Principles Learned</strong>. Always emphasize measurable customer impact (e.g. "Reduced drop-off by 14% while lowering fleet burn by 8%").</p>
      </div>
    `).toString('base64'),
  },
];

/**
 * Seed initial notes into MongoDB if table is empty
 */
async function ensureSeedNotes() {
  if (mongoose.connection.readyState !== 1) return;
  try {
    const count = await DownloadableNote.countDocuments();
    if (count === 0) {
      await DownloadableNote.insertMany(DEFAULT_SEED_NOTES);
      console.log('Seeded initial Downloadable Notes in MongoDB.');
    }
  } catch (err) {
    console.warn('Note seed warning:', err.message);
  }
}
ensureSeedNotes();

/**
 * 1. Get All Notes (Public Listing with Auth & Access Check)
 * Enforces requirement: A regular user who has not logged in CANNOT access downloadable notes section.
 */
exports.getNotes = async (req, res, next) => {
  try {
    // REQUIREMENT: Must be logged in
    if (!req.user) {
      return res.status(401).json({
        success: false,
        requiresLogin: true,
        message: 'Authentication required. Please sign in to access Downloadable Notes.',
      });
    }

    const { email, uid } = req.user;
    const userAccess = await UserAccess.findOne({ $or: [{ userId: uid }, { email: email.toLowerCase() }] });
    const isAdmin = userAccess?.role === 'admin';

    let notes = [];
    if (mongoose.connection.readyState === 1) {
      notes = await DownloadableNote.find({ isActive: true })
        .select('-fileData') // Exclude fileData payload from list to keep lightweight
        .sort({ orderIndex: 1, createdAt: -1 });
    }

    if (!notes || notes.length === 0) {
      notes = DEFAULT_SEED_NOTES.map(({ fileData, ...rest }) => rest);
    }

    // Filter out deleted notes
    notes = notes.filter((n) => !deletedNoteIds.has(String(n.noteId || '').toLowerCase()));

    // Determine access for each note based on free/paid, masterclass enrollment, and secret code redemption
    const formattedNotes = notes.map((n) => {
      const noteObj = n.toObject ? n.toObject() : { ...n };
      const isPaid = noteObj.type === 'paid';

      let hasAccess = false;
      let accessReason = 'Free note for all registered students';

      if (!isPaid) {
        hasAccess = true;
      } else if (isAdmin) {
        hasAccess = true;
        accessReason = 'Admin override';
      } else {
        // Check if user is enrolled in the linked masterclass or has active subscription
        const isEnrolledInCourse =
          userAccess?.hasActiveSubscription ||
          (userAccess?.enrolledCourses || []).some(
            (c) => c.courseId === noteObj.linkedMasterclassId || c.courseId === 'masterclass'
          );

        // Check if user redeemed secret code
        const isRedeemed =
          (noteObj.allowedRedeemedUsers || []).includes(email.toLowerCase()) ||
          (userAccess?.unlockedNotes || []).includes(noteObj.noteId);

        if (isEnrolledInCourse) {
          hasAccess = true;
          accessReason = 'Enrolled Masterclass Member';
        } else if (isRedeemed) {
          hasAccess = true;
          accessReason = 'Unlocked via Attendee Secret Code';
        } else {
          hasAccess = false;
          accessReason = 'Paid Note - Masterclass enrollment or Secret Code required';
        }
      }

      // Hide secretCode from public response
      delete noteObj.secretCode;
      delete noteObj.allowedRedeemedUsers;

      return {
        ...noteObj,
        hasAccess,
        accessReason,
        isLocked: !hasAccess,
      };
    });

    return res.status(200).json({
      success: true,
      notes: formattedNotes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Get Single Note Content (Strict View-Only DRM Stream)
 */
exports.getNoteContent = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        requiresLogin: true,
        message: 'Authentication required. Please sign in to access Downloadable Notes.',
      });
    }

    const { noteId } = req.params;
    const { email, uid } = req.user;
    const userAccess = await UserAccess.findOne({ $or: [{ userId: uid }, { email: email.toLowerCase() }] });
    const isAdmin = userAccess?.role === 'admin';

    let note = null;
    if (mongoose.connection.readyState === 1) {
      note = await DownloadableNote.findOne({ noteId: noteId.toLowerCase(), isActive: true });
    }

    if (!note) {
      note = DEFAULT_SEED_NOTES.find((n) => n.noteId.toLowerCase() === noteId.toLowerCase());
    }

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    // Verify Access for Paid notes
    const isPaid = note.type === 'paid';
    if (isPaid && !isAdmin) {
      const isEnrolledInCourse =
        userAccess?.hasActiveSubscription ||
        (userAccess?.enrolledCourses || []).some(
          (c) => c.courseId === note.linkedMasterclassId || c.courseId === 'masterclass'
        );

      const isRedeemed =
        (note.allowedRedeemedUsers || []).includes(email.toLowerCase()) ||
        (userAccess?.unlockedNotes || []).includes(note.noteId);

      if (!isEnrolledInCourse && !isRedeemed) {
        return res.status(403).json({
          success: false,
          paymentRequired: true,
          canRedeemSecretCode: Boolean(note.secretCode),
          message:
            'This is a Paid Note. You must be enrolled in the Masterclass or enter the attendee Secret Code to view.',
        });
      }
    }

    // Log the read event for security forensics
    await ActivityLog.create({
      userId: uid,
      userEmail: email,
      action: 'NOTE_VIEWED',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Client',
      metaData: { noteId: note.noteId, title: note.title, type: note.type, fileType: note.fileType },
    });

    return res.status(200).json({
      success: true,
      noteId: note.noteId,
      title: note.title,
      subtitle: note.subtitle,
      tag: note.tag,
      type: note.type,
      fileType: note.fileType,
      mimeType: note.mimeType,
      fileData: note.fileData,
      watermark: email,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Redeem Masterclass Attendee Secret Code
 * REQUIREMENT: During a Masterclass, all attending users enrolled in that masterclass
 * are provided with a secret code that can only be used by those users only to View the Paid Notes for Free.
 */
exports.redeemSecretCode = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Please sign in to redeem your masterclass secret code.' });
    }

    const { noteId, secretCode, masterclassId = 'masterclass' } = req.body;
    if (!noteId || !secretCode) {
      return res.status(400).json({ success: false, message: 'Note ID and Secret Code are required.' });
    }

    const email = req.user.email.toLowerCase();
    const uid = req.user.uid;

    const userAccess = await UserAccess.findOne({ $or: [{ userId: uid }, { email }] });

    // 1. Verify that user is actually ENROLLED in that masterclass
    const isEnrolled =
      userAccess?.role === 'admin' ||
      userAccess?.hasActiveSubscription ||
      (userAccess?.enrolledCourses || []).some(
        (c) => c.courseId === masterclassId || c.courseId === 'masterclass' || c.courseId === 'placement_masterclass'
      );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        notEnrolled: true,
        message:
          'This secret code can only be used by users enrolled in the Masterclass. Please enroll in the Masterclass first to redeem attendee privileges.',
      });
    }

    // 2. Find the note
    let note = await DownloadableNote.findOne({ noteId: noteId.toLowerCase(), isActive: true });
    if (!note) {
      const seedMatch = DEFAULT_SEED_NOTES.find((n) => n.noteId.toLowerCase() === noteId.toLowerCase());
      if (seedMatch) {
        note = await DownloadableNote.create(seedMatch);
      }
    }

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    if (note.type !== 'paid') {
      return res.status(200).json({ success: true, message: 'This note is already free and accessible.' });
    }

    // 3. Verify the secret code matches
    const expectedCode = (note.secretCode || 'STRIVERS2026').trim().toUpperCase();
    const providedCode = secretCode.trim().toUpperCase();

    if (providedCode !== expectedCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Secret Code. Please enter the active attendee code announced by the mentor in class.',
      });
    }

    // 4. Mark unlocked for this user
    if (!note.allowedRedeemedUsers.includes(email)) {
      note.allowedRedeemedUsers.push(email);
      await note.save();
    }

    if (userAccess && (!userAccess.unlockedNotes || !userAccess.unlockedNotes.includes(note.noteId))) {
      userAccess.unlockedNotes = userAccess.unlockedNotes || [];
      userAccess.unlockedNotes.push(note.noteId);
      await userAccess.save();
    }

    await ActivityLog.create({
      userId: uid,
      userEmail: email,
      action: 'NOTE_SECRET_CODE_REDEEMED',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Client',
      metaData: { noteId: note.noteId, title: note.title, masterclassId },
    });

    return res.status(200).json({
      success: true,
      message: '✓ Masterclass Secret Code verified! Paid Note is now unlocked permanently for your account.',
      noteId: note.noteId,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Admin: Upload Note in PDF or HTML format (Up to 10MB only in MongoDB)
 */
exports.adminUploadNote = async (req, res, next) => {
  try {
    const {
      noteId,
      title,
      subtitle,
      tag,
      type = 'free',
      fileType, // 'pdf' or 'html'
      mimeType,
      fileData, // Base64
      fileSize, // In bytes
      linkedMasterclassId = 'masterclass',
      secretCode = '',
      color,
    } = req.body;

    if (!title || !fileType || !fileData) {
      return res.status(400).json({
        success: false,
        message: 'Title, fileType (pdf or html), and file payload are required.',
      });
    }

    // Enforce format strictly: PDF or HTML
    if (!['pdf', 'html'].includes(fileType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file format. Only PDF (.pdf) and HTML (.html) formats are supported.',
      });
    }

    // REQUIREMENT: File size up to 10MB only in MongoDB
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB = 10,485,760 bytes
    const calculatedSize = fileSize || Buffer.byteLength(fileData, 'base64') || fileData.length;

    if (calculatedSize > maxSizeBytes) {
      return res.status(400).json({
        success: false,
        message: `File size exceeds 10MB limit. Provided size: ${(calculatedSize / (1024 * 1024)).toFixed(2)} MB. Maximum allowed is 10.00 MB.`,
      });
    }

    const effectiveId = (noteId || `note-${Date.now()}`).trim().toLowerCase();
    const effectiveMime = mimeType || (fileType === 'pdf' ? 'application/pdf' : 'text/html');

    const note = await DownloadableNote.findOneAndUpdate(
      { noteId: effectiveId },
      {
        $set: {
          noteId: effectiveId,
          title: title.trim(),
          subtitle: (subtitle || '').trim(),
          tag: (tag || 'Interview Guide').trim(),
          type: type === 'paid' ? 'paid' : 'free',
          fileType: fileType.toLowerCase(),
          mimeType: effectiveMime,
          fileData,
          fileSize: calculatedSize,
          linkedMasterclassId: linkedMasterclassId.trim(),
          secretCode: (secretCode || '').trim(),
          color: color || (type === 'paid' ? '#8B5CF6' : '#3B82F6'),
          uploadedBy: req.user?.email || 'admin',
          isActive: true,
        },
      },
      { upsert: true, new: true }
    );

    await ActivityLog.create({
      userId: req.user?.uid || 'admin',
      userEmail: req.user?.email || 'admin@yourdomain.com',
      action: 'NOTE_UPLOADED_DRM',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Admin-Console',
      metaData: {
        noteId: note.noteId,
        title: note.title,
        type: note.type,
        fileType: note.fileType,
        sizeMb: (calculatedSize / (1024 * 1024)).toFixed(2),
      },
    });

    return res.status(201).json({
      success: true,
      message: `Note "${note.title}" (${note.type.toUpperCase()}) saved securely in MongoDB (${(calculatedSize / 1024).toFixed(1)} KB).`,
      note: {
        noteId: note.noteId,
        title: note.title,
        type: note.type,
        fileType: note.fileType,
        fileSize: note.fileSize,
        secretCode: note.secretCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Admin: Update Note Metadata & Secret Passcode
 */
exports.adminUpdateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const { title, subtitle, tag, type, secretCode, linkedMasterclassId, isActive } = req.body;

    const note = await DownloadableNote.findOne({ noteId: noteId.toLowerCase() });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    if (title !== undefined) note.title = title.trim();
    if (subtitle !== undefined) note.subtitle = subtitle.trim();
    if (tag !== undefined) note.tag = tag.trim();
    if (type !== undefined && ['free', 'paid'].includes(type)) note.type = type;
    if (secretCode !== undefined) note.secretCode = secretCode.trim();
    if (linkedMasterclassId !== undefined) note.linkedMasterclassId = linkedMasterclassId.trim();
    if (isActive !== undefined) note.isActive = Boolean(isActive);

    await note.save();

    return res.status(200).json({
      success: true,
      message: `Note "${note.title}" updated successfully.`,
      note,
    });
  } catch (error) {
    next(error);
  }
};

// In-memory set of deleted note IDs to prevent seeds or fallback from resurrecting
const deletedNoteIds = new Set();

/**
 * 6. Admin: Delete Note
 */
exports.adminDeleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const targetId = String(noteId || '').trim();
    deletedNoteIds.add(targetId.toLowerCase());

    let note = null;
    if (mongoose.connection.readyState === 1) {
      note = await DownloadableNote.findOneAndDelete({
        $or: [
          { noteId: targetId.toLowerCase() },
          { noteId: targetId },
          { _id: mongoose.isValidObjectId(targetId) ? targetId : null },
        ],
      });
    }

    // Also remove from in-memory seed list if present
    const seedIdx = DEFAULT_SEED_NOTES.findIndex(
      (n) => n.noteId.toLowerCase() === targetId.toLowerCase() || n.noteId === targetId
    );
    if (seedIdx >= 0) {
      note = note || DEFAULT_SEED_NOTES[seedIdx];
      DEFAULT_SEED_NOTES.splice(seedIdx, 1);
    }

    await ActivityLog.create({
      userId: req.user?.uid || 'admin',
      userEmail: req.user?.email || 'admin@yourdomain.com',
      action: 'NOTE_DELETED',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Admin-Console',
      metaData: { noteId: targetId, title: note?.title || targetId },
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: `Note "${note?.title || targetId}" deleted from database.`,
    });
  } catch (error) {
    next(error);
  }
};

