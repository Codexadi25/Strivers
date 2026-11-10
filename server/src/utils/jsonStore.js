const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('[JsonStore] Notice creating data dir:', err.message);
  }
}

/**
 * Loads JSON data from server/src/data/<filename>. Falls back cleanly to initializer.
 */
function loadJsonFile(filename, defaultInitializer) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed !== null && parsed !== undefined) {
        if (Array.isArray(parsed) && parsed.length === 0 && typeof defaultInitializer === 'function') {
          // If empty array only, fall back only if desired; otherwise return parsed
          return parsed;
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn(`[JsonStore] Notice reading ${filename}:`, err.message);
  }

  const initial = typeof defaultInitializer === 'function'
    ? defaultInitializer()
    : JSON.parse(JSON.stringify(defaultInitializer));
  saveJsonFile(filename, initial);
  return initial;
}

/**
 * Atomically persists JSON data to server/src/data/<filename>.
 */
function saveJsonFile(filename, data) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn(`[JsonStore] Notice writing ${filename}:`, err.message);
  }
}

module.exports = {
  DATA_DIR,
  loadJsonFile,
  saveJsonFile,
};
