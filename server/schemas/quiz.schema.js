const quizRequestSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['topic'],
  properties: {
    topic: { type: 'string', minLength: 2, maxLength: 120 },
    questionCount: { type: 'integer', minimum: 1, maximum: 10 }
  }
};

module.exports = {
  quizRequestSchema
};
