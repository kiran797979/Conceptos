const MAX_INPUT_LENGTH = 800;

/**
 * Sanitize untrusted text before sending to the model.
 * - strips control chars/newlines
 * - clips to max length
 * - escapes angle brackets/braces to reduce prompt injection payloads
 */
function sanitizeForModel(text) {
  if (text === undefined || text === null) return '';

  let value = String(text)
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (value.length > MAX_INPUT_LENGTH) {
    value = value.slice(0, MAX_INPUT_LENGTH);
  }

  return value
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\{\{/g, '{ {')
    .replace(/\}\}/g, '} }');
}

/**
 * Safely parse JSON out of model output that may include extra text.
 */
function safeParseJsonString(str) {
  if (str === undefined || str === null) {
    return { ok: false, error: 'empty_response' };
  }

  const raw = String(str).trim();
  if (!raw) return { ok: false, error: 'empty_response' };

  try {
    return { ok: true, json: JSON.parse(raw) };
  } catch (_err) {
    // fall through to best-effort extraction
  }

  const firstBrace = raw.indexOf('{');
  const firstBracket = raw.indexOf('[');
  let start = -1;

  if (firstBrace === -1) start = firstBracket;
  else if (firstBracket === -1) start = firstBrace;
  else start = Math.min(firstBrace, firstBracket);

  if (start === -1) {
    return { ok: false, error: 'no_json_detected' };
  }

  const openChar = raw[start];
  const closeChar = openChar === '{' ? '}' : ']';

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < raw.length; i += 1) {
    const ch = raw[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === openChar) depth += 1;
    if (ch === closeChar) {
      depth -= 1;
      if (depth === 0) {
        const candidate = raw.slice(start, i + 1).trim();
        try {
          return { ok: true, json: JSON.parse(candidate) };
        } catch (_err) {
          return { ok: false, error: 'invalid_json' };
        }
      }
    }
  }

  return { ok: false, error: 'incomplete_json' };
}

module.exports = {
  sanitizeForModel,
  safeParseJsonString,
  MAX_INPUT_LENGTH
};
