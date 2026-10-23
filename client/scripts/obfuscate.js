/**
 * Production JavaScript Obfuscator Script for Strivers Web Application
 * Obfuscates React build bundles before deployment to Firebase Hosting.
 * Removes source maps to prevent leaking original JSX/source code.
 */

const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const BUILD_DIR = path.resolve(__dirname, '..', 'build');
const JS_DIR = path.join(BUILD_DIR, 'static', 'js');
const CSS_DIR = path.join(BUILD_DIR, 'static', 'css');

// Obfuscator options optimized for React 19, Firebase SDK, and third-party integrations (Razorpay)
const OBFUSCATION_OPTIONS = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.4,
  numbersToExpressions: true,
  simplify: true,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.75,
  splitStrings: true,
  splitStringsChunkLength: 8,
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: false, // Must remain false to keep window, document, Firebase, and payment SDKs working
  selfDefending: false, // Disabled to prevent conflicts with minification and browser DOM wrappers
  sourceMap: false,
};

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function removeSourceMaps(directory) {
  if (!fs.existsSync(directory)) return 0;

  let count = 0;
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      count += removeSourceMaps(fullPath);
    } else if (file.endsWith('.map')) {
      try {
        fs.unlinkSync(fullPath);
        count++;
      } catch (err) {
        console.warn(`[Warn] Could not delete source map ${file}:`, err.message);
      }
    }
  }

  return count;
}

function removeSourceMapComments(code) {
  // Strip out any sourceMappingURL references so DevTools doesn't look for deleted .map files
  return code.replace(/\/\/#\s*sourceMappingURL=.*$/gm, '').replace(/\/\*#\s*sourceMappingURL=.*?\*\//gm, '');
}

async function runObfuscation() {
  console.log('\n🔒 ==========================================');
  console.log('   STRIVERS PRODUCTION JS OBFUSCATION');
  console.log('==========================================\n');

  if (!fs.existsSync(BUILD_DIR)) {
    console.error('❌ Error: "build" directory not found!');
    console.error('   Please run "npm run build" first before obfuscating.\n');
    process.exit(1);
  }

  if (!fs.existsSync(JS_DIR)) {
    console.error(`❌ Error: JS directory not found at "${JS_DIR}"`);
    process.exit(1);
  }

  // Step 1: Remove source maps so production assets never expose original uncompiled code
  console.log('📦 Step 1: Purging source maps (.map files) from production build...');
  const deletedMaps = removeSourceMaps(BUILD_DIR);
  console.log(`   ✓ Removed ${deletedMaps} source map file(s) for security.`);

  // Step 2: Discover and obfuscate all JS bundle files
  console.log('\n🛡️  Step 2: Obfuscating JavaScript bundles in build/static/js...');
  const allFiles = fs.readdirSync(JS_DIR);
  const jsFiles = allFiles.filter(
    (file) => file.endsWith('.js') && !file.endsWith('.LICENSE.txt')
  );

  if (jsFiles.length === 0) {
    console.log('   No .js bundle files found to obfuscate.');
    return;
  }

  let totalOriginal = 0;
  let totalObfuscated = 0;

  for (const file of jsFiles) {
    const filePath = path.join(JS_DIR, file);
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const originalSize = Buffer.byteLength(originalContent, 'utf8');
    totalOriginal += originalSize;

    console.log(`\n   📄 Processing: ${file} (${formatSize(originalSize)})`);

    // Clean source map comment from code
    const cleanedCode = removeSourceMapComments(originalContent);

    try {
      const startTime = Date.now();
      const obfuscationResult = JavaScriptObfuscator.obfuscate(cleanedCode, OBFUSCATION_OPTIONS);
      const obfuscatedCode = obfuscationResult.getObfuscatedCode();
      const obfuscatedSize = Buffer.byteLength(obfuscatedCode, 'utf8');
      totalObfuscated += obfuscatedSize;
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      fs.writeFileSync(filePath, obfuscatedCode, 'utf8');
      console.log(`      ✓ Obfuscated in ${duration}s -> New size: ${formatSize(obfuscatedSize)}`);
    } catch (err) {
      console.error(`      ❌ Failed to obfuscate ${file}:`, err.message);
      process.exit(1);
    }
  }

  console.log('\n==========================================');
  console.log('✅ JAVASCRIPT OBFUSCATION COMPLETE');
  console.log(`   Total bundles processed: ${jsFiles.length}`);
  console.log(`   Original Size:           ${formatSize(totalOriginal)}`);
  console.log(`   Obfuscated Size:         ${formatSize(totalObfuscated)}`);
  console.log('   Source Maps Purged:      YES (Security Enforced)');
  console.log('   Ready for Firebase Hosting deployment (firebase deploy)');
  console.log('==========================================\n');
}

runObfuscation().catch((err) => {
  console.error('Fatal Obfuscation Error:', err);
  process.exit(1);
});
