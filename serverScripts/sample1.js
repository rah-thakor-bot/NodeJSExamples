var oracledb = require('oracledb');

oracledb.getConnection(
  {
    user          : "diasoft06",
    password      : "diasoft06",
    connectString : "172.16.0.123/pdb1"
  },
  function(err, connection)
  {
    if (err) { console.error(err.message); return; }

    connection.execute(
      "SELECT * " +
        "FROM menu_mas " +
        "WHERE menu_id = :id",[534],
      function(err, result)
      {
        if (err) { console.error(err.message); return; }
        console.log(result.rows);
      });
  });
