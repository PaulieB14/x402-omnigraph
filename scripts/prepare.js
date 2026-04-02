#!/usr/bin/env node

/**
 * Renders mustache templates with chain-specific config.
 *
 * Usage:
 *   node scripts/prepare.js base
 *   node scripts/prepare.js mainnet
 *   node scripts/prepare.js polygon
 *   node scripts/prepare.js arbitrum
 *   node scripts/prepare.js optimism
 *
 * Generates:
 *   subgraph.yaml      ← from subgraph.template.yaml
 *   src/helpers.ts      ← from src/helpers.template.ts
 */

const fs = require('fs');
const path = require('path');
const Mustache = require('mustache');

const network = process.argv[2];
if (!network) {
  console.error('Usage: node scripts/prepare.js <network>');
  console.error('  Networks: base, mainnet, polygon, arbitrum, optimism');
  process.exit(1);
}

const configPath = path.join(__dirname, '..', 'config', `${network}.json`);
if (!fs.existsSync(configPath)) {
  console.error(`Config not found: ${configPath}`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Render subgraph.yaml
const subgraphTemplate = fs.readFileSync(
  path.join(__dirname, '..', 'subgraph.template.yaml'),
  'utf8'
);
const subgraphOutput = Mustache.render(subgraphTemplate, config);
fs.writeFileSync(path.join(__dirname, '..', 'subgraph.yaml'), subgraphOutput);
console.log(`✓ subgraph.yaml → ${config.network}`);

// Render src/helpers.ts
const helpersTemplate = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'helpers.template.ts'),
  'utf8'
);
const helpersOutput = Mustache.render(helpersTemplate, config);
fs.writeFileSync(path.join(__dirname, '..', 'src', 'helpers.ts'), helpersOutput);
console.log(`✓ src/helpers.ts → chainId=${config.chainId} (${config.caip2})`);

console.log(`\nReady. Run: npm run codegen && npm run build`);
