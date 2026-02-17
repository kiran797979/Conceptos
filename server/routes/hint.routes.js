const express = require('express');
const { generateHint } = require('../controllers/hint.controller');
const { validateBody } = require('../middlewares/validateBody');
const { hintRequestSchema } = require('../schemas/hint.schema');

const router = express.Router();

router.post('/', validateBody(hintRequestSchema), generateHint);

module.exports = router;
