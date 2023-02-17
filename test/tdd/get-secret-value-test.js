"use strict";

const path = require("path");

const Core = require("@saola/core");
const Promise = Core.require("bluebird");
const lodash = Core.require("lodash");

const { assert, rewire, sinon } = require("liberica");

const lab = require("../index");

describe("tdd:saola-linker-aws-secrets-manager:client", function() {
  const Bridge = rewire(path.join(__dirname, "../../lib/bridge"));

  it("display the real client-secrets-manager.getSecretValue", function() {
    if (!lab.isCloudSetup()) {
      return this.skip();
    }
    const client = new Bridge();
    return client.getSecretValue({
      secretId: lab.getSecretIdOf("jsonwebtoken"),
      defaultValue: {},
    }).then(function(secret) {
      true && console.info(JSON.stringify(secret, null, 2));
    });
  });
  //
  it("the client.getSecretValue() should return a correct value", function() {
    const getSecretValue = sinon.spy(Bridge.__get__("getSecretValue"));
    const setupSpace = Bridge.__with__({ getSecretValue });
    //
    return setupSpace(function() {
      const client = new Bridge();
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
      //
      let p = client.getSecretValue({ secretId: lab.getSecretIdOf("documentdb") });
      //
      const expected = {
        "status": 0,
        "value": {
          "secretKey": "changeme",
          "deprecatedKeys": "invalid,deprecated"
        },
        "extra": {
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
          ]
        }
      };
      //
      p = p.then(function(secret) {
        false && console.info(JSON.stringify(secret, null, 2));
        assert.deepEqual(secret, expected);
      });
      //
      return p;
    });
  });
  //
  it("the value of the secret[secretId] should be cached", function() {
    const getSecretValue = sinon.spy(Bridge.__get__("getSecretValue"));
    const setupSpace = Bridge.__with__({ getSecretValue });
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
      let p = Promise.all([
        client.getSecretValue({ secretId: lab.getSecretIdOf("documentdb") }),
        client.getSecretValue({ secretId: lab.getSecretIdOf("documentdb") }),
        client.getSecretValue({ secretId: lab.getSecretIdOf("jsonwebtoken") }),
        client.getSecretValue({ secretId: lab.getSecretIdOf("documentdb") }),
        client.getSecretValue({ secretId: lab.getSecretIdOf("jsonwebtoken") }),
      ])
      //
      p = p.then(function(secrets) {
        false && console.info(JSON.stringify(secrets, null, 2));
        false && console.log("count: %s", getSecretValue.callCount);
        assert.equal(getSecretValue.callCount, 2);
      });
      //
      return p;
    });
  });
});
