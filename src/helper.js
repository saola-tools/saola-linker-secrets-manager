"use strict";

const helper = {};

const BYPASSED_ERRORS = [
  "DecryptionFailure",
  "InternalServiceError",
  "InvalidParameterException",
  "InvalidRequestException",
  "ResourceNotFoundException",
  "UnrecognizedClientException",
  "InvalidSignatureException",
];

function Mutex () {
  this._silo_ = {
    isLocked: false,
    queue: []
  };
}

Mutex.prototype.isNumber = function(val) {
  return (typeof val === "number");
};

Mutex.prototype.tryLock = function () {
  if (this._silo_.isLocked) {
    return false;
  }
  this._silo_.isLocked = true;
  return true;
};

Mutex.prototype.lock = function (cb, ttl) {
  if (this.tryLock()) {
    cb.call(this);
  } else {
    if (this.isNumber(ttl) && ttl > 0) {
      let that = this;
      let timer = setTimeout(function () {
        if (cb) {
          cb.call(this, new Error("Lock timed out"));
          cb = null;
        }
      }, ttl);
      this._silo_.queue.push(function () {
        clearTimeout(timer);
        if (cb) {
          cb.call(this);
          cb = null;
        } else {
          that.unlock();
        }
      });
    } else {
      this._silo_.queue.push(cb);
    }
  }
};

Mutex.prototype.unlock = function () {
  if (!this._silo_.isLocked) {
    throw new Error("Mutex is not locked");
  }

  let waiter = this._silo_.queue.shift();

  if (waiter) {
    waiter.call(this);
  } else {
    this._silo_.isLocked = false;
  }
};

Object.defineProperty(Mutex.prototype, "isLocked", {
  get: function () {
    return this._silo_.isLocked;
  }
});

module.exports = {
  helper,
  Mutex,
  BYPASSED_ERRORS
};
