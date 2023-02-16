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

module.exports = {
  helper,
  BYPASSED_ERRORS
};
