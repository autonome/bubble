/* globals require */
"use strict";

const httpPort = 8000;
const ws = require("ws");
const wsPort = 8009;
const express = require("express");

(() => {

  // Web server
  var app = new express();
  app.disable('etag');
  app.use('/', express.static('../www'));
  app.listen(httpPort, '0.0.0.0', function() {
    console.log('Web server listening on port ' + httpPort);
  });

  // Web socket server
  var wss = new ws.Server({ port: wsPort });
  wss.on('connection', function(conn) {

    conn.on('message', function(msg) {

      console.log('message received');

      if (msg.blink) {

        // Make stuff blink.

      }

      conn.send('from server');

    });

  });

  const shutdown = () => {
    console.log("shutting down...");
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
})();
