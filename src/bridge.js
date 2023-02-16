"use strict";

const Devebot = require("@saola/core");
const Promise = Devebot.require("bluebird");
const lodash = Devebot.require("lodash");

const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");

function Service (params = {}) {
  const { region, secretId, defaultOnErrors, defaultValue } = params;
  //
  this._context_ = {};
  //
  let args = {};
  if (lodash.isString(region)) {
    args = lodash.assign(args, { region });
  }
  this._context_.client = new SecretsManagerClient(args);
  //
  if (lodash.isString(secretId)) {
    this._context_.secretId = secretId;
  }
  //
  if (lodash.isArray(defaultOnErrors)) {
    this._context_.defaultOnErrors = defaultOnErrors;
  }
  //
  if (defaultValue) {
    this._context_.defaultValue = defaultValue;
  }
}

Service.prototype.getSecretValue = function(options = {}) {
  return getSecretValue.bind(this)(options);
}

function getSecretValue (options = {}) {
  const context = this._context_ || {};
  const { client, defaultOnErrors } = context;
  //
  const secretId = options.secretId || context.secretId;
  const defaultValue = options.defaultValue || context.defaultValue;
  const versionStage = options.versionStage || context.versionStage;
  const versionId = options.versionId || context.versionId;
  //
  const transformer = lodash.isFunction(options.transformer) ? options.transformer : lodash.identity;
  //
  let p = Promise.resolve().then(function() {
    const args = {
      SecretId: secretId,
      VersionStage: versionStage || "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
    };
    if (lodash.isString(versionId)) {
      args.VersionId = versionId;
    }
    return client.send(new GetSecretValueCommand(args));
  });
  //
  p = p.then(function(response) {
    const value = JSON.parse(response.SecretString);
    const extra = lodash.omit(response, [ "SecretString" ]);
    return transformer({ status: 0, value, extra });
  });
  //
  // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
  //
  p = p.catch(function(error) {
    if (!lodash.isArray(defaultOnErrors)) {
      return Promise.resolve(transformer({ error, status: -1 }));
    }
    //
    if (!defaultOnErrors.includes("*") && !defaultOnErrors.includes(error.name)) {
      return Promise.resolve(transformer({ error, status: -2 }));
    }
    //
    if (!lodash.isPlainObject(defaultValue)) {
      return Promise.resolve(transformer({ error, status: -3 }));
    }
    //
    return transformer({ value: defaultValue, status: 1 });
  });
  //
  return p;
};

module.exports = Service;