/**
 * TECHNOVA 2027 - Automated Motion & Quality Auditor
 * Plain Node.js script with ZERO external dependencies.
 * Validates:
 * 1. Animate ONLY transform and opacity (no width/height/top/left/margin/padding/box-shadow).
 * 2. All @keyframes defined ONLY in css/motion.css.
 * 3. Zero inline style animation attributes.
 * 4. Zero ES modules (type="module", import/export).
 * 5. Zero fetch() calls (100% offline file:// double-click compliant).
 * 6. Motion bundle size under 15KB.
 *
 * Run with: node tools/audit.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const FORBIDDEN_PROPS = ['width', 'height', 'top', 'left', 'right', 'bottom', 'margin', 'padding', 'box-shadow'];

let totalChecks = 0;
let passedChecks = 0;
let failures = [];

function assert(condition, testName, detail = '') {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`\x1b[32m[PASS]\x1b[0m ${testName}`);
  } else {
    failures.push({ testName, detail });
    console.error(`\x1b[31m[FAIL]\x1b[0m ${testName}: ${detail}`);
  }
}

function getAllFiles(dir, exts) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== '.git' && file !== 'node_modules') {
        results = results.concat(getAllFiles(fullPath, exts));
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (exts.includes(ext)) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

console.log('\x1b[36m=== TECHNOVA Motion & Quality Audit ===\x1b[0m\n');

// 1. Audit CSS files
const cssFiles = getAllFiles(path.join(ROOT_DIR, 'css'), ['.css']);
assert(cssFiles.length >= 2, 'CSS file discovery', `Found ${cssFiles.length} CSS files`);

cssFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(ROOT_DIR, file).replace(/\\/g, '/');

  // Check @keyframes location: ONLY allowed in css/motion.css
  const keyframesMatches = content.match(/@keyframes\s+([a-zA-Z0-9_-]+)/g) || [];
  if (relPath !== 'css/motion.css') {
    assert(
      keyframesMatches.length === 0,
      `No @keyframes outside motion.css in ${relPath}`,
      `Found @keyframes definitions: ${keyframesMatches.join(', ')}`
    );
  } else {
    assert(
      keyframesMatches.length > 0,
      `Centralized @keyframes catalog in css/motion.css`,
      `Found ${keyframesMatches.length} keyframes`
    );

    // Verify keyframes do not animate forbidden properties
    const keyframeBlocks = content.split('@keyframes').slice(1);
    keyframeBlocks.forEach(block => {
      const name = block.split('{')[0].trim();
      const body = block.substring(block.indexOf('{'), block.indexOf('}') + 1);
      FORBIDDEN_PROPS.forEach(prop => {
        const propRegex = new RegExp(`(^|\\s|;)${prop}\\s*:`, 'i');
        assert(
          !propRegex.test(body),
          `Keyframe '${name}' does not animate forbidden property '${prop}'`,
          `Forbidden property '${prop}' animated in @keyframes ${name}`
        );
      });
    });
  }

  // Check transition lists for forbidden properties
  const transitionMatches = content.match(/transition\s*:\s*([^;]+);/g) || [];
  transitionMatches.forEach(tLine => {
    FORBIDDEN_PROPS.forEach(prop => {
      // Look for prop name as an animated property in transition list
      const propRegex = new RegExp(`(^|[,\\s])${prop}(\\s+|$|,)`, 'i');
      assert(
        !propRegex.test(tLine),
        `Transition does not animate forbidden '${prop}' in ${relPath}`,
        `Line: ${tLine.trim()}`
      );
    });
  });
});

// 2. Audit HTML files
const htmlFiles = getAllFiles(ROOT_DIR, ['.html']);
assert(htmlFiles.length >= 4, 'HTML file discovery', `Found ${htmlFiles.length} HTML files`);

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(ROOT_DIR, file).replace(/\\/g, '/');

  // No type="module"
  assert(
    !content.includes('type="module"'),
    `No ES module script tags in ${relPath}`,
    `Found type="module"`
  );

  // No fetch(
  assert(
    !/fetch\s*\(/.test(content),
    `No fetch() calls in ${relPath}`,
    `Found fetch() call`
  );

  // No inline animation style attributes
  const inlineAnimStyle = content.match(/style="[^"]*(animation|transition)[^"]*"/gi) || [];
  assert(
    inlineAnimStyle.length === 0,
    `No inline animation styles in ${relPath}`,
    `Found: ${inlineAnimStyle.join(', ')}`
  );

  // Has motion-boot.js in <head>
  assert(
    content.includes('js/motion-boot.js'),
    `Includes motion-boot.js in ${relPath}`,
    `Missing motion-boot.js`
  );

  // Has css/motion.css
  assert(
    content.includes('css/motion.css'),
    `Includes motion.css in ${relPath}`,
    `Missing css/motion.css`
  );

  // Has js/motion.js
  assert(
    content.includes('js/motion.js'),
    `Includes motion.js in ${relPath}`,
    `Missing js/motion.js`
  );
});

// 3. Audit JS files
const jsFiles = getAllFiles(path.join(ROOT_DIR, 'js'), ['.js']);
assert(jsFiles.length >= 5, 'JS file discovery', `Found ${jsFiles.length} JS files`);

jsFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(ROOT_DIR, file).replace(/\\/g, '/');

  // No fetch(
  assert(
    !/fetch\s*\(/.test(content),
    `No fetch() calls in ${relPath}`,
    `Found fetch() call`
  );

  // No ES module export / import statements at top level
  assert(
    !/^\s*(export\s+default|export\s+\{|import\s+.*from)/m.test(content),
    `No ES module syntax (import/export) in ${relPath}`,
    `Found ES module export/import`
  );
});

// 4. Bundle size budget: motion.js + motion-boot.js under 15KB total
const motionJsSize = fs.statSync(path.join(ROOT_DIR, 'js', 'motion.js')).size;
const motionBootSize = fs.statSync(path.join(ROOT_DIR, 'js', 'motion-boot.js')).size;
const totalMotionBytes = motionJsSize + motionBootSize;
const totalMotionKb = (totalMotionBytes / 1024).toFixed(2);

assert(
  totalMotionBytes < 15 * 1024,
  `Motion JS size budget (< 15KB): ${totalMotionKb} KB total`,
  `Exceeded budget: ${totalMotionKb} KB`
);

// Summary Report
console.log(`\n\x1b[36m========================================\x1b[0m`);
console.log(`\x1b[1mAudit Complete:\x1b[0m ${passedChecks} / ${totalChecks} checks passed.`);

if (failures.length > 0) {
  console.log(`\x1b[31m${failures.length} Failures Detected:\x1b[0m`);
  failures.forEach((f, i) => {
    console.error(`  ${i + 1}. ${f.testName}: ${f.detail}`);
  });
  console.log(`\x1b[36m========================================\x1b[0m\n`);
  process.exit(1);
} else {
  console.log(`\x1b[32mAll motion architecture, offline integrity, and constraint checks PASSED!\x1b[0m`);
  console.log(`\x1b[36m========================================\x1b[0m\n`);
  process.exit(0);
}
