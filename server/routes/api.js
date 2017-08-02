var express = require('express');
var router = express.Router();
var data = require('../data/players.json');
var dbConn = require('./dbConn');
var mysql = require('mysql');
var http = require('http').Server(express);
var io = require('socket.io')(http);
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');
//var passportConfig = require('./auth.js');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));
router.use(cookieParser());
router.use(session({
    secret: 'hamboning',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: true}
}));
router.use(passport.initialize());
router.use(passport.session());

//API Listing
router.get('/', (req, res) => {
    res.send('API Running.');
});

router.get('/data', (req,res) => {
	res.send(data);
});

//gets all user info where userid = id;
router.get('/user', (req, res) => {
	
	var userid = req.query.userid;

	//check to see if params are there
	if(userid == undefined)
	{
		res.send('ERROR: NO USERID PARAMETER');
	}
	else
	{
		//base query 
		var inQuery = "SELECT * FROM USERS WHERE USERID = ?";

		//searches db for user with userid = id. 
		dbConn.queryDB(mysql.format(inQuery, userid), function(val, err){

			//if none was found return err message, otherwise JSONify data and return
			if(err) {
				res.send(val);
			}
			else {
				res.send('{"players": ' + JSON.stringify(val) + '}');
			}
		});
	}
});

//returns all relevant user info where userid = id
router.get('/userinfo', (req, res) => {
	
	var userid = req.query.userid;

	//check to see if params are there
	if(userid == undefined)
	{
		res.send('ERROR: NO USERID PARAMETER');
	}
	else
	{
		//gross query
		var inQuery = "SELECT USERID, DATE_JOINED, TIME_PLAYED, PROFILE_PIC, EMAIL_ADDR, SCENARIOID, TITLE,  TIME_PLAYED, QUESTIONID, PROMPT, ANSWERID, ANSWER" + 
		" FROM USERS NATURAL JOIN SCENARIOS NATURAL JOIN USER_SCENARIO_INFO NATURAL JOIN QUESTIONS NATURAL JOIN ANSWERS NATURAL JOIN USER_RESPONSES WHERE USERID = ?";
		
		//searches db to see if userid = id exists with game data.
		dbConn.queryDB(mysql.format(inQuery, userid), function(val, err){

			//if there was an error make sure it wasn't becasue the user just hasn't played a scenario
			if(err) {
				//new query for just relevant user data
				inQuery = "SELECT USERID, DATE_JOINED, PROFILE_PIC, EMAIL_ADDR FROM USERS WHERE USERID = ?";

				//query db; if there's still an error than either something bad hrouterened or no user has userid = id. otherwise return user data
				dbConn.queryDB(mysql.format(inQuery, userid), function(inVal, inErr){
					if(inErr) {
						res.send('no users found');
					}
					else {
						res.send('{ "players:"' + JSON.stringify(inVal) + "}");
					}

				})
			}
			//if there was no error JSONify the data and return it.
			else {
				dbConn.formatUserJSON(val, function(ret, err){
					if(!err) {
						res.send(ret);
					}
					else {
						res.send("ERROR: JSON-CONVERSION FAILED");
					}
				});
			}
		});

	}
	
});

//http://localhost:3000/api/multiuser?userid=["1","4","8"]
router.get('/multiuser', (req, res) => {

	if(req.query.userid == undefined)
	{
		res.send('ERROR: NO USERID PARAMETER');
	}
	else
	{
		var inQuery = 'SELECT * FROM USERS WHERE USERID = ';
		var arr = JSON.parse(req.query.userid);

		if(arr.length > 1)
		{
			var i = 0;
			for(i = 0; i < arr.length; i++)
			{
				inQuery += arr[i];
				if(i+1 < arr.length)
				{
					inQuery += ' OR USERID = ';
				}
			}
		}
		else if(arr.length == 1)
		{
			inQuery = 'SELECT * FROM USERS WHERE USERID = ';
			inQuery = mysql.format(inQuery, arr[0]);
		}
		else
		{
			res.send('ERROR: NO USERS SELECTED');
		}

		dbConn.queryDB(inQuery, function(val, err){
			if(err) {
				res.send(val);
			}
			else {
				//format accordingly
				res.send('{ "players":' + JSON.stringify(val) + "}");
			}
		});
	}
});

router.get('/scenario', (req, res) => {
	
	//base query
	var scenarioid = req.query.scenid;

	if(scenarioid == undefined)
	{
		res.send('ERROR: NO SCENARIOID PARAMETER');
	}
	else
	{
		var inQuery = "SELECT * FROM SCENARIOS WHERE SCENARIOID = ?";

		//searches db for user with userid = id. 
		dbConn.queryDB(mysql.format(inQuery, scenarioid), function(val, err){
			//if none was found return err message, otherwise JSONify data and return
			if(err) {
				res.send(val);
			}
			else {
				res.send('{"scenarios": ' + JSON.stringify(val) + '}');
			}
		});
	}
});

router.get('/scenarioscores', (req, res) => {

	var scenarioid = req.query.scenid;

	if(scenarioid == undefined)
	{
		res.send('ERROR: NO SCENARIOID PARAMETER')
	}
	else
	{
		var inQuery = 'SELECT USERID, USERNAME, SUM(SCORE) AS TOTAL_SCORE FROM USERS NATURAL JOIN USER_SCENARIO_INFO NATURAL JOIN USER_RESPONSES NATURAL JOIN QUESTIONS NATURAL JOIN ANSWERS WHERE SCENARIOID = ? GROUP BY USERID';
		dbConn.queryDB(mysql.format(inQuery, scenarioid), function(val, err){
			if(err) {
				res.send(val);
			}
			else {
				//format accordingly
				res.send(val);
			}
		});
	}
});

