var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var oracledb = require('oracledb');
var SimpleOracleDB = require('simple-oracledb');
//modify the original oracledb library
SimpleOracleDB.extend(oracledb);

// Use body parser to parse JSON body
app.use(bodyParser.json());

var connAttrs = {
  "user": "diasoft06",
  "password": "diasoft06",
  "connectString": "172.16.0.123/pdb1"
}

app.get('/getCompany', function (req, res) {
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
    var bindvars = { p_data:  { type: oracledb.CURSOR,
                                dir: oracledb.BIND_OUT
                              }
                   };

    var numRows = 1000;
    var jsonResult= 'empty';
    var stream = connection.query('SELECT * FROM menu_mas WHERE menu_id > :id order by menu_id', [110],
                                  { streamResults: true },
                                  function onResults(error, results) {
                                                                        if (error) { console.log(error); }
                                                                        else { res.contentType('application/json').status(200); console.log('Result Come');}
                                                                     });

    stream.on('data', function (results) {
                //use row object
                console.log(results);
             });
     //res.send(JSON.stringify(jsonResult));//Working
  })
});

var server = app.listen(5000, function () {
  "use strict";
  var host = server.address().address,
  port = server.address().port;

  console.log(' Server is listening at http://%s:%s', host, port);
});
