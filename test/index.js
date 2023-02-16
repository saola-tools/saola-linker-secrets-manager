module.exports = {
  getSecretIdOf: function(secretName) {
    const namespace = process.env.SECRET_NAMESPACE || "example";
    return ["beta"].concat(namespace, secretName).join("/");
  },
  isCloudSetup: function() {
    return process.env.SECRET_NAMESPACE && true || false;
  }
};
