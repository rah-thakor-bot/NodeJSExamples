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

// Http method: GET
// URI        : /userprofiles/:USER_NAME
// Read the profile of user given in :USER_NAME
app.get('/login', function (req, res) {
  "use strict";
  console.log('get\login for : ' + req.query.user_name);
  console.log(req.headers);
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

    connection.execute(
      "BEGIN pkg_user_security.prc_chk_user_pass(:p_user_id,:p_pass,:p_flg,:p_coid,:p_brid ,:p_comp_name,:p_br_name,:p_br_entity_id,:p_br_address,:p_is_utility_user,:p_is_Active,:p_temp_br_address); END;",
      [
        req.query.user_name,//'RLT',  // Bind type is determined from the data.  Default direction is BIND_IN
        req.query.password,//'RR',
        { type: oracledb.STRING, dir: oracledb.BIND_OUT },
        { type: oracledb.STRING, dir: oracledb.BIND_OUT },
        { type: oracledb.STRING, dir: oracledb.BIND_OUT },
        { type: oracledb.STRING, dir: oracledb.BIND_OUT },
        { type: oracledb.STRING, dir: oracledb.BIND_OUT },
        { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        { type: oracledb.STRING, dir: oracledb.BIND_OUT },
        { type: oracledb.STRING, dir: oracledb.BIND_OUT },
        { type: oracledb.STRING, dir: oracledb.BIND_OUT },
        { type: oracledb.STRING, dir: oracledb.BIND_OUT }
      ],
      { outFormat: oracledb.OBJECT },
      function (err, result)
      {
        if (err) {
          console.error(err.message);
          doRelease(connection);
          return;
        }
        console.log(result.outBinds);
        res.contentType('application/json').status(200).send(JSON.stringify(result.outBinds));
      });
    });
  });


  // Http method: GET
  // URI        : /userprofiles/:USER_NAME
  // Read the profile of user given in :USER_NAME
  app.get('/getProduction', function (req, res) {
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
      else {
        console.log('Connection Established');
        console.log('Get /getProduction for : ' + req.query.q);
        console.log(req.headers);
      }


      var qry = "select decode(grouping(pol_date), 1, 'total ', to_char(pol_date)) polish_date,"
                     + "count(*) total_pcs,"
                     + "round(sum(mkbl_cts / 100), 2) makable, "
                     + "round(sum(cts / 100), 2) polish, "
                     + "round(sum(cts / 100) / count(1), 2) cts_size, "
                     + "round(sum(pm.exp_stone_rate)) dollar "
                + "from pkt_mas pm "
               + "where to_char(pol_date, 'mmrrrr') = :month "
                  + "   and nvl(mkbl_cts, 0) > 0 "
                  + "   and nvl(pol_cts, 0) > 0 "
                  + "   and nvl(rej_cts, 0) = 0 "
                  + "   and pm.lotno not in "
                  + "       (select l.lotno "
                  + "          from lot_mas l "
                  + "         where l.sub_rgh_type in "
                  + "               (select r.rgh_type_id "
                  + "                  from rgh_type_mas r "
                  + "               where r.short_name in ('MS', 'JW', 'RC', 'DMKB'))) "
                  + " group by rollup(pol_date) "
                  + " order by 1";
      //console.log(qry);
      var bindvars = {
            month:  req.query.q  // Bind type is determined from the data.  Default direction is BIND_IN
          };
      connection.execute(qry,bindvars,
      {
        outFormat: oracledb.OBJECT // Return the result as Object
      }, function (err, result) {
        if (err || result.rows.length < 1) {
          res.set('Content-Type', 'application/json');
          var status = err ? 500 : 404;
          res.status(status).send(JSON.stringify({
            status: status,
            message: err,
            detailed_message: err ? err.message : ""
          }));
        } else {
          console.log(result.rows);
          res.contentType('application/json').status(200).send(JSON.stringify(result.rows));
        }
        // Release the connection
        connection.release(
          function (err) {
            if (err) {
              console.error(err.message);
            } else {
              console.log("GET /getProduction/" + req.query.q + " : Connection released");
            }
          });
        });
      });
    });

    function doRelease(connection)
    {
      connection.release(
        function(err)
        {
          if (err) { console.error(err.message); }
          else { console.log('Connection released');}
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

        var server = app.listen(4000, function () {
          "use strict";

          var host = server.address().address,
          port = server.address().port;

          console.log(' Server is listening at http://%s:%s', host, port);
        });
