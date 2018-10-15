/**
 * Request handlers
 */

// Dependencies
const _users = require('./handlers/users');
const _tokens = require('./handlers/tokens');

// Define the handlers
const handlers = {
  ping: (data, callback) => {
    callback(200);
  },
  hello: (data, callback) => {
    callback(200, {
      message: 'Hello World!',
    });
  },
  notFound: (data, callback) => {
    callback(404);
  },
  users: (data, callback) => {
    var acceptableMethods = ['POST', 'GET', 'PUT', 'DELETE'];

    if (acceptableMethods.indexOf(data.method) >= 0) {
      _users[data.method](data, callback);
    } else {
      callback(405);
    }
  },
  tokens: (data, callback) => {
    var acceptableMethods = ['POST', 'GET', 'PUT', 'DELETE'];

    if (acceptableMethods.indexOf(data.method) >= 0) {
      _tokens[data.method](data, callback);
    } else {
      callback(405);
    }
  },
};

module.exports = handlers;
