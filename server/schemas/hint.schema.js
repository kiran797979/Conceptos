const hintRequestSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['topic'],
  properties: {
    topic: { type: 'string', minLength: 2, maxLength: 800 },
    diagnosticQuestion: { type: 'string', minLength: 0, maxLength: 800 },
    language: { type: 'string', minLength: 2, maxLength: 20 },
    stage: { anyOf: [{ type: 'string', maxLength: 20 }, { type: 'integer', minimum: 1, maximum: 10 }] }
  }
};

module.exports = {
  hintRequestSchema
};
