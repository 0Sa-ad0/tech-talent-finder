const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { evaluateSkills, generateInterviewQuestions } = require('../controllers/evaluationController');

router.post('/skills', protect, evaluateSkills);
router.post('/questions', protect, generateInterviewQuestions);

module.exports = router;