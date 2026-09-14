import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkVisualBaseline } from './check-visual-baseline.mjs';

const withAuditFixture = run => {
 const directory = mkdtempSync(path.join(tmpdir(), 'espaco-visual-audit-'));
 try { writeFileSync(path.join(directory, 'capture.png'), 'fixture'); return run(directory); }
 finally { rmSync(directory, { recursive:true, force:true }); }
};

const baseline = {
 id:'fixture-panel-v1',
 reference:{ origin:'measured', record:'docs/design/espaco-library/PROVENANCE.md#fixture' },
 approval:{ status:'approved', decision:'DS-fixture', approvedAt:'2026-09-13' },
 render:{ viewport:{ width:1280, height:800 }, theme:'dark', state:'idle' },
 metrics:[
  { id:'panel.radius', selector:'.fixture-panel', property:'border-radius', value:'16px' },
  { id:'panel.padding', selector:'.fixture-panel', property:'padding', value:'16px 32px 32px' },
  { id:'tablist.height', selector:'.fixture-tablist', property:'height', value:'36px' },
  { id:'tablist.radius', selector:'.fixture-tablist', property:'border-radius', value:'10px' },
 ],
};

function completeAudit(overrides = {}) {
 return {
  baselineId:'fixture-panel-v1',
  audit:{ status:'complete', reviewer:'independent-reviewer', independent:true },
  evidence:{ capturedAt:'2026-09-13T12:00:00Z', screenshot:'capture.png' },
  render:{ viewport:{ width:1280, height:800 }, theme:'dark', state:'idle' },
  metrics:[
   { id:'panel.radius', selector:'.fixture-panel', property:'border-radius', value:'16px' },
   { id:'panel.padding', selector:'.fixture-panel', property:'padding', value:'16px 32px 32px' },
   { id:'tablist.height', selector:'.fixture-tablist', property:'height', value:'36px' },
   { id:'tablist.radius', selector:'.fixture-tablist', property:'border-radius', value:'10px' },
  ],
  ...overrides,
 };
}

test('accepts a complete independent audit matching the approved visual baseline',()=>withAuditFixture(directory=>{
 const result = checkVisualBaseline({ baseline, audit:completeAudit(), auditDirectory:directory });
 assert.equal(result.checks,4);
 assert.deepEqual(result.issues,[]);
}));

test('rejects contextual radius and gap drift before handoff',()=>withAuditFixture(directory=>{
 const audit = completeAudit();
 audit.metrics[0].value='10px';
 audit.metrics[1].value='24px';
 audit.metrics[2].value='28px';
 const result = checkVisualBaseline({ baseline, audit, auditDirectory:directory });
 assert.equal(result.issues.filter(issue=>issue.code==='METRIC_MISMATCH').length,3,JSON.stringify(result.issues));
}));

test('does not treat a pending or unevidenced review as visual approval',()=>withAuditFixture(directory=>{
 const audit = completeAudit({ audit:{ status:'pending', reviewer:'builder', independent:false }, evidence:{ capturedAt:'2026-09-13T12:00:00Z', screenshot:'missing.png' } });
 const result = checkVisualBaseline({ baseline, audit, auditDirectory:directory });
 const codes = new Set(result.issues.map(issue=>issue.code));
 for (const code of ['AUDIT_PENDING','AUDIT_NOT_INDEPENDENT','AUDIT_SCREENSHOT_MISSING']) assert.ok(codes.has(code),`Expected ${code}; got ${[...codes]}`);
}));

test('visual-baseline CLI validates versioned artifacts without mutating them',()=>withAuditFixture(directory=>{
 const baselinePath = path.join(directory, 'baseline.json');
 const auditPath = path.join(directory, 'audit.json');
 writeFileSync(baselinePath, JSON.stringify(baseline));
 writeFileSync(auditPath, JSON.stringify(completeAudit()));
 const command = fileURLToPath(new URL('./check-visual-baseline.mjs', import.meta.url));
 const result = spawnSync(process.execPath, [command, baselinePath, auditPath], { encoding:'utf8' });
 assert.equal(result.status,0,result.stderr);
 assert.match(result.stdout,/4 metrics, 0 violations/);
}));
