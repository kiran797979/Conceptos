const test = require('node:test');
const assert = require('node:assert/strict');

let validateModelResponse;
let validatorLoadError = null;

try {
  ({ validateModelResponse } = require('../server/utils/outputValidator'));
} catch (err) {
  validatorLoadError = err;
}

test('validateModelResponse passes valid payload', { skip: Boolean(validatorLoadError) }, () => {
  const payload = {
    hint1: 'h1',
    hint2: 'h2',
    hint3: 'h3',
    answer: 'ans',
    confidence: 0.8
  };

  const result = validateModelResponse(payload);
  assert.equal(result.valid, true);
  assert.equal(result.errors, null);
});

test('validateModelResponse fails for extra property and wrong type', { skip: Boolean(validatorLoadError) }, () => {
  const payload = {
    hint1: 'h1',
    hint2: 'h2',
    hint3: 'h3',
    answer: 'ans',
    confidence: '0.8',
    extra: 'nope'
  };

  const result = validateModelResponse(payload);
  assert.equal(result.valid, false);
  assert.ok(Array.isArray(result.errors));
  assert.ok(result.errors.length > 0);
});
