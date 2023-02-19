"use strict";

const Core = require("@saola/core");
const Promise = Core.require("bluebird");
const lodash = Core.require("lodash");

const { Mutex } = require("./helper");

const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");

function Service (params = {}) {
  const { region, secretId, defaultOnErrors, defaultValue } = params;
  //
  this._context_ = {};
  this._sandbox_ = new Mutex();
  this._secrets_ = {};
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
  if (options.isRefreshing) {
    return resetCachedSecretValue(options, this).then(function() {
      return getCachedSecretValue(options, this);
    });
  }
  return getCachedSecretValue(options, this);
};

Service.prototype.reset = function(options = {}) {
  return resetCachedSecretValue(options, this);
};

function getCachedSecretValue (options = {}, self = {}) {
  const that = this || self;
  const context = that._context_;
  const sandbox = that._sandbox_;
  //
  const secretId = options.secretId || context.secretId;
  if (that._secrets_[secretId]) {
    return Promise.resolve(that._secrets_[secretId]);
  }
  //
  return new Promise(function(resolve, reject) {
    sandbox.lock(function() {
      if (that._secrets_[secretId]) {
        resolve(that._secrets_[secretId]);
        sandbox.unlock();
        return;
      }
      getSecretValue(options, that).then(function onResolved (result) {
        that._secrets_[secretId] = result;
        resolve(that._secrets_[secretId]);
        sandbox.unlock();
      }, function onRejected (error) {
        reject(error);
        sandbox.unlock();
      });
    });
  });
}

function resetCachedSecretValue (options = {}, self = {}) {
  const that = this || self;
  const context = that._context_;
  const sandbox = that._sandbox_;
  //
  const secretId = options.secretId || context.secretId;
  if (secretId && secretId != "*" && isNil(that._secrets_[secretId])) {
    return Promise.resolve();
  }
  //
  return new Promise(function(resolve, reject) {
    sandbox.lock(function() {
      if (that._secrets_.hasOwnProperty(secretId)) {
        delete that._secrets_[secretId];
      }
      if (secretId == "*") {
        for (let id in that._secrets_) {
          if (that._secrets_.hasOwnProperty(id)) {
            delete that._secrets_[id];
          }
        }
      }
      resolve();
      sandbox.unlock();
    });
  });
}

function isNil (v) {
  return v == null || v == undefined;
}

function getSecretValue (options = {}, self = {}) {
  const that = this || self || {};
  const context = that._context_ || {};
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
