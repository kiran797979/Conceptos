const express = require('express');
const { generateQuiz } = require('../controllers/quiz.controller');
const { validateBody } = require('../middlewares/validateBody');
const { quizRequestSchema } = require('../schemas/quiz.schema');

const router = express.Router();

router.post('/', validateBody(quizRequestSchema), generateQuiz);

module.exports = router;
