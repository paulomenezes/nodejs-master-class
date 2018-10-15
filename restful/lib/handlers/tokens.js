/**
 * Tokens request handlers
 */

// Dependencies
const _data = require('../data');
const helpers = require('../helpers');

const _tokens = {
  /**
   * Tokens - post
   * Required data: phone, password
   * Optional data: none
   */
  POST: (data, callback) => {
    var phone = typeof data.payload.phone === 'string' && data.payload.phone.trim().length === 11 ? data.payload.phone.trim() : false;
    var password = typeof data.payload.password === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (phone && password) {
      // Lookup the user who matches that phone number

      _data.read('users', phone, (err, userData) => {
        if (!err && userData) {
          // Hash the sent password, and compare it to the password stored in the user object
          const hashedPassword = helpers.hash(password);

          if (hashedPassword === userData.hashedPassword) {
            // If valid, create a new token with a random name. Set expiration date 1 hour in the future
            const tokenId = helpers.createRandomString(20);
            const expires = Date.now() + 1000 * 60 * 60;

            const tokenObject = {
              phone,
              id: tokenId,
              expires,
            };

            // Store the token
            _data.create('tokens', tokenId, tokenObject, err => {
              if (!err) {
                callback(200, tokenObject);
              } else {
                callback(500, {
                  error: 'Could not create the new token',
                });
              }
            });
          } else {
            callback(400, {
              error: "Password did not match the speficied user's stored password",
            });
          }
        } else {
          callback(400, {
            error: 'Could not find the specified user',
          });
        }
      });
    } else {
      callback(400, {
        error: 'Missing required fields',
      });
    }
  },
  /**
   * Tokens - get
   * Required data: id
   * Optional data: none
   */
  GET: (data, callback) => {
    // Check that the id is valid
    const id =
      typeof data.queryStringObject.id === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;

    if (id) {
      // Lookup the token
      _data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
          callback(200, tokenData);
        } else {
          callback(404);
        }
      });
    } else {
      callback(400, {
        error: 'Missing required field',
      });
    }
  },
  /**
   * Tokens - put
   * Required data: id, extend
   * Optional data: none
   */
  PUT: (data, callback) => {
    var id = typeof data.payload.id === 'string' && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false;
    var extend = typeof data.payload.extend === 'boolean' && data.payload.extend === true ? true : false;

    if (id && extend) {
      // Lookup the token
      _data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
          // Check to the make sure the token isn't already expired
          if (tokenData.expires > Date.now()) {
            // Set the expiration an hour from now
            tokenData.expires = Date.now() + 1000 * 60 * 60;

            // Store the new update
            _data.update('tokens', id, tokenData, err => {
              if (!err) {
                callback(200);
              } else {
                callback(500, {
                  error: "Could not update the token's expiration",
                });
              }
            });
          } else {
            callback(400, {
              error: 'The token has already expired and cannot be extend',
            });
          }
        } else {
          callback(400, {
            error: 'Specified token does not exist',
          });
        }
      });
    } else {
      callback(400, {
        error: 'Missing required fields or invalid fields',
      });
    }
  },
  /**
   * Tokens - delete
   * Required data: id
   * Optional data: none
   */
  DELETE: (data, callback) => {
    // Check that the id is valid
    const id =
      typeof data.queryStringObject.id === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;

    if (id) {
      // Lookup the token
      _data.read('tokens', id, (err, data) => {
        if (!err && data) {
          _data.delete('tokens', id, err => {
            if (!err) {
              callback(200);
            } else {
              callback(500, {
                error: 'Could not delete the specified token',
              });
            }
          });
        } else {
          callback(400, {
            error: 'Could not find the specified token',
          });
        }
      });
    } else {
      callback(400, {
        error: 'Missing required field',
      });
    }
  },
};

module.exports = _tokens;
