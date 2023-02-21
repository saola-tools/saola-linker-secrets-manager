"use strict";

const { BYPASSED_ERRORS } = require("../../../lib/helper");
const lab = require("../../index");

module.exports = {
  bridges: {
    secretsManager: {
      application: {
        documentDbConfig: {
          region: "ap-southeast-1",
          secretId: lab.getSecretIdOf("documentdb"),
          defaultOnErrors: BYPASSED_ERRORS,
          defaultValue: {}
        },
        openSearchConfig: {
          region: "ap-southeast-1",
          secretId: lab.getSecretIdOf("opensearch"),
          defaultOnErrors: [ "ResourceNotFoundException" ],
          defaultValue: {
            host: "localhost",
            port: 9200
          }
        },
        jsonWebTokenKeys: {
          region: "ap-southeast-1",
          secretId: lab.getSecretIdOf("jsonwebtoken"),
          versionStage: "AWSPREVIOUS",
          defaultOnErrors: ["*"],
          defaultValue: {
            secretKey: "change-me-immediately"
          },
        },
      }
    }
  }
};
