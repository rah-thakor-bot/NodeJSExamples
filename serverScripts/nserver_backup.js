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

// Http Method: GET
// URI        : /user_profiles
// Read all the user profiles
app.get('/user_profiles', function (req, res) {
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

        connection.execute("SELECT * FROM menu_mas", {}, {
            outFormat: oracledb.OBJECT // Return the result as Object
        }, function (err, result) {
            if (err) {
                res.set('Content-Type', 'application/json');
                res.status(500).send(JSON.stringify({
                    status: 500,
                    message: "Error getting the user profile",
                    detailed_message: err.message
                }));
            } else {
                res.contentType('application/json').status(200);
                res.send(JSON.stringify(result.rows));
            }
            // Release the connection
            connection.release(
                function (err) {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log("GET /user_profiles : Connection released");
                    }
                });
        });
    });
});

// Http method: GET
// URI        : /userprofiles/:USER_NAME
// Read the profile of user given in :USER_NAME
app.get('/user_profiles/:menu_id', function (req, res) {
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
/*
        :p_user_id,
        :p_pass,
        :p_flg ,
        :p_coid ,
        :p_brid ,
        :p_comp_name,
        :p_br_name,
        :p_br_entity_id,
        :p_br_address out,
        :p_is_utility_user,
        :p_is_Active,
        :p_temp_br_address);
*/
        //Binding variables
        var bindvars = {
              p_user_id:  'RLT',  // Bind type is determined from the data.  Default direction is BIND_IN
              p_pass:  'RR',
              p_flg:  { type: oracledb.STRING, dir: oracledb.BIND_OUT },
              p_coid:  { type: oracledb.STRING, dir: oracledb.BIND_OUT },
              p_brid:  { type: oracledb.STRING, dir: oracledb.BIND_OUT },
              p_comp_name:  { type: oracledb.STRING, dir: oracledb.BIND_OUT },
              p_br_name:  { type: oracledb.STRING, dir: oracledb.BIND_OUT },
              p_br_entity_id:  { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
              p_is_utility_user:  { type: oracledb.STRING, dir: oracledb.BIND_OUT },
              p_is_Active: { type: oracledb.STRING: oracledb.BIND_INOUT },
              p_flg:  { type: oracledb.STRING, dir: oracledb.BIND_OUT }
            };

        connection.execute(
          "BEGIN pkg_user_security.prc_chk_user_pass(:p_user_id,:p_pass,:p_flg ,:p_coid ,:p_brid ,:p_comp_name,:p_br_name,:p_br_entity_id,:p_br_address out,:p_is_utility_user,:p_is_Active,:p_temp_br_address); END;",
          bindvars,
          function (err, result)
          {
            if (err) { console.error(err.message); return; }
            console.log(result.outBinds);
          });

        // connection.execute("SELECT * FROM menu_mas WHERE menu_id = :menu_id", [req.params.menu_id], {
        //     outFormat: oracledb.OBJECT // Return the result as Object
        // }, function (err, result) {
        //     if (err || result.rows.length < 1) {
        //         res.set('Content-Type', 'application/json');
        //         var status = err ? 500 : 404;
        //         res.status(status).send(JSON.stringify({
        //             status: status,
        //             message: err ? "Error getting the user profile" : "User doesn't exist",
        //             detailed_message: err ? err.message : ""
        //         }));
        //     } else {
        //         res.contentType('application/json').status(200).send(JSON.stringify(result.rows));
        //     }
        //     // Release the connection
        //     connection.release(
        //         function (err) {
        //             if (err) {
        //                 console.error(err.message);
        //             } else {
        //                 console.log("GET /user_profiles/" + req.params.USER_NAME + " : Connection released");
        //             }
        //         });
        // });
    });
});

app.get('/login', function (req, res) {
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

        connection.execute("SELECT COUNT(*) FROM user_mas WHERE user_id = 'RLT' and user_pass = 'RR'",
                            [], //Parameter Binding
                            {
                              outFormat: oracledb.OBJECT // Return the result as Object
                            }, //Output format
                            function (err, result) {
                                if (err || result.rows.length < 1) {
                                    res.set('Content-Type', 'application/json');
                                    var status = err ? 500 : 404;
                                    res.status(status).send(JSON.stringify({
                                        status: status,
                                        message: err ? "Error getting the user profile" : "User doesn't exist",
                                        detailed_message: err ? err.message : ""
                                    }));
                                } else {
                                    res.contentType('application/json').status(200).send(JSON.stringify(result.rows));
                                }
                                // Release the connection
                                connection.release(
                                    function (err) {
                                        if (err) {
                                            console.error(err.message);
                                        } else {
                                            console.log("GET /login" + req.params.user_id + " : Connection released");
                                        }
                                    });
                            });//Middleware work
    });
});


