# test/app

## Prerequisites

Configure the AWS CLI with your credentials:

```
aws configure
```

Create an IAM policy that grants access to only the getSecret operation in Secrets Manager:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "GetSecretsPolicy",
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetSecretValue"
            ],
            "Resource": "*"
        }
    ]
}
```

Create a new IAM user and assign the policy you just created to it:

```
aws iam create-user --user-name my_secrets_app
aws iam put-user-policy --user-name my_secrets_app \
--policy-name GetSecretsPolicy \
--policy-document file://get_secrets_policy.json
```

Obtain the access key ID and secret access key for the new user:

```
aws iam create-access-key --user-name my_secrets_app
```

This will return a JSON output containing the access key ID and secret access key, similar to the following:

```
{
    "AccessKey": {
        "UserName": "my_secrets_app",
        "Status": "Active",
        "CreateDate": "2022-01-01T01:00:00Z",
        "SecretAccessKey": "SECRET_ACCESS_KEY",
        "AccessKeyId": "ACCESS_KEY_ID"
    }
}
```

Use the access key ID and secret access key in your Node.js app to access Secrets Manager:

```
const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: "ACCESS_KEY_ID",
  secretAccessKey: "SECRET_ACCESS_KEY",
  region: "us-west-2" // Replace with the desired region
});

const client = new AWS.SecretsManager();
```

## Usage

### Run

```shell
export DEBUG=framework*,app*
export LOGOLITE_DEBUGLOG_ENABLED=true
node test/app
```
