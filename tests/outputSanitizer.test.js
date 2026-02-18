const test = require('node:test');
const assert = require('node:assert/strict');

const { sanitizeForModel, safeParseJsonString, MAX_INPUT_LENGTH } = require('../server/utils/outputSanitizer');

test('sanitizeForModel strips controls and clips length', () => {
  const raw = `Hello\nWorld\u0000${'a'.repeat(900)}`;
  const clean = sanitizeForModel(raw);

  assert.equal(clean.includes('\n'), false);
  assert.equal(clean.includes('\u0000'), false);
  assert.equal(clean.length <= MAX_INPUT_LENGTH, true);
});

test('safeParseJsonString extracts first valid JSON object', () => {
  const raw = 'prefix text {"hint1":"a","hint2":"b","hint3":"c","answer":"d","confidence":0.9} suffix';
  const parsed = safeParseJsonString(raw);

  assert.equal(parsed.ok, true);
  assert.equal(parsed.json.hint1, 'a');
  assert.equal(parsed.json.confidence, 0.9);
});