// Http method: POST
// URI        : /user_profiles
// Creates a new user profile
app.post('/login', function (req, res) {
    "use strict";
    if ("application/json" !== req.get('Content-Type')) {
        res.set('Content-Type', 'application/json').status(415).send(JSON.stringify({
            status: 415,
            message: "Wrong content-type. Only application/json is supported",
            detailed_message: null
        }));
        return;
    }
    oracledb.getConnection(connAttrs, function (err, connection) {
        if (err) {
            // Error connecting to DB
            res.set('Content-Type', 'application/json').status(500).send(JSON.stringify({
                status: 500,
                message: "Error connecting to DB",
                detailed_message: err.message
            }));
            return;
        }
        connection.execute("INSERT INTO user_profiles VALUES " +
            "(:USER_NAME, :DISPLAY_NAME, :DESCRIPTION, :GENDER," +
            ":AGE, :COUNTRY, :THEME) ", [req.body.USER_NAME, req.body.DISPLAY_NAME,
                            req.body.DESCRIPTION, req.body.GENDER, req.body.AGE, req.body.COUNTRY,
                            req.body.THEME], {
                autoCommit: true,
                outFormat: oracledb.OBJECT // Return the result as Object
            },
            function (err, result) {
                if (err) {
                    // Error
                    res.set('Content-Type', 'application/json');
                    res.status(400).send(JSON.stringify({
                        status: 400,
                        message: err.message.indexOf("ORA-00001") > -1 ? "User already exists" : "Input Error",
                        detailed_message: err.message
                    }));
                } else {
                    // Successfully created the resource
                    res.status(201).set('Location', '/user_profiles/' + req.body.USER_NAME).end();
                }
                // Release the connection
                connection.release(
                    function (err) {
                        if (err) {
                            console.error(err.message);
                        } else {
                            console.log("POST /user_profiles : Connection released");
                        }
                    });
            });
    });
});

// Build UPDATE statement and prepare bind variables
var buildUpdateStatement = function buildUpdateStatement(req) {
    "use strict";

    var statement = "",
        bindValues = {};
    if (req.body.DISPLAY_NAME) {
        statement += "DISPLAY_NAME = :DISPLAY_NAME";
        bindValues.DISPLAY_NAME = req.body.DISPLAY_NAME;
    }
    if (req.body.DESCRIPTION) {
        if (statement) statement = statement + ", ";
        statement += "DESCRIPTION = :DESCRIPTION";
        bindValues.DESCRIPTION = req.body.DESCRIPTION;
    }
    if (req.body.GENDER) {
        if (statement) statement = statement + ", ";
        statement += "GENDER = :GENDER";
        bindValues.GENDER = req.body.GENDER;
    }
    if (req.body.AGE) {
        if (statement) statement = statement + ", ";
        statement += "AGE = :AGE";
        bindValues.AGE = req.body.AGE;
    }
    if (req.body.COUNTRY) {
        if (statement) statement = statement + ", ";
        statement += "COUNTRY = :COUNTRY";
        bindValues.COUNTRY = req.body.COUNTRY;
    }
    if (req.body.THEME) {
        if (statement) statement = statement + ", ";
        statement += "THEME = :THEME";
        bindValues.THEME = req.body.THEME;
    }

    statement += " WHERE USER_NAME = :USER_NAME";
    bindValues.USER_NAME = req.params.USER_NAME;
    statement = "UPDATE USER_PROFILES SET " + statement;

    return {
        statement: statement,
        bindValues: bindValues
    };
};

// Http method: PUT
// URI        : /user_profiles/:USER_NAME
// Update the profile of user given in :USER_NAME
app.put('/user_profiles/:USER_NAME', function (req, res) {
    "use strict";

    if ("application/json" !== req.get('Content-Type')) {
        res.set('Content-Type', 'application/json').status(415).send(JSON.stringify({
            status: 415,
            message: "Wrong content-type. Only application/json is supported",
            detailed_message: null
        }));
        return;
    }

    oracledb.getConnection(connAttrs, function (err, connection) {
        if (err) {
            // Error connecting to DB
            res.set('Content-Type', 'application/json').status(500).send(JSON.stringify({
                status: 500,
                message: "Error connecting to DB",
                detailed_message: err.message
            }));
            return;
        }

        var updateStatement = buildUpdateStatement(req);
        connection.execute(updateStatement.statement, updateStatement.bindValues, {
                autoCommit: true,
                outFormat: oracledb.OBJECT // Return the result as Object
            },
            function (err, result) {
                if (err || result.rowsAffected === 0) {
                    // Error
                    res.set('Content-Type', 'application/json');
                    res.status(400).send(JSON.stringify({
                        status: 400,
                        message: err ? "Input Error" : "User doesn't exist",
                        detailed_message: err ? err.message : ""
                    }));
                } else {
                    // Resource successfully updated. Sending an empty response body.
                    res.status(204).end();
                }
                // Release the connection
                connection.release(
                    function (err) {
                        if (err) {
                            console.error(err.message);
                        } else {
                            console.log("PUT /user_profiles/" + req.params.USER_NAME + " : Connection released ");
                        }
                    });
            });
    });
});

// Http method: DELETE
// URI        : /userprofiles/:USER_NAME
// Delete the profile of user given in :USER_NAME
app.delete('/user_profiles/:USER_NAME', function (req, res) {
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

        connection.execute("DELETE FROM USER_PROFILES WHERE USER_NAME = :USER_NAME", [req.params.USER_NAME], {
            autoCommit: true,
            outFormat: oracledb.OBJECT
        }, function (err, result) {
            if (err || result.rowsAffected === 0) {
                // Error
                res.set('Content-Type', 'application/json');
                res.status(400).send(JSON.stringify({
                    status: 400,
                    message: err ? "Input Error" : "User doesn't exist",
                    detailed_message: err ? err.message : ""
                }));
            } else {
                // Resource successfully deleted. Sending an empty response body.
                res.status(204).end();
            }
            // Release the connection
            connection.release(
                function (err) {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log("DELETE /user_profiles/" + req.params.USER_NAME + " : Connection released");
                    }
                });

        });
    });
});

var server = app.listen(4000, function () {
    "use strict";

    var host = server.address().address,
        port = server.address().port;

    console.log(' Server is listening at http://%s:%s', host, port);
});
