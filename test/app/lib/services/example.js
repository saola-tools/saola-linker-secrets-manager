"use strict";

const Service = function(params = {}) {
  const { loggingFactory } = params;
  const { documentDbConfigClient, openSearchConfigClient, jsonWebTokenKeysClient } = params;

  const L = loggingFactory.getLogger();
  const T = loggingFactory.getTracer();

  L.has("silly") && L.log("silly", T && T.toMessage({
    text: "exampleService is loading"
  }));

  this.getDocumentDbConfig = function() {
    return documentDbConfigClient.getSecretValue({
      defaultValue: {
        "username": "admin",
        "password": "12345678",
        "host": "127.0.0.1",
        "port": 27017,
      }
    });
  }

  this.getOpenSearchConfig = function() {
    return openSearchConfigClient.getSecretValue();
  }

  this.getJsonWebTokenKeys = function() {
    return jsonWebTokenKeysClient.getSecretValue();
  }
};

Service.referenceHash = {
  documentDbConfigClient: "application/secretsManager#documentDbConfig",
  openSearchConfigClient: "application/secretsManager#openSearchConfig",
  jsonWebTokenKeysClient: "application/secretsManager#jsonWebTokenKeys",
};

module.exports = Service;
