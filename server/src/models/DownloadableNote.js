const mongoose = require('mongoose');

const downloadableNoteSchema = new mongoose.Schema(
  {
    noteId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
      trim: true,
    },
    tag: {
      type: String,
      default: 'Interview Guide',
      trim: true,
    },
    color: {
      type: String,
      default: '#3B82F6',
    },
    // Note Classification: 'free' (available to any logged-in user) or 'paid' (enrolled / secret code required)
    type: {
      type: String,
      enum: ['free', 'paid'],
      default: 'free',
      index: true,
    },
    // Strictly limited to PDF or HTML format
    fileType: {
      type: String,
      enum: ['pdf', 'html'],
      required: true,
    },
    mimeType: {
      type: String,
      default: 'application/pdf',
    },
    // Raw Base64 string payload stored directly in MongoDB (view-only DRM)
    fileData: {
      type: String,
      required: true,
    },
    // File size in bytes - Maximum 10MB (10,485,760 bytes)
    fileSize: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          return v <= 10 * 1024 * 1024;
        },
        message: 'File size must not exceed 10MB.',
      },
    },
    // Masterclass mapping & Secret Passcode for live attendees
    linkedMasterclassId: {
      type: String,
      default: 'masterclass',
      trim: true,
    },
    secretCode: {
      type: String,
      default: '',
      trim: true, // If set, attending enrolled users can enter this code to unlock for free
    },
    // Users who have unlocked this paid note using the secret passcode
    allowedRedeemedUsers: {
      type: [String],
      default: [],
    },
    orderIndex: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    uploadedBy: {
      type: String,
      default: 'admin',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DownloadableNote', downloadableNoteSchema);

