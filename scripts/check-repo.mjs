#!/usr/bin/env node
// Foundation verification. Intentionally runs without installing app dependencies.
import {existsSync,readFileSync} from 'node:fs';
const expected=['AGENTS.md','docs/architecture/OVERVIEW.md','docs/architecture/MODULE_BOUNDARIES.md','docs/architecture/CONTRACTS.md','docs/security/SECURITY_MODEL.md','docs/design/UI_D.md','docs/engineering/HANDOFF.md','docs/engineering/WORKFLOW.md','scripts/check-boundaries.mjs'];
const missing=expected.filter(x=>!existsSync(x));
if(missing.length){console.error('Missing files: '+missing.join(', '));process.exit(1)}
const info=readFileSync('AGENTS.md','utf8');
if(!info.includes('Bridge Rust')){console.error('Security ownership reference missing');process.exit(1)}
console.log('Optic foundation files: OK');
