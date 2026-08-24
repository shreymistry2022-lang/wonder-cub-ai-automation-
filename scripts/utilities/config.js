'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.resolve(__dirname, '..', '..');

function loadYaml(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  const raw = fs.readFileSync(fullPath, 'utf8');
  return yaml.load(raw);
}

function loadProducts() {
  return loadYaml('config/products.yaml').products;
}

function loadScoring() {
  return loadYaml('config/scoring.yaml');
}

function loadContentPillars() {
  return loadYaml('config/content-pillars.yaml');
}

function loadAutomationFlags() {
  return loadYaml('config/automation.yaml');
}

module.exports = { ROOT, loadYaml, loadProducts, loadScoring, loadContentPillars, loadAutomationFlags };
