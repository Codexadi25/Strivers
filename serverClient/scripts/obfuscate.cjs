/**
 * Production JavaScript Obfuscator Script for Strivers ServerClient Web Application
 * Obfuscates compiled Webpack bundles in dist/ before Firebase Hosting deployment.
 * Removes source maps and LICENSE sidecars to avoid leaking source symbols.
 */

const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

const clientRequire = createRequire(path.resolve(__dirname, '../../client/package.json'));
const JavaScriptObfuscator = clientRequire('javascript-obfuscator');

const DIST_DIR = path.resolve(__dirname, '..', 'dist');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');

// Options tuned for React 19, Material UI, and Firebase Web SDK compatibility
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
  renameGlobals: false,
  selfDefending: false,
  sourceMap: false,
};

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function purgeArtifactFiles(directory) {
  if (!fs.existsSync(directory)) return 0;

  let count = 0;
  for (const entry of fs.readdirSync(directory)) {
    const fullPath = path.join(directory, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      count += purgeArtifactFiles(fullPath);
    } else if (entry.endsWith('.map') || entry.endsWith('.LICENSE.txt')) {
      try {
        fs.unlinkSync(fullPath);
        count++;
      } catch (err) {
        console.warn(`[Warn] Could not delete artifact ${entry}:`, err.message);
      }
    }
  }
  return count;
}

function collectJsFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const results = [];
  for (const entry of fs.readdirSync(directory)) {
    const fullPath = path.join(directory, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...collectJsFiles(fullPath));
    } else if (entry.endsWith('.js')) {
      results.push(fullPath);
    }
  }
  return results;
}

function stripSourceMapComments(code) {
  return code.replace(/\r?\n\/\/#\s*sourceMappingURL=\S+\s*$/, '');
}

async function runObfuscation() {
  console.log('\n==========================================');
  console.log('   SERVERCLIENT PRODUCTION JS OBFUSCATION');
  console.log('==========================================\n');

  if (!fs.existsSync(DIST_DIR)) {
    console.error('Error: "dist" directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  console.log('Step 1: Purging source maps (.map) and license artifacts from dist/...');
  const purged = purgeArtifactFiles(DIST_DIR);
  console.log(`   Removed ${purged} artifact file(s).`);

  const targetRoot = fs.existsSync(ASSETS_DIR) ? ASSETS_DIR : DIST_DIR;
  const jsFiles = collectJsFiles(targetRoot);

  if (jsFiles.length === 0) {
    console.log('No .js bundle files found in dist/ to obfuscate.');
    return;
  }

  console.log(`\nStep 2: Obfuscating ${jsFiles.length} JavaScript bundle(s)...`);

  let totalOriginal = 0;
  let totalObfuscated = 0;

  for (const filePath of jsFiles) {
    const relName = path.relative(DIST_DIR, filePath);
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const originalSize = Buffer.byteLength(originalContent, 'utf8');
    totalOriginal += originalSize;

    console.log(`\n   Processing: ${relName} (${formatSize(originalSize)})`);
    const cleanedCode = stripSourceMapComments(originalContent);

    try {
      const startTime = Date.now();
      const obfuscationResult = JavaScriptObfuscator.obfuscate(cleanedCode, OBFUSCATION_OPTIONS);
      const obfuscatedCode = obfuscationResult.getObfuscatedCode();
      const obfuscatedSize = Buffer.byteLength(obfuscatedCode, 'utf8');
      totalObfuscated += obfuscatedSize;
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      fs.writeFileSync(filePath, obfuscatedCode, 'utf8');
      console.log(`      Obfuscated in ${duration}s -> New size: ${formatSize(obfuscatedSize)}`);
    } catch (err) {
      console.error(`      Failed to obfuscate ${relName}:`, err.message);
      process.exit(1);
    }
  }

  console.log('\n==========================================');
  console.log('SERVERCLIENT OBFUSCATION COMPLETE');
  console.log(`   Total bundles processed: ${jsFiles.length}`);
  console.log(`   Original Size:           ${formatSize(totalOriginal)}`);
  console.log(`   Obfuscated Size:         ${formatSize(totalObfuscated)}`);
  console.log('   Source Maps Purged:      YES');
  console.log('   Ready for Firebase Hosting deployment (ExternalStrivers.web.app)');
  console.log('==========================================\n');
}

runObfuscation().catch((err) => {
  console.error('Fatal Obfuscation Error:', err);
  process.exit(1);
});
