'use strict';

const Anthropic = require('@anthropic-ai/sdk');

const MODEL = 'claude-opus-5';

let _client;
function client() {
  if (!_client) _client = new Anthropic();
  return _client;
}

/**
 * One-shot text call. Returns the concatenated text of the response.
 * Pass `tools` (e.g. web_search) when the step needs live information.
 */
async function askClaude({ system, prompt, tools, maxTokens = 16000 }) {
  const response = await client().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    tools,
    messages: [{ role: 'user', content: prompt }],
  });
  return response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n');
}

/** Extract the first valid JSON value (object or array) from a text blob. */
function extractJson(text) {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // fall through to bracket scanning below
  }
  const start = trimmed.search(/[[{]/);
  if (start === -1) throw new Error(`No JSON found in model output:\n${text}`);
  const open = trimmed[start];
  const close = open === '{' ? '}' : ']';
  let depth = 0;
  for (let i = start; i < trimmed.length; i++) {
    if (trimmed[i] === open) depth++;
    if (trimmed[i] === close) depth--;
    if (depth === 0) {
      return JSON.parse(trimmed.slice(start, i + 1));
    }
  }
  throw new Error(`Unbalanced JSON in model output:\n${text}`);
}

module.exports = { askClaude, extractJson, MODEL };
