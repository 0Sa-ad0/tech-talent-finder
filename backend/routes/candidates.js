const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const {
  getCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  uploadResume,
  evaluateCandidateProfile,
  contactCandidate
} = require('../controllers/candidateController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.route('/')
  .get(protect, getCandidates)
  .post(protect, createCandidate);

router.route('/:id')
  .get(protect, getCandidateById)
  .put(protect, updateCandidate)
  .delete(protect, deleteCandidate);

router.post('/:id/resume', protect, upload.single('resume'), uploadResume);
router.post('/:id/evaluate', protect, evaluateCandidateProfile);
router.post('/:id/contact', protect, contactCandidate);

module.exports = router;