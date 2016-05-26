/*jslint node:true*/
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var oracledb = require('oracledb');


// Use body parser to parse JSON body
app.use(bodyParser.json());

var connAttrs = {
  "user": "diasoft06",
  "password": "diasoft06",
  "connectString": "172.16.0.123/pdb1"
}

app.get('/get_processes', function (req, res) {
  "use strict";

  oracledb.getConnection(connAttrs, function (err, connection) {
    if (err) {
      // Error connecting to DB
      res.set('Content-Type', 'application/json');
      res.status(500).send(JSON.stringify({
        status: 500,
        message: "Error connecting to DB",
        detailed_message: err.message
      }));
      return;
    }
    //Binding variables
    var bindvars = {
      p_data:  { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
    };
    var numRows = 1000;
    var jsonResult= 'empty';

    connection.execute("BEGIN pkg_com_utility.prc_fill_proc(:p_data); END;",
    bindvars,
    { outFormat: oracledb.OBJECT },
    function (err, result){
      if (err) {
        console.error(err.message);
        doRelease(connection);
     }
      res.contentType('application/json').status(200);
      fetchRowsFromRS(connection, result.outBinds.p_data, numRows,res);
    });

    function fetchRowsFromRS(connection, resultSet, numRows,res)
    {
      resultSet.getRows( // get numRows rows
        numRows,
        function (err, rows)
        {
          if (err) {
            console.error(err.message);
            doClose(connection, resultSet);
          } else if (rows.length == 0) {
            console.log('No rows or No more rows');
            doClose(connection, resultSet);
          } else if (rows.length > 0) {
            //console.log(rows);
            res.send(JSON.stringify(rows));
            fetchRowsFromRS(connection, resultSet, numRows,res);
          }
        });
      }
    });
  });

  function doRelease(connection)
  {
    connection.release(
      function(err)
      {
        if (err) { console.error(err.message); }
      });
    }

    function doClose(connection, resultSet)
    {
      resultSet.close(
        function(err)
        {
          if (err) { console.error(err.message); }
          doRelease(connection);
        });
      }

      var server = app.listen(5000, function () {
        "use strict";

        var host = server.address().address,
        port = server.address().port;

        console.log(' Server is listening at http://%s:%s', host, port);
      });
