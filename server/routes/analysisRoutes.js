const express = require('express');
const router = express.Router();
const {
  analyze,
  getHistory,
  getAnalysis,
  getRoles,
  rewrite,
  deleteAnalysis,
} = require('../controllers/analysisController');
const { protect } = require('../middleware/authMiddleware');

router.get('/roles', getRoles);
router.post('/', protect, analyze);
router.get('/history', protect, getHistory);
router.get('/:id', protect, getAnalysis);
router.post('/rewrite', protect, rewrite);
router.delete('/:id', protect, deleteAnalysis);

module.exports = router;
