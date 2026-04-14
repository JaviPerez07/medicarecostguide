import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const htmlFiles = [];

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      htmlFiles.push(full);
    }
  }
}

function collectMatches(text, regex) {
  return Array.from(text.matchAll(regex), (match) => match[0]);
}

function isExternal(href) {
  return /^(https?:|mailto:|tel:|javascript:|#)/i.test(href);
}

function resolveTarget(file, ref) {
  const clean = ref.split('#')[0].split('?')[0];
  if (!clean) return null;
  return path.resolve(path.dirname(file), clean);
}

walk(root);
htmlFiles.sort();

const issues = [];
const summary = {
  htmlFiles: htmlFiles.length,
  internalLinksChecked: 0,
  assetRefsChecked: 0,
  forbiddenAbsoluteMatches: 0,
};

for (const file of htmlFiles) {
  const rel = path.relative(root, file) || path.basename(file);
  const text = readFileSync(file, 'utf8');
  const isPagesFile = rel.startsWith('pages' + path.sep);

  const forbidden = [
    ...collectMatches(text, /href="\//g),
    ...collectMatches(text, /src="\//g),
    ...collectMatches(text, /href="\/pages\//g),
  ];
  if (forbidden.length) {
    summary.forbiddenAbsoluteMatches += forbidden.length;
    issues.push(`${rel}: forbidden absolute route(s): ${forbidden.join(', ')}`);
  }

  const expectedAssets = isPagesFile
    ? [
        'href="../styles.css"',
        'src="../main.js"',
        'href="../favicon.svg"',
        'href="../index.html"',
      ]
    : [
        'href="./styles.css"',
        'src="./main.js"',
        'href="./favicon.svg"',
        'href="./index.html"',
      ];

  for (const expected of expectedAssets) {
    if (text.includes(expected)) summary.assetRefsChecked += 1;
  }

  if (isPagesFile) {
    for (const required of ['href="../styles.css"', 'src="../main.js"', 'href="../favicon.svg"']) {
      if (!text.includes(required)) issues.push(`${rel}: missing ${required}`);
    }
  } else {
    for (const required of ['href="./styles.css"', 'src="./main.js"', 'href="./favicon.svg"']) {
      if (!text.includes(required)) issues.push(`${rel}: missing ${required}`);
    }
  }

  const refs = Array.from(text.matchAll(/(?:href|src)="([^"]+)"/g), (match) => match[1]);
  for (const ref of refs) {
    if (isExternal(ref)) continue;
    const target = resolveTarget(file, ref);
    if (!target) continue;
    summary.internalLinksChecked += 1;
    if (!existsSync(target)) {
      issues.push(`${rel}: missing target for ${ref}`);
      continue;
    }
    const stats = statSync(target);
    if (ref.endsWith('.html') && !stats.isFile()) issues.push(`${rel}: expected file for ${ref}`);
  }
}

const mainJs = readFileSync(path.join(root, 'main.js'), 'utf8');
if (/fetch\(/.test(mainJs)) issues.push('main.js: contains fetch()');
if (/XMLHttpRequest/.test(mainJs)) issues.push('main.js: contains XMLHttpRequest');
if (/\b(fetch|XMLHttpRequest)\s*\(\s*['"]\//.test(mainJs)) issues.push('main.js: absolute request path found');

console.log(`HTML files checked: ${summary.htmlFiles}`);
console.log(`Internal href/src refs checked: ${summary.internalLinksChecked}`);
console.log(`Expected asset refs confirmed: ${summary.assetRefsChecked}`);
console.log(`Forbidden absolute matches: ${summary.forbiddenAbsoluteMatches}`);

if (issues.length) {
  console.log('\nIssues:');
  for (const issue of issues) console.log(`- ${issue}`);
  process.exit(1);
}

console.log('\nAll local link checks passed.');
