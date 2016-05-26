modeule.exports = {
  user          : process.env.NODE_ORACLEDB_USER || "diasoft06",

  // Instead of hard coding the password, consider prompting for it,
  // passing it in an environment variable via process.env, or using
  // External Authentication.
  password      : process.env.NODE_ORACLEDB_PASSWORD || "diasoft06",

  // For information on connection strings see:
  // https://github.com/oracle/node-oracledb/blob/master/doc/api.md#connectionstrings
  connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING || "172.16.0.123/pdb1",

  // Setting externalAuth is optional.  It defaults to false.  See:
  // https://github.com/oracle/node-oracledb/blob/master/doc/api.md#extauth
  externalAuth  : process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false
};
