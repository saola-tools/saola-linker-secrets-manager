"use strict";

const Core = require("@saola/core");
const Promise = Core.require("bluebird");
const lodash = Core.require("lodash");
const { assert } = require("liberica");

const lab = require("../index");

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
    let expected = {
      "value": {
        "username": "admin",
        "password": "12345678",
        "host": "127.0.0.1",
        "port": 27017
      },
      "status": 1
    };
    //
    p = p.then(function(connParams) {
        false && console.log(JSON.stringify(connParams, null, 2));
        if (lab.isCloudSetup()) {
          assert.equal(lodash.get(connParams, ["status"]), 0);
          assert.equal(lodash.get(connParams, ["extra", "Name"]), lab.getSecretIdOf("documentdb"));
          assert.isObject(lodash.get(connParams, "value"));
          assert.isObject(lodash.get(connParams, ["extra", "$metadata"]));
          assert.isString(lodash.get(connParams, ["extra", "ARN"]));
        } else {
          assert.deepEqual(connParams, expected);
        }
    });
    //
    return p;
  });
});
