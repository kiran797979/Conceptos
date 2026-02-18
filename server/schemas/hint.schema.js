const hintRequestSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['topic'],
  properties: {
    topic: { type: 'string', minLength: 2, maxLength: 120 },
    language: { type: 'string', minLength: 2, maxLength: 10 },
    level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] }
  }
};

module.exports = {
  hintRequestSchema
};
