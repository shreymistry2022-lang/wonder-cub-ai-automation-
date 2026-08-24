'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT } = require('./config');

/** Strip YAML frontmatter from an .agents/agents/<name>.md file, return the body as a system prompt. */
function loadAgentPrompt(agentName) {
  const filePath = path.join(ROOT, '.agents', 'agents', `${agentName}.md`);
  const raw = fs.readFileSync(filePath, 'utf8');
  return raw.replace(/^---[\s\S]*?---\n/, '').trim();
}

function loadAgentsMd() {
  return fs.readFileSync(path.join(ROOT, 'AGENTS.md'), 'utf8');
}

module.exports = { loadAgentPrompt, loadAgentsMd };
