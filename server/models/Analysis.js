const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
    targetRole: { type: String, required: true },
    jobDescription: { type: String, default: '' },

    // Dual scoring system
    atsScore: { type: Number, min: 0, max: 100, required: true },
    roleFitScore: { type: Number, min: 0, max: 100, required: true },

    // Breakdown of ATS score components
    breakdown: {
      keywordMatch: { type: Number, default: 0 },
      sectionScore: { type: Number, default: 0 },
      formatScore: { type: Number, default: 0 },
      readability: { type: Number, default: 0 },
    },

    // Per-section scores
    sectionScores: {
      summary: { type: Number, default: 0 },
      skills: { type: Number, default: 0 },
      experience: { type: Number, default: 0 },
      education: { type: Number, default: 0 },
    },

    // Keyword analysis
    foundKeywords: [String],
    missingKeywords: [String],
    allRoleKeywords: [String],

    // AI suggestions
    suggestions: [
      {
        type: { type: String, enum: ['critical', 'warning', 'good'], default: 'warning' },
        section: { type: String },
        message: { type: String },
      },
    ],

    // Version tracking for improvement chart
    version: { type: Number, default: 1 },
    resumeFileName: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analysis', analysisSchema);
