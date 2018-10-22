/*
   Routes file used for API endpoint
   Buisness logic for each endpoint 
*/

var express = require('express');
var router = express.Router();

/*  
    API DOCUMENTATION : https://docs.google.com/spreadsheets/d/1WTLrAxsa7oFJMgAXAi5Blz2WA_kjjX88YbA0_XZrwB0/edit#gid=1554877026
*/


// Delete a user from database
router.delete("/", async function (req, res) {
    try {
        var userId = req.user.sub;

        if (typeof userId === "undefined") {
            res.send(400, "Missing body elements");
        } else {

            var userSchema = require('./userSchema');
            var response = await userSchema.findOne({
                'userId': userId
            });

            if (response != null) {
                await response.delete();
                res.send(200, "Delete O.K.");
            }
            res.send(400, "Not found");
        }
    } catch (err) {
        res.send(err.statusCode);
    }
});


// Fetches user info from database
router.get("/", async function (req, res) {
    try {
        var userId = req.user.sub;
        if (typeof userId === "undefined") {
            res.send(400, "Query parameter empty");
        } else {
            var userSchema = require('./userSchema');
            var query = userSchema.findOne({
                'userId': userId
            });
            console.log(`Fetching user info for ${userId}`)
            query.select('userId userName linodeKey proxyUsername proxyPassword googleUri');
            query.exec(function (err, result) {
                res.send(result);
            });
        }
    } catch (err) {
        res.send(400, err);
    }
});


// Creates user entry into database
router.post("/", async function (req, res) {
    try {
        var userId = req.user.sub;
        if (typeof userId === "undefined") {
            res.send(400, "userId must be defined");
        } else {
            var userName = req.body.userName == "undefined" ? "" : req.body.userName;
            var linodeKey = req.body.linodeKey == "undefined" ? "" : req.body.linodeKey;
            var proxyUsername = req.body.proxyUsername == "undefined" ? "" : req.body.proxyUsername;
            var proxyPassword = req.body.proxyPassword == "undefined" ? "" : req.body.proxyPassword;
            var googleUri = req.body.googleUri == "undefined" ? "" : req.body.googleUri;

            var userSchema = require('./userSchema');
            var query = new userSchema({
                '_id': userId,
                'userId': userId,
                'userName': userName,
                'linodeKey': linodeKey,
                'proxyUsername': proxyUsername,
                'proxyPassword': proxyPassword,
                'googleUri': googleUri
            });
            await query.save(async function (err) {
                if (err && err.code === 11000) {
                    var userSchema = require('./userSchema');
                    Object.assign(userSchema, req.body);
                    await userSchema.updateOne(
                        { 'userId': userId },
                        { $set: req.body },
                        function (err, rawResponse) {
                            if (err) throw err;
                            if (rawResponse.n == 0) {
                                res.send(200, "User already exists, no new values to update values");
                            } else {
                                res.send(200, "User already exists, updated user values.");
                            }
                        }
                    );
                } else {
                    res.send(200, "User added successfully!");
                }
            });
        }
    } catch (err) {
        res.send(400, err);
    }
});


// Updates one or more user property
router.patch("/", async function (req, res) {
    try {
        var userId = req.user.sub;
        if (typeof userId === "undefined") {
            res.send(400, "userId must be defined");
        } else {

            var userSchema = require('./userSchema');
            Object.assign(userSchema, req.body);
            await userSchema.updateOne(
                { 'userId': userId },
                { $set: req.body },
                function (err, rawResponse) {
                    if (err) throw err;
                    if (rawResponse.n == 0) {
                        res.send(400, "no values updated")
                    } else {
                        res.send(200, "success");
                    }
                }
            );
        }
    } catch (err) {
        res.send(400, err);
    }
})


// Updates all user properties
router.put("/", function (req, res) {
    try {
        res.send("will be implemented");
    } catch (err) {
        res.send(400, err);
    }
});


// Fetches all proxies on database
router.get("/all/proxies", function (req, res) {
    try {
        var proxySchema = require('./proxySchema');
        var query = proxySchema.find();
        console.log(`Fetching all proxies`)
        query.select('userId proxy region instanceId server');
        query.exec(function (err, result) {
            if (err) throw err;
            res.send(result);
        });
    } catch (err) {
        send(400, 'failed to fetch all proxies')
    }
});


module.exports = router;