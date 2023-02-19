"use strict";

const path = require("path");

const Core = require("@saola/core");
const Promise = Core.require("bluebird");
const lodash = Core.require("lodash");

const { assert, rewire, sinon } = require("liberica");

const lab = require("../index");

describe("tdd:saola-linker-secrets-manager:client", function() {
  const Bridge = rewire(path.join(__dirname, "../../lib/bridge"));
  //
  it("the resetCachedSecretValue() must be executed correctly", function() {
    const getSecretValue = sinon.spy(Bridge.__get__("getSecretValue"));
    const resetCachedSecretValue = sinon.spy(Bridge.__get__("resetCachedSecretValue"));
    const setupSpace = Bridge.__with__({ getSecretValue, resetCachedSecretValue });
    //
    return setupSpace(function() {
      const client = new Bridge();
      if (!lab.isCloudSetup()) {
        client._context_.client = {
          send: function() {
            return Promise.resolve({
              "$metadata": {
                "httpStatusCode": 200,
                "requestId": "5b13624e-9187-479c-b03e-79e3590b92cc",
                "attempts": 1,
                "totalRetryDelay": 0
              },
              "ARN": "arn:aws:secretsmanager:ap-southeast-1:xxxxx:secret:xxx/yyy/zzz-ABCXYZ",
              "CreatedDate": "2021-02-12T11:07:34.233Z",
              "Name": "xxx/yyy/zzz",
              "VersionId": "6d2becc6-1aec-4446-a303-8ffadc81d541",
              "VersionStages": [
                "AWSCURRENT"
              ],
              "SecretString": JSON.stringify({
                "secretKey": "changeme",
                "deprecatedKeys": "invalid,deprecated"
              })
            });
          }
        }
      }
      //
      let p = Promise.mapSeries(lodash.range(1000), function(i) {
        if (i % 400 === 399) {
          return client.reset({ secretId: lab.getSecretIdOf("jsonwebtoken") });
        }
        if (i % 11 === 0) {
          return client.getSecretValue({ secretId: lab.getSecretIdOf("jsonwebtoken") });
        }
        return client.getSecretValue({ secretId: lab.getSecretIdOf("documentdb") });
      });
      //
      p = p.then(function(secrets) {
        false && console.info(JSON.stringify(secrets, null, 2));
        return secrets;
      });
      //
      return p;
    }).then(function() {
      false && console.log("getSecretValue.callCount: %s", getSecretValue.callCount);
      assert.equal(getSecretValue.callCount, 4);
      false && console.log("resetCachedSecretValue.callCount: %s", resetCachedSecretValue.callCount);
      assert.equal(resetCachedSecretValue.callCount, 2);
    });
  });
});
