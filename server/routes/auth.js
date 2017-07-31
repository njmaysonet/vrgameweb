//Passport Dependencies
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var dbConn = require('./dbConn.js');
var mysql = require('mysql');

module.exports = function(passport){
    passport.serializeUser(function(user,done){
        done(null, user.USERID);
    });

    passport.deserializeUser(function(id,done){
        dbConn.queryDB("SELECT * FROM USERS WHERE USERID = ?",[id],function(rows,err){
            done(err,rows[0]);
        });
    });

    passport.use(
        'local-signup',
        new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback : true
        },
        function(req, username, password, done){
            dbConn.queryDB("SELECT * FROM USERS WHERE USERNAME = ?",[username], function(rows,err){
                if(err)
                    return done(err);
                if(rows.length){
                    return done(null, false, "Username taken.");
                }else{
                    var newUser ={
                        username: username,
                        password: password
                    };

                    var insertQuery = "INSERT INTO USERS values (0,?,null,null,null,?,?,?,now(),0)";

                    dbConn().queryDB(mysql.format(insertQuery,newUser), function(rows,err)
                    {
                        newUser.id = rows[0].USERID;
                        return done(null, newUser);
                    });
            }
        })
    })
);

    passport.use(
        'local-login',
        new LocalStrategy({
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, username, password, done){
            username = req.body.username;
            password = req.body.password;
            res.send("Entered.");
            dbConn().queryDB("SELECT * FROM USERS WHERE USERNAME =?",[username], function(rows,err){
            if(err)
                return done(err);
            if(!rows.length)
            {
                return done(null, false, res.json("Error: User not found."));
            }

            if(password.localeCompare(rows[0].PASSWORD))
                return done(null, false, res.json("Error: Incorrect password."));
            
            return done(null, rows[0]);
        });
    })
    );
};