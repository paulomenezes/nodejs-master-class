/**
 * Users request handlers
 */

// Dependencies
const _data = require('../data');
const helpers = require('../helpers');

const _users = {
  /**
   * Users - post
   * Required data: firstName, lastName, phone, password, tosAgreement
   * Optional data: none
   */
  POST: (data, callback) => {
    // Check that all required fields are filled out
    var firstName = typeof data.payload.firstName === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof data.payload.lastName === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof data.payload.phone === 'string' && data.payload.phone.trim().length === 11 ? data.payload.phone.trim() : false;
    var password = typeof data.payload.password === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof data.payload.tosAgreement === 'boolean' && data.payload.tosAgreement === true ? true : false;

    if (firstName && lastName && phone && password && tosAgreement) {
      // Make sure that the user doesn't already exist
      _data.read('users', phone, (err, data) => {
        if (err) {
          // Hash the password
          var hashedPassword = helpers.hash(password);

          if (hashedPassword) {
            // Create user object
            const userObject = {
              firstName,
              lastName,
              phone,
              hashedPassword,
              tosAgreement,
            };

            // Store the user
            _data.create('users', phone, userObject, err => {
              if (!err) {
                callback(200);
              } else {
                console.log(err);
                callback(400, {
                  error: 'Could not create the new user',
                });
              }
            });
          } else {
            callback(500, {
              error: "Could not hash the user's password",
            });
          }
        } else {
          // User already exist
          callback(400, {
            error: 'A user with that phone number already exist',
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
   * Users - get
   * Required data: phone
   * Optinal data: none
   */
  GET: (data, callback) => {
    // Check that the phone number is valid
    const phone =
      typeof data.queryStringObject.phone === 'string' && data.queryStringObject.phone.trim().length === 11
        ? data.queryStringObject.phone.trim()
        : false;

    if (phone) {
      // Get the token from the headers
      const token = typeof data.headers.token === 'string' ? data.headers.token : false;

      // Verify that the given token is valid for the phone number
      verifyToken(token, phone, tokenIsValid => {
        if (tokenIsValid) {
          // Lookup the user
          _data.read('users', phone, (err, data) => {
            if (!err && data) {
              // Remove the hashed password from the user object before returning it to the request
              delete data.hashedPassword;

              callback(200, data);
            } else {
              callback(404);
            }
          });
        } else {
          callback(403, {
            error: 'Missing required token in header, or token is invalid',
          });
        }
      });
    } else {
      callback(400, {
        error: 'Missing required field',
      });
    }
  },
  /**
   * Users - put
   * Required data: phone
   * Optional data: firstName, lastName, password (at lest one must be specified)
   */
  PUT: (data, callback) => {
    // Check that all required fields are filled out
    var phone = typeof data.payload.phone === 'string' && data.payload.phone.trim().length === 11 ? data.payload.phone.trim() : false;

    // Check for the optional fields
    var firstName = typeof data.payload.firstName === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof data.payload.lastName === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof data.payload.password === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    // Error if the phone is invalid
    if (phone) {
      // Error if nothing is sent to update
      if (firstName || lastName || password) {
        // Get the token from the headers
        const token = typeof data.headers.token === 'string' ? data.headers.token : false;

        // Verify that the given token is valid for the phone number
        verifyToken(token, phone, tokenIsValid => {
          if (tokenIsValid) {
            // Lookup the user
            _data.read('users', phone, (err, userData) => {
              if (!err && userData) {
                // Update the fields necessary
                if (firstName) {
                  userData.firstName = firstName;
                }

                if (lastName) {
                  userData.lastName = lastName;
                }

                if (password) {
                  userData.hashedPassword = helpers.hash(password);
                }

                // Store the new updates
                _data.update('users', phone, userData, err => {
                  if (!err) {
                    callback(200);
                  } else {
                    console.log(err);
                    callback(500, {
                      error: 'Could not update the user',
                    });
                  }
                });
              } else {
                callback(400, {
                  error: 'The specified user does not exist',
                });
              }
            });
          } else {
            callback(403, {
              error: 'Missing required token in header, or token is invalid',
            });
          }
        });
      } else {
        callback(400, {
          error: 'Missing fields to update',
        });
      }
    } else {
      callback(400, {
        error: 'Missing required field',
      });
    }
  },
  /**
   * Users - delete
   * Required data: phone
   * Optinal data: none
   * @TODO Cleanup (delete) any other data files associated with this user
   */
  DELETE: (data, callback) => {
    // Check that the phone number is valid
    const phone =
      typeof data.queryStringObject.phone === 'string' && data.queryStringObject.phone.trim().length === 11
        ? data.queryStringObject.phone.trim()
        : false;

    if (phone) {
      // Get the token from the headers
      const token = typeof data.headers.token === 'string' ? data.headers.token : false;

      // Verify that the given token is valid for the phone number
      verifyToken(token, phone, tokenIsValid => {
        if (tokenIsValid) {
          // Lookup the user
          _data.read('users', phone, (err, data) => {
            if (!err && data) {
              _data.delete('users', phone, err => {
                if (!err) {
                  callback(200);
                } else {
                  callback(500, {
                    error: 'Could not delete the specified user',
                  });
                }
              });
            } else {
              callback(400, {
                error: 'Could not find the specified user',
              });
            }
          });
        } else {
          callback(403, {
            error: 'Missing required token in header, or token is invalid',
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

// Verify if the given token id is currently valid for a given user
const verifyToken = (id, phone, callback) => {
  // Lookup the token
  _data.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      // Check that the token is for the given user and has not expired
      if (tokenData.phone === phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

module.exports = _users;
