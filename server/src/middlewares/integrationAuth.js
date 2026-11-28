const integrationStore = require('../utils/integrationStore');

/**
 * Middleware that protects external integration endpoints on Strivers Server.
 * Strictly verifies API Key and Secret Token provided by AdityaTechnDevoops Server.
 */
function verifyAdityaServerAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const secretToken =
    req.headers['x-secret-token'] ||
    (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (!apiKey || !secretToken) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Both X-API-Key and X-Secret-Token headers are required for Aditya OS integration.'
    });
  }

  const isValid = integrationStore.validateCredentials(apiKey, secretToken);
  if (!isValid) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Invalid API Key or Secret Token. Ensure credentials match those configured in GUI.'
    });
  }

  integrationStore.recordHandshake();
  next();
}

module.exports = { verifyAdityaServerAuth };
