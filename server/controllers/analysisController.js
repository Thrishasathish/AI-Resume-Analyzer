const Resume = require('../models/Resume');
const Analysis = require('../models/Analysis');
const { calculateScores, getAllRoles } = require('../services/scoringService');
const { generateSuggestions, rewriteSection } = require('../services/aiService');

/**
 * Run full analysis on a resume
 */
exports.analyze = async (req, res) => {
  try {
    const { resumeId, targetRole, jobDescription } = req.body;

    if (!resumeId || !targetRole)
      return res.status(400).json({ success: false, message: 'resumeId and targetRole are required' });

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });

    // Calculate ATS + Role Fit scores
    const scores = calculateScores(resume.rawText, targetRole, jobDescription || '');

    // Generate AI suggestions
    const suggestions = await generateSuggestions(
      resume.rawText,
      targetRole,
      scores.missingKeywords,
      scores.sectionScores,
      jobDescription || ''
    );

    // Count previous analyses for version number
    const prevCount = await Analysis.countDocuments({ userId: req.user._id, resumeId });

    const analysis = await Analysis.create({
      userId: req.user._id,
      resumeId,
      targetRole,
      jobDescription: jobDescription || '',
      atsScore: scores.atsScore,
      roleFitScore: scores.roleFitScore,
      breakdown: scores.breakdown,
      sectionScores: scores.sectionScores,
      foundKeywords: scores.foundKeywords,
      missingKeywords: scores.missingKeywords,
      allRoleKeywords: scores.allRoleKeywords,
      suggestions,
      version: prevCount + 1,
      resumeFileName: resume.originalName,
    });

    res.status(201).json({ success: true, analysis });
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get all analyses for current user
 */
exports.getHistory = async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user._id })
      .select('-allRoleKeywords -foundKeywords')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, analyses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get single analysis by ID
 */
exports.getAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user._id });
    if (!analysis) return res.status(404).json({ success: false, message: 'Analysis not found' });
    res.json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get all supported roles
 */
exports.getRoles = async (req, res) => {
  try {
    const roles = getAllRoles();
    res.json({ success: true, roles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * AI section rewriter
 */
exports.rewrite = async (req, res) => {
  try {
    const { sectionText, sectionName, targetRole } = req.body;
    if (!sectionText || !sectionName || !targetRole)
      return res.status(400).json({ success: false, message: 'sectionText, sectionName, and targetRole are required' });

    const rewritten = await rewriteSection(sectionText, sectionName, targetRole);
    res.json({ success: true, rewritten });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Delete analysis
 */
exports.deleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user._id });
    if (!analysis) return res.status(404).json({ success: false, message: 'Not found' });
    await analysis.deleteOne();
    res.json({ success: true, message: 'Analysis deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
