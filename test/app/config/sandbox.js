"use strict";

const { BYPASSED_ERRORS } = require("../../../lib/helper");
const SECRET_ID_PREFIX = "beta/example/";

module.exports = {
  bridges: {
    awsSecretsManager: {
      application: {
        documentDbConfig: {
          region: "ap-southeast-1",
          secretId: SECRET_ID_PREFIX + "documentdb",
          defaultOnErrors: BYPASSED_ERRORS,
          defaultValue: {}
        },
        openSearchConfig: {
          region: "ap-southeast-1",
          secretId: SECRET_ID_PREFIX + "opensearch",
          defaultOnErrors: [ "ResourceNotFoundException" ],
          defaultValue: {
            host: "localhost",
            port: 9200
          }
        },
        jsonWebTokenKeys: {
          region: "ap-southeast-1",
          secretId: SECRET_ID_PREFIX + "jsonwebtoken",
        },
      }
    }
  }
};
