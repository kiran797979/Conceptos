const axios = require('axios');

const { sanitizeForModel, safeParseJsonString } = require('../utils/outputSanitizer');
const { validateModelResponse } = require('../utils/outputValidator');

const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_TIMEOUT_MS = 8000;
const RETRY_ATTEMPTS = 3;
const BACKOFF_BASE_MS = 500;
const BACKOFF_FACTOR = 2;
const CIRCUIT_THRESHOLD = 3;
const CIRCUIT_COOLDOWN_MS = 30000;

const breakerState = {
  primaryFailures: 0,
  primaryTrippedAt: null
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sanitizeInput(payload = {}) {
  return {
    topic: sanitizeForModel(payload.topic),
    diagnosticQuestion: sanitizeForModel(payload.diagnosticQuestion),
    language: sanitizeForModel(payload.language || 'en'),
    stage: sanitizeForModel(payload.stage || '1')
  };
}

function safeParseJSON(text) {
  return safeParseJsonString(text);
}

function getEnvConfig() {
  return {
    apiKey: process.env.OPENROUTER_API_KEY,
    baseUrl: process.env.OPENROUTER_BASE_URL || DEFAULT_BASE_URL,
    primaryModel: process.env.PRIMARY_MODEL || 'qwen/qwen3-next-80b-a3b-instruct:free',
    fallbackModel: process.env.FALLBACK_MODEL || 'openai/gpt-oss-120b:free',
    timeoutMs: Number(process.env.MODEL_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS
  };
}

function isPrimaryCircuitOpen() {
  if (!breakerState.primaryTrippedAt) return false;

  const elapsed = Date.now() - breakerState.primaryTrippedAt;
  if (elapsed >= CIRCUIT_COOLDOWN_MS) {
    // Auto-reset after cooldown to allow probing primary again.
    breakerState.primaryFailures = 0;
    breakerState.primaryTrippedAt = null;
    return false;
  }

  return true;
}

function tripPrimaryCircuit() {
  breakerState.primaryTrippedAt = Date.now();
}

function resetPrimaryCircuit() {
  breakerState.primaryFailures = 0;
  breakerState.primaryTrippedAt = null;
}

function recordPrimaryFailure() {
  breakerState.primaryFailures += 1;
  if (breakerState.primaryFailures >= CIRCUIT_THRESHOLD) {
    tripPrimaryCircuit();
  }
}

function buildMessages({ topic, diagnosticQuestion, language, stage }) {
  const system = 'You are an AI tutor. Return ONLY valid JSON. No explanation outside JSON.';
  const user = [
    `Generate 3 progressive hints and final answer for topic "${topic}".`,
    diagnosticQuestion ? `Diagnostic question context: "${diagnosticQuestion}".` : '',
    `Language: "${language}".`,
    `Stage: "${stage}".`,
    'Return JSON exactly in this format:',
    '{',
    '  "hint1": "...",',
    '  "hint2": "...",',
    '  "hint3": "...",',
    '  "answer": "...",',
    '  "confidence": 0.0',
    '}',
    'If you cannot generate, return:',
    '{"error":"cannot_generate"}'
  ].filter(Boolean).join('\n');

  return [
    { role: 'system', content: system },
    { role: 'user', content: user }
  ];
}

function extractContent(providerResponse) {
  return providerResponse
    && providerResponse.data
    && providerResponse.data.choices
    && providerResponse.data.choices[0]
    && providerResponse.data.choices[0].message
    && providerResponse.data.choices[0].message.content;
}

async function callModel({ model, messages, baseUrl, apiKey, timeoutMs }) {
  const endpoint = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

  const response = await axios.post(
    endpoint,
    {
      model,
      messages,
      temperature: 0.2,
      max_tokens: 600,
      stream: false
    },
    {
      timeout: timeoutMs,
      validateStatus: (status) => status >= 200 && status < 300,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return extractContent(response);
}

async function callModelWithRetry(params) {
  for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt += 1) {
    try {
      return await callModel(params);
    } catch (err) {
      const isLast = attempt === RETRY_ATTEMPTS - 1;
      if (isLast) throw err;
      const waitMs = BACKOFF_BASE_MS * (BACKOFF_FACTOR ** attempt);
      await sleep(waitMs);
    }
  }

  throw new Error('retry_exhausted');
}

async function attemptModel({ model, isPrimary, messages, config }) {
  try {
    const content = await callModelWithRetry({
      model,
      messages,
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      timeoutMs: config.timeoutMs
    });

    const parsed = safeParseJSON(content);
    if (!parsed.ok || !parsed.json || parsed.json.error) {
      throw new Error('invalid_model_json');
    }

    const validation = validateModelResponse(parsed.json);
    if (!validation.valid) {
      throw new Error('schema_validation_failed');
    }

    if (isPrimary) resetPrimaryCircuit();
    return parsed.json;
  } catch (_err) {
    console.error(`[modelAdapter] model failed: ${model}`);
    if (isPrimary) recordPrimaryFailure();
    return null;
  }
}

async function generateHints(input) {
  try {
    const config = getEnvConfig();

    if (!config.apiKey) {
      console.error('[modelAdapter] missing OPENROUTER_API_KEY');
      return { success: false, error: 'service_degraded' };
    }

    const sanitized = sanitizeInput(input);
    const messages = buildMessages(sanitized);

    if (!isPrimaryCircuitOpen()) {
      const primaryResult = await attemptModel({
        model: config.primaryModel,
        isPrimary: true,
        messages,
        config
      });

      if (primaryResult) return primaryResult;
    }

    if (config.fallbackModel && config.fallbackModel !== config.primaryModel) {
      const fallbackResult = await attemptModel({
        model: config.fallbackModel,
        isPrimary: false,
        messages,
        config
      });

      if (fallbackResult) return fallbackResult;
    }

    return { success: false, error: 'service_degraded' };
  } catch (_err) {
    console.error('[modelAdapter] generateHints failed');
    return { success: false, error: 'service_degraded' };
  }
}

module.exports = {
  generateHints,
  sanitizeInput,
  callModel,
  safeParseJSON,
  __breakerState: breakerState
};
