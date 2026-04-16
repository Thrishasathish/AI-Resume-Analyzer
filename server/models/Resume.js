const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'docx'], required: true },
    rawText: { type: String, required: true },
    fileSize: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