router.get('/scenarioresponses', (req, res) => {

	var scenarioid = req.query.scenid;

	if(scenarioid == undefined)
	{
		res.send('ERROR: NO SCENARIOID PARAMETER')
	}
	else
	{
		var inQuery = 'SELECT SCENARIOID, QUESTIONID, PROMPT, ANSWERID, ANSWER, COUNT(USERID) AS NUMRESPONCES FROM USERS NATURAL JOIN SCENARIOS NATURAL JOIN QUESTIONS NATURAL JOIN ANSWERS NATURAL JOIN USER_RESPONSES NATURAL JOIN USER_SCENARIO_INFO WHERE SCENARIOID = ? GROUP BY ANSWERID';
		dbConn.queryDB(mysql.format(inQuery, scenarioid), function(val, err){
			if(err) {
				res.send(val);
			}
			else {
				//format accordingly
				res.send(val);
			}
		});
	}
});

//inserts culture into the db
//https://stackoverflow.com/questions/14551194/how-are-parameters-sent-in-an-http-post-request if we have issues getting data
//using postman for now
router.post('/insertCulture', function(req, res){

	//get inserts
	var inserts = [req.body.LOCATION, req.body.MAIN_LANGUAGE];
	if(inserts[0] == undefined || inserts[1] == undefined)
	{
		res.send('ERR: MISSING PARAMETER');
	}
	else
	{
		//get query and combine the two
		var inQuery = "INSERT INTO CULTURES VALUES('0',?,?);";

		//insert the values into the db. 
		dbConn.queryDB(mysql.format(inQuery, inserts), function(val, err){

			if(err) {
				res.send(val);
			}
			else {
				res.send("successfully inserted culture into db");
			}
		});
	}
});

router.post('/insertUser', function(req, res){

	//get inserts
	var inserts = [req.body.USERNAME, req.body.FIRSTNAME, req.body.LASTNAME, req.body.EMAIL, 
				   req.body.PASSWORD, req.body.PROFILE_PIC, req.body.BIRTHDAY, '2017-07-19', '0'];

	if(inserts[0] == undefined || inserts[1] == undefined || inserts[2] == undefined || inserts[3] == undefined || inserts[4] == undefined || 
	   inserts[5] == undefined || inserts[6] == undefined || inserts[7] == undefined || inserts[8] == undefined)
	{
		res.send('ERROR: MISSING PARAMETER');
	}
	else
	{
		//get query and combine the two
		var inQuery = "INSERT INTO USERS VALUES('0',?,?,?,?,?,?,?,?,?);";

		//insert the values into the db. 
		dbConn.queryDB(mysql.format(inQuery, inserts), function(val, err){

			if(err)
			{
				res.send(val);
			}
			else
			{
				res.send("successfully inserted user into db");
			}
		});
	}
});

//Passport Configuration

passport.serializeUser(function(user,done){
		console.log(user + ' ' + JSON.stringify(user));
        done(null, user.USERID);
    });

passport.deserializeUser(function(id,done){
    dbConn.queryDB(mysql.format("SELECT * FROM USERS WHERE USERID = ?", id), function(rows,err){
        done(err,rows[0].USERID);
    });
});

passport.use(
	'local-signup',
	new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback : false
	},
	function(username, password, done){
		console.log("Processing signup...");

		dbConn.queryDBEmpty(mysql.format("SELECT * FROM USERS WHERE USERNAME = ?", username), function(rows,err){
			if(err){
				console.log(err);
				return done(null, false, "{message: error}");
			}
			if(rows.length > 0){
				return done(null, false, "{message: Username taken.}");
			}else{
				var newUser ={
					username: username,
					password: password
				};
				var inserts = [username, password];
				var insertQuery = "INSERT INTO USERS values (0,?,null,null,null,?,null,null,now(),0)";

				dbConn.queryDB(mysql.format(insertQuery,inserts), function(rows,err)
				{
					if(err)
					{
						console.log("cry");
					}
					else
					{
						dbConn.queryDB(mysql.format('SELECT USERID FROM USERS WHERE USERNAME = ?', inserts[0]), function(vals, err)
						{
							newUser.id = vals[0].USERID;
							return done(null, newUser);
						});
					}
				
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
		passReqToCallback : false
	},
	function(username, password, done){
		console.log("Processing login...");
		dbConn.queryDBEmpty(mysql.format("SELECT * FROM USERS WHERE USERNAME = ?", username), function(rows,err){
		if(err)
			return done(err);
		if(rows.length == 0)
		{
			console.log("Login: User not found.");
			return done(null, false, "Error: User not found.");
		}

		if(password.localeCompare(rows[0].PASSWORD) != 0){
			console.log("Login: Wrong pass.");
			return done(null, false, "Error: Incorrect password.");
		}
		return done(null, rows[0]);
		});
	})
);

//Passport Routes

router.post('/login',
	passport.authenticate('local-login'),
	function(req,res){
		res.send(req.user);
	}
);

router.get('/logout', function(req,res){
	req.logout();
	res.send("Logged out.");
});

router.post('/signup', 
	passport.authenticate('local-signup'),
	function(req,res){
		console.log("Signup successful.");
		res.send("Account successfully created.");
	}
);

module.exports = router;


/*
base get function
router.get('/path', (req, res) => {

	var inQuery = '';
	dbConn.queryDB(inQuery, function(val, err){
		if(err)
		{
			res.send(val);
		}
		else	
		{
			//format accordingly
			res.send(val);
		}
	});
});
*/

/*
base post function
router.post('/path', (req, res) => {
	//req.body.var

	var inQuery = '';

	dbConn.queryDB(inQuery, function(val, err){
		if(err)
		{
			res.send(val);
		}
		else	
		{
			//format accordingly
			res.send('successfully did the thing');
		}
	});


});
*/