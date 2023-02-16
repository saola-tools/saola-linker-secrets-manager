'use strict';

const Devebot = require("@saola/core");
const Promise = Devebot.require('bluebird');
const lodash = Devebot.require('lodash');

const { mockit } = require('liberica');

const SECRET_ID_PREFIX = "beta/example/";

const Bridge = require('../../lib/bridge');

describe('tdd:saola-linker-aws-secrets-manager:client', function() {
  const client = new Bridge();
  it('should create redis client properly', function() {
    return client.getSecretValue({
      secretId: SECRET_ID_PREFIX + "documentdb",
    }).then(function(secret) {
      console.info(JSON.stringify(secret, null, 2));
      return true;
    });
  });
  //
  it('should create redis client properly', function() {
    return client.getSecretValue({
      secretId: SECRET_ID_PREFIX + "jsonwebtoken",
      defaultValue: {},
    }).then(function(secret) {
      console.info(JSON.stringify(secret, null, 2));
      return true;
    });
  });
});
