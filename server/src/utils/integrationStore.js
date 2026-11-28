const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_FILE = path.join(__dirname, '../data/integration_config.json');

// Default initial state
const DEFAULT_CONFIG = {
  apiKey: 'ubos_strivers_live_key_9x9',
  secretToken: 'sec_strivers_mat9x9_token_2026',
  adityaServerUrl: 'http://localhost:5000',
  configuredBy: 'GUI Initial Seed',
  configuredAt: new Date().toISOString(),
  lastHandshakeAt: null,
  status: 'ACTIVE',
  allowedFeatures: ['orders_sync', 'revenue_metrics', 'user_telemetry', 'course_catalog']
};

class IntegrationStore {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
      }
    } catch (err) {
      console.warn('[IntegrationStore] Error reading config file, falling back to defaults:', err.message);
    }
    this.persist(DEFAULT_CONFIG);
    return { ...DEFAULT_CONFIG };
  }

  persist(data) {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error('[IntegrationStore] Failed to write config file:', err.message);
    }
  }

  getConfig() {
    return { ...this.config };
  }

  getPublicConfig() {
    return {
      apiKey: this.config.apiKey,
      secretTokenMasked: this.config.secretToken
        ? `${this.config.secretToken.substring(0, 4)}••••••••${this.config.secretToken.slice(-4)}`
        : 'Not Set',
      hasSecretToken: Boolean(this.config.secretToken),
      adityaServerUrl: this.config.adityaServerUrl,
      configuredBy: this.config.configuredBy,
      configuredAt: this.config.configuredAt,
      lastHandshakeAt: this.config.lastHandshakeAt,
      status: this.config.status,
      allowedFeatures: this.config.allowedFeatures
    };
  }

  saveConfig({ apiKey, secretToken, adityaServerUrl, configuredBy = 'serverClient GUI' }) {
    if (!apiKey || !secretToken) {
      throw new Error('API Key and Secret Token are strictly required');
    }

    this.config = {
      ...this.config,
      apiKey: String(apiKey).trim(),
      secretToken: String(secretToken).trim(),
      adityaServerUrl: adityaServerUrl ? String(adityaServerUrl).trim() : this.config.adityaServerUrl,
      configuredBy,
      configuredAt: new Date().toISOString(),
      status: 'ACTIVE'
    };

    this.persist(this.config);
    return this.getPublicConfig();
  }

  generateRandomCredentials() {
    const randomHex = crypto.randomBytes(16).toString('hex');
    const secretHex = crypto.randomBytes(24).toString('hex');
    return {
      apiKey: `ubos_strivers_${randomHex}`,
      secretToken: `sec_strivers_${secretHex}`
    };
  }

  validateCredentials(providedKey, providedSecret) {
    if (!providedKey || !providedSecret || !this.config.apiKey || !this.config.secretToken) return false;
    const bufKeyA = Buffer.from(String(providedKey));
    const bufKeyB = Buffer.from(String(this.config.apiKey));
    const bufSecA = Buffer.from(String(providedSecret));
    const bufSecB = Buffer.from(String(this.config.secretToken));

    if (bufKeyA.length !== bufKeyB.length || bufSecA.length !== bufSecB.length) {
      return false;
    }

    const keyMatch = crypto.timingSafeEqual(bufKeyA, bufKeyB);
    const secretMatch = crypto.timingSafeEqual(bufSecA, bufSecB);
    return keyMatch && secretMatch;
  }

  recordHandshake() {
    this.config.lastHandshakeAt = new Date().toISOString();
    this.persist(this.config);
  }
}

module.exports = new IntegrationStore();
