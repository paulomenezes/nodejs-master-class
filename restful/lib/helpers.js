/**
 * Helpers for various task
 */

const crypto = require('crypto');
const config = require('./config');

const helpers = {
  // Create a SHA256 hash
  hash: str => {
    if (typeof str === 'string' && str.trim().length > 0) {
      var hash = crypto
        .createHmac('sha256', config.hashingSecret)
        .update(str)
        .digest('hex');

      return hash;
    } else {
      return false;
    }
  },
  // Parse a JSON string to an object in all case, without throwing
  parseJsonToObject: str => {
    try {
      return JSON.parse(str);
    } catch (e) {
      return {};
    }
  },
};

module.exports = helpers;
