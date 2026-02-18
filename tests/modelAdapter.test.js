const test = require('node:test');
const assert = require('node:assert/strict');

let modelAdapter;
let adapterLoadError = null;

try {
  modelAdapter = require('../server/services/modelAdapter');
} catch (err) {
  adapterLoadError = err;
}

test('generateHints degrades when OPENROUTER_API_KEY is missing', { skip: Boolean(adapterLoadError) }, async () => {
  const prevKey = process.env.OPENROUTER_API_KEY;
  delete process.env.OPENROUTER_API_KEY;

  const result = await modelAdapter.generateHints({
    topic: 'fractions',
    diagnosticQuestion: 'What is 1/2 + 1/4?',
    language: 'en',
    stage: '1'
  });

  if (prevKey !== undefined) {
    process.env.OPENROUTER_API_KEY = prevKey;
  }

  assert.deepEqual(result, { success: false, error: 'service_degraded' });
});
