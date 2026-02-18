const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);

const hintResponseSchema = {
  $id: 'hintResponseSchema',
  type: 'object',
  additionalProperties: false,
  required: ['hint1', 'hint2', 'hint3', 'answer', 'confidence'],
  properties: {
    hint1: { type: 'string', minLength: 1, maxLength: 600 },
    hint2: { type: 'string', minLength: 1, maxLength: 600 },
    hint3: { type: 'string', minLength: 1, maxLength: 600 },
    answer: { type: 'string', minLength: 1, maxLength: 1000 },
    confidence: { type: 'number', minimum: 0, maximum: 1 }
  }
};

ajv.addSchema(hintResponseSchema, 'hintResponse');

function validateModelResponse(obj) {
  const validate = ajv.getSchema('hintResponse');
  const valid = validate(obj);

  return {
    valid: Boolean(valid),
    errors: valid ? null : (validate.errors || null)
  };
}

module.exports = {
  ajv,
  hintResponseSchema,
  validateModelResponse
};
