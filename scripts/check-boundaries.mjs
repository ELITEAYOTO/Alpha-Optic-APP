#!/usr/bin/env node
// Zero-dependency baseline static architecture guard; no claim of complete TS resolution.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';

const root = new URL('../', import.meta.url);
const repo = decodeURIComponent(root.pathname);
const files = [];
function walk(dir) {
  if (!existsSync(dir)) return;
  for (const n of readdirSync(dir)) {
    if (['node_modules','.git','dist','target','coverage'].includes(n)) continue;
    const full = join(dir,n); if (statSync(full).isDirectory()) walk(full);
    else if (/\.(tsx?|jsx?)$/.test(extname(full)) && !full.endsWith('.d.ts')) files.push(full);
  }
}
walk(join(repo,'src'));
const errors = [];
function zone(path) {
  const p=path.split('/'); if(p[0]!=='src')return null;
  if(p[1]==='features')return {zone:'features',owner:p[2]};
  return {zone:p[1]||''};
}
for(const file of files) {
 const path=relative(repo,file).split(sep).join('/');
 const from=zone(path);
 const content=readFileSync(file,'utf8');
 // Catch normal import/export + dynamic import literals; resolver-aware checks come later.
 const imports = [...content.matchAll(/(?:\b(?:import|export)\s+(?:[^;'"]*?\s+from\s+)?|\bimport\s*\()\s*['"]([^'"]+)['"]/g)].map(m=>m[1]);
 for(const spec of imports) {
  if(!spec.startsWith('.')&&!spec.startsWith('@/'))continue;
  let dest;
  if(spec.startsWith('@/')) dest='src/'+spec.slice(2);
  else dest=join(file,'..',spec).replaceAll('\\','/');
  const resolved=spec.startsWith('@/')?dest:relative(repo,dest).split(sep).join('/');
  const to=zone(resolved);
  if(!to)continue;
  if(from.zone==='features') {
    if(to.zone==='app')errors.push(path+': feature -> app: '+spec);
    if(to.zone==='features'&&to.owner!==from.owner)errors.push(path+': cross-feature import: '+spec);
  }
  if(from.zone==='shared'&&['features','app','contracts'].includes(to.zone))errors.push(path+': shared -> '+to.zone+': '+spec);
  if(from.zone==='contracts'&&['app','features','shared'].includes(to.zone))errors.push(path+': contracts -> '+to.zone+': '+spec);
 }
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}
else console.log('Optic architecture baseline check OK ('+files.length+' source files scanned)');
