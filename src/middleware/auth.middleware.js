const logger = require('../utils/logger');
const config = require('../config/config');

// API auth middleware
const authenticateRequest = (req, res, next) => {
  // Retrieve the appId and appKey from headers
  const appId = req.header('x-app-id');
  const appKey = req.header('x-app-key');

  // Check for appId and appKey
  if (!appId || !appKey) {
    logger.error('Authentication failed: Missing credentials');
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Check if the credentials match
  if (appId !== config.credentials.appId || appKey !== config.credentials.appKey) {
    logger.error(`Authentication failed for app ID: ${appId}`);
    return res.status(403).json({ error: 'Invalid credentials' });
  }

  // Validate IP if in production environment
  if (process.env.NODE_ENV === 'production') {
    const requestIp = req.ip || req.headers['x-forwarded-for']?.split(',')[0].trim();  
    const allowedIps = config.ALLOWED_IP || [];  

    if (!allowedIps.includes(requestIp)) {
      logger.error(`Request from unauthorized IP: ${requestIp}`);
      return res.status(403).json({ error: 'Forbidden: Unauthorized IP' });
    }

    logger.info(`Request authenticated for app ID: ${appId} from IP: ${requestIp}`);
  } else {
    logger.info(`Request authenticated for app ID: ${appId} (no IP validation in development)`);
  }

  next();
};

module.exports = authenticateRequest;
