const express = require('express');
const router = express.Router();
const { uploadResume, getResumes, deleteResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.get('/list', protect, getResumes);
router.delete('/:id', protect, deleteResume);

module.exports = router;
