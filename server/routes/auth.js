//Passport Dependencies
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var dbConn = require('./dbConn.js');

module.exports = function(passport){
    passport.serializeUser(function(user,done){
        done(null, user.id)
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

                    var insertQuery = "INSERT INTO USERS (username, password) values (?,?)";

                    dbConn().queryDB(insertQuery, function(rows,err)
                    {
                        newUser.id = rows.insertId;
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
            dbConn().queryDB("SELECT * FROM USERS WHERE USERNAME =?",[username], function(rows,err){
            if(err)
                return done(err);
            if(!rows.length)
            {
                return done(null, false, req.flash('loginMessage', 'No user found.'));
            }

            if(password.localeCompare(rows[0].password))
                return done(null, false, req.flash('loginMessage', 'Incorrect password.'));
            
            return done(null, rows[0]);
        });
    })
    );
};