"use strict";

const path = require("path");

const Core = require("@saola/core");
const Promise = Core.require("bluebird");
const lodash = Core.require("lodash");

const { assert, rewire, sinon } = require("liberica");

const lab = require("../index");

describe("tdd:saola-linker-secrets-manager:client", function() {
  const Bridge = rewire(path.join(__dirname, "../../lib/bridge"));

  it("display the real client-secrets-manager.getSecretValue", function() {
    if (!lab.isCloudSetup()) {
      return this.skip();
    }
    const client = new Bridge();
    return client.getSecretValue({
      secretId: lab.getSecretIdOf("jsonwebtoken"),
      versionId: "6d2becc6-1aec-4446-a303-8ffadc81d541",
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
          return Promise.resolve(SAMPLE_SECRET_VALUE_OF["jsonwebtoken"]["AWSCURRENT"]);
        }
      }
      //
      let p = client.getSecretValue({ secretId: lab.getSecretIdOf("documentdb") });
      //
      const expected = {
        "status": 0,
        "value": JSON.parse(lodash.get(SAMPLE_SECRET_VALUE_OF["jsonwebtoken"]["AWSCURRENT"], ["SecretString"])),
        "extra": lodash.omit(SAMPLE_SECRET_VALUE_OF["jsonwebtoken"]["AWSCURRENT"], ["SecretString"])
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
            return Promise.resolve(SAMPLE_SECRET_VALUE_OF["jsonwebtoken"]["AWSCURRENT"]);
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
  //
  it("the getSecretValue() must be supported to execute asynchronously", function() {
    const getSecretValue = sinon.spy(Bridge.__get__("getSecretValue"));
    const setupSpace = Bridge.__with__({ getSecretValue });
    //
    return setupSpace(function() {
      const client = new Bridge();
      if (!lab.isCloudSetup()) {
        client._context_.client = {
          send: function() {
            return Promise.resolve(SAMPLE_SECRET_VALUE_OF["jsonwebtoken"]["AWSCURRENT"]).delay(lodash.random(10, 30));
          }
        }
      }
      //
      let p = Promise.map(lodash.range(1000), function(i) {
        if (i % 11 === 0) {
          return client.getSecretValue({ secretId: lab.getSecretIdOf("jsonwebtoken") });
        }
        return client.getSecretValue({ secretId: lab.getSecretIdOf("documentdb") });
      });
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

const SAMPLE_SECRET_VALUE_OF = {
  documentdb: {
    "$metadata": {
      "httpStatusCode": 200,
      "requestId": "9bcd9653-c1d3-4349-8ac5-b514433dd1f5",
      "attempts": 1,
      "totalRetryDelay": 0
    },
    "ARN": "arn:aws:secretsmanager:ap-southeast-1:112233445566:secret:beta/example/documentdb-RCf000",
    "CreatedDate": "2022-03-12T12:26:27.202Z",
    "Name": "beta/example/documentdb",
    "VersionId": "51840cd8-6986-49fb-aa00-2e9151fb4cdd",
    "VersionStages": [
      "AWSCURRENT"
    ],
    "SecretString": JSON.stringify({
      "username": "admin",
      "password": "Zaq!23EdcX",
      "engine": "mongo",
      "host": "beta-mongodb.cluster-xyz1234abcd.ap-southeast-1.docdb.amazonaws.com",
      "port": 27017,
      "ssl": false,
      "dbClusterIdentifier": "beta-mongodb"
    })
  },
  jsonwebtoken: {
    AWSPREVIOUS: {
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
        "AWSPREVIOUS"
      ],
      "SecretString": JSON.stringify({
        "secretKey": "changeme",
        "deprecatedKeys": "invalid,deprecated"
      })
    },
    AWSCURRENT: {
      "$metadata": {
        "httpStatusCode": 200,
        "requestId": "98d097ad-b9dd-435a-b458-64b48a3cfbfb",
        "attempts": 1,
        "totalRetryDelay": 0
      },
      "ARN": "arn:aws:secretsmanager:ap-southeast-1:xxxxx:secret:xxx/yyy/zzz-ABCXYZ",
      "CreatedDate": "2021-02-21T07:14:53.679Z",
      "Name": "xxx/yyy/zzz",
      "VersionId": "dfade4fe-ac5f-458a-9ef4-9d3cd54a9dcd",
      "VersionStages": [
        "AWSCURRENT"
      ],
      "SecretString": JSON.stringify({
        "secretKey": "changeme",
        "deprecatedKeys": "p4$$w0rd,deprecated"
      })
    }
  }
};
