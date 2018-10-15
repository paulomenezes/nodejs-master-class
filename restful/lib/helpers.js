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
  // Create a string of random alphanumeric characters, of a given length
  createRandomString: strLength => {
    strLength = typeof strLength === 'number' && strLength > 0 ? strLength : false;

    if (strLength) {
      // Define all the possible characters that could go into a string
      const possibleCharacters = 'abcdefghijklmnopqrstuvxywz0123456789';

      // Start the final string
      let str = '';
      for (let i = 1; i <= strLength; i++) {
        // Get a random character from the possible characters string
        const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));

        // Append this character to the final string
        str += randomCharacter;
      }

      // Return the final string
      return str;
    } else {
      return false;
    }
  },
};

module.exports = helpers;
