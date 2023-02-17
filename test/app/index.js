"use strict";

var app = require("@saola/core").launchApplication({
  appRootPath: __dirname
}, [], [
  {
    name: "@saola/linker-secrets-manager",
    path: require("path").join(__dirname, "../../index.js")
  }
]);

if (require.main === module) {
  app.server.start().then(function() {
    process.on("SIGINT", function() {
      app.server.stop().then(function () {
        console.info("The server has been stopped.");
      });
    });
  });
}

module.exports = app;
