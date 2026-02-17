const express = require('express');

const healthRoutes = require('./health.routes');
const hintRoutes = require('./hint.routes');
const quizRoutes = require('./quiz.routes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/hints', hintRoutes);
router.use('/quiz', quizRoutes);

module.exports = router;
