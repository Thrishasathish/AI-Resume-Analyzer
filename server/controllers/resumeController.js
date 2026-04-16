const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');
const { parseFile } = require('../services/pdfParser');

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
    const rawText = await parseFile(req.file.path, ext);

    if (!rawText || rawText.trim().length < 50) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Could not extract text from file. Please ensure it is not a scanned image.' });
    }

    const resume = await Resume.create({
      userId: req.user._id,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileType: ext,
      rawText,
      fileSize: req.file.size,
    });

    res.status(201).json({ success: true, resume: { _id: resume._id, originalName: resume.originalName, fileType: resume.fileType, createdAt: resume.createdAt } });
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).select('-rawText').sort({ createdAt: -1 });
    res.json({ success: true, resumes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });

    if (fs.existsSync(resume.filePath)) fs.unlinkSync(resume.filePath);
    await resume.deleteOne();

    res.json({ success: true, message: 'Resume deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
