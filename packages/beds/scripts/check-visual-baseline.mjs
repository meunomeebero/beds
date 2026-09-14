#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ORIGINS = new Set(['measured', 'declared', 'adapted']);

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { throw new Error(`Cannot read JSON ${file}: ${error.message}`); }
}

function normalText(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value;
}

function sameValue(expected, actual, tolerance) {
  if (typeof expected === 'number' && typeof actual === 'number') return Math.abs(expected - actual) <= tolerance;
  const dimension = /^(-?(?:\d+\.?\d*|\.\d+))([a-z%]*)$/i;
  const expectedMatch = typeof expected === 'string' && normalText(expected).match(dimension);
  const actualMatch = typeof actual === 'string' && normalText(actual).match(dimension);
  if (expectedMatch && actualMatch && expectedMatch[2] === actualMatch[2]) return Math.abs(Number(expectedMatch[1]) - Number(actualMatch[1])) <= tolerance;
  return normalText(expected) === normalText(actual);
}

/**
 * Validates a reviewer-produced visual audit against an approved, versioned baseline.
 * It is deliberately read-only: this script never writes or updates a baseline.
 */
export function checkVisualBaseline({ baseline, audit, auditDirectory = process.cwd() }) {
  const issues = [];
  const issue = (code, message) => issues.push({ code, message });
  const requiredText = (value, code, label) => {
    if (typeof value !== 'string' || !value.trim()) { issue(code, `${label} is required.`); return false; }
    return true;
  };
  if (!baseline || typeof baseline !== 'object') { issue('INVALID_BASELINE', 'Baseline must be an object.'); return { checks: 0, issues }; }
  if (!audit || typeof audit !== 'object') { issue('INVALID_AUDIT', 'Audit must be an object.'); return { checks: 0, issues }; }

  requiredText(baseline.id, 'BASELINE_ID', 'Baseline id');
  const origin = baseline.reference?.origin;
  if (!ORIGINS.has(origin)) issue('BASELINE_ORIGIN', 'Baseline reference.origin must be measured, declared or adapted.');
  requiredText(baseline.reference?.record, 'BASELINE_REFERENCE', 'Versioned reference record');
  if (origin === 'adapted') requiredText(baseline.reference?.decision, 'ADAPTATION_DECISION', 'Approved adaptation decision');
  if (baseline.approval?.status !== 'approved') issue('BASELINE_UNAPPROVED', 'Baseline must have explicit approved status; this checker never promotes a baseline.');
  requiredText(baseline.approval?.decision, 'BASELINE_DECISION', 'Baseline approval decision');
  requiredText(baseline.approval?.approvedAt, 'BASELINE_APPROVAL_DATE', 'Baseline approval date');

  if (audit.baselineId !== baseline.id) issue('BASELINE_MISMATCH', 'Audit baselineId does not match the supplied baseline.');
  if (audit.audit?.status !== 'complete') issue('AUDIT_PENDING', 'Visual audit status must be complete; pending is not approval.');
  requiredText(audit.audit?.reviewer, 'AUDIT_REVIEWER', 'Independent reviewer');
  if (audit.audit?.independent !== true) issue('AUDIT_NOT_INDEPENDENT', 'Visual audit must be marked independent.');
  requiredText(audit.evidence?.capturedAt, 'AUDIT_CAPTURE_DATE', 'Evidence capture date');
  const screenshot = audit.evidence?.screenshot;
  if (!requiredText(screenshot, 'AUDIT_SCREENSHOT', 'Evidence screenshot')) {
    // Required text already emitted the useful failure.
  } else if (!fs.existsSync(path.resolve(auditDirectory, screenshot))) issue('AUDIT_SCREENSHOT_MISSING', `Evidence screenshot does not exist: ${screenshot}`);

  const baselineRender = baseline.render ?? {};
  const auditRender = audit.render ?? {};
  for (const key of ['theme', 'state']) if (baselineRender[key] !== auditRender[key]) issue('RENDER_CONTEXT_MISMATCH', `Audit ${key} must match the approved baseline.`);
  for (const key of ['width', 'height']) if (baselineRender.viewport?.[key] !== auditRender.viewport?.[key]) issue('VIEWPORT_MISMATCH', `Audit viewport ${key} must match the approved baseline.`);

  if (!Array.isArray(baseline.metrics) || !baseline.metrics.length) issue('BASELINE_METRICS', 'Baseline must contain at least one measured visual metric.');
  const observed = new Map(Array.isArray(audit.metrics) ? audit.metrics.map(metric => [metric.id, metric]) : []);
  let checks = 0;
  for (const expected of baseline.metrics ?? []) {
    if (!expected?.id || !expected?.selector || !expected?.property || expected.value === undefined) {
      issue('INVALID_BASELINE_METRIC', 'Each baseline metric needs id, selector, property and value.');
      continue;
    }
    checks++;
    const actual = observed.get(expected.id);
    if (!actual) { issue('METRIC_MISSING', `Audit did not measure ${expected.id}.`); continue; }
    if (actual.selector !== expected.selector || actual.property !== expected.property) {
      issue('METRIC_IDENTITY_MISMATCH', `Audit metric ${expected.id} changed selector or property.`);
      continue;
    }
    const tolerance = Number.isFinite(expected.tolerance) && expected.tolerance >= 0 ? expected.tolerance : 0;
    if (!sameValue(expected.value, actual.value, tolerance)) issue('METRIC_MISMATCH', `${expected.id}: expected ${expected.value}, received ${actual.value}.`);
  }
  return { checks, issues };
}

if (process.argv[1] && fs.existsSync(process.argv[1]) && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  const [baselinePath, auditPath] = process.argv.slice(2);
  if (!baselinePath || !auditPath || process.argv.slice(2).length !== 2) {
    console.error('Usage: node check-visual-baseline.mjs <approved-baseline.json> <review-audit.json>');
    process.exitCode = 1;
  } else {
    try {
      const absoluteAudit = path.resolve(auditPath);
      const result = checkVisualBaseline({ baseline: readJson(path.resolve(baselinePath)), audit: readJson(absoluteAudit), auditDirectory: path.dirname(absoluteAudit) });
      for (const item of result.issues) console.error(`[${item.code}] ${item.message}`);
      console.log(`Espaço visual baseline: ${result.checks} metrics, ${result.issues.length} violations.`);
      process.exitCode = result.issues.length ? 1 : 0;
    } catch (error) { console.error(error.message); process.exitCode = 1; }
  }
}
