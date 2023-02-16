"use strict";

const { assert } = require("chai");

describe("bdd:saola-linker-aws-secrets-manager:client", function() {
  let app;
  //
  before(function() {
    app = require("../app");
  });

  it("getSandboxService().getDocumentDbConfig()", function() {
    const exampleService = app.runner.getSandboxService("application/example");
    //
    let p = Promise.resolve(exampleService.getDocumentDbConfig());
    //
    p = p.then(function(connection) {
        console.log(JSON.stringify(connection, null, 2));
      // assert.equal(connection.readyState, 1);
    });
    //
    return p;
  });
});
