/**
 * Primary file for the API
 */

// Dependencies
const fs = require('fs');
const http = require('http');
const https = require('https');

const server = require('./server');
const config = require('./lib/config');

// Instantiate the HTTP server
const httpServer = http.createServer(server);

// Start the HTTP server
httpServer.listen(config.httpPort, () => {
  console.log(`The http server is listening on port ${config.httpPort} in ${config.envName} mode`);
});

// Instantiate the HTTPS server
const httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem'),
};

const httpsServer = https.createServer(httpsServerOptions, server);

// Start the HTTPS server
httpsServer.listen(config.httpsPort, () => {
  console.log(`The https server is listening on port ${config.httpsPort} in ${config.envName} mode`);
});
