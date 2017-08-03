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
	if(userid == undefined && username == undefined)
	{
		res.send('ERROR: MISSING PARAMETERS');
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

//gets userid for the game. can check via email or username
router.get('/gameuser', (req, res) =>{

	var userData;
	var inQuery;

	//sees if username and/or email are defined. If one is query on it, otherwise err.
	if(req.query.username == undefined || req.query.password == undefined)
	{
		res.send('ERROR: MISSING PARAMETERS');
	}
		userData = [req.query.username, req.query.password];
		inQuery = "SELECT USERID FROM USERS WHERE USERNAME = ? AND PASSWORD = ?";

	
	//query db for the userid. returns an integer.
	dbConn.queryDB(mysql.format(inQuery, userData), function(val, err){
		if(err) {
			res.send(null);
		}
		else {

			res.send(JSON.stringify(val[0].USERID));
			
		}
		
	});

});


//returns all relevant user info where userid = id
router.get('/userinfo', (req, res) => {
	
	var username = req.query.username;

	//check to see if params are there
	if(username == undefined)
	{
		res.send('ERROR: NO USERID PARAMETER');
	}
	else
	{
		//gross query
		inQuery = "SELECT USERID, USERNAME, FIRSTNAME, LASTNAME, DATE_JOINED, SCORE, REASONING, TIME_COMPLETE, PROFILE_PIC, EMAIL_ADDR, SCENARIOID, TITLE,  TIME_PLAYED, QUESTIONID, PROMPT, ANSWERID, ANSWER" + 
				" FROM USERS NATURAL JOIN SCENARIOS NATURAL JOIN USER_SCENARIO_INFO NATURAL JOIN QUESTIONS NATURAL JOIN ANSWERS NATURAL JOIN USER_RESPONSES WHERE USERNAME = ?";
		
		//searches db to see if userid = id exists with game data.
		dbConn.queryDB(mysql.format(inQuery, username), function(val, err){

			//if there was an error make sure it wasn't becasue the user just hasn't played a scenario
			if(err) {
				//new query for just relevant user data
				inQuery = "SELECT USERID, DATE_JOINED, PROFILE_PIC, EMAIL_ADDR FROM USERS WHERE USERNAME = ?";

				//query db; if there's still an error than either something bad hrouterened or no user has userid = id. otherwise return user data
				dbConn.queryDB(mysql.format(inQuery, username), function(inVal, inErr){
					if(inErr) {
						res.send('no users found');
					}
					else {
						res.send('{ "players":' + JSON.stringify(inVal) + "}");
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

	var inQuery = 'SELECT * FROM USERS WHERE';
	var arr = [];

	//verifies that it was sent data
	if(req.query.userid == undefined && req.query.username)
	{
		res.send('ERROR: MISSING PARAMETERS');
	}
	else if(req.query.userid == undefined)
	{
		arr = JSON.parse(req.query.username);

		inQuery += ' USERNAME = ?';

		if(arr.length > 1)
		{
			var i = 0;
			for(i = 0; i < arr.length; i++)
			{
				if(i < arr.length)
				{
					inQuery += ' OR USERNAME = ?';
				}
			}
		}
	}
	else
	{
		//converts the array of id's into an actual array for JS.
		arr = JSON.parse(req.query.userid);

		inQuery += ' USERID = ?';

		//if we were sent data, build a query that searches for each index.
		if(arr.length > 1)
		{
			for(var i = 1; i < arr.length; i++)
			{
				if(i < arr.length)
				{
					inQuery += ' OR USERID = ?';
				}
			}
		}
		
	}

		dbConn.queryDB(inQuery, function(val, err){
			if(err) {
				res.send(val);
			}
			else {
				//format accordingly
				var users = [];
				inQuery = "SELECT USERID, USERNAME, FIRSTNAME, LASTNAME, DATE_JOINED, SCORE, REASONING, TIME_COMPLETE, PROFILE_PIC, EMAIL_ADDR, SCENARIOID, TITLE,  TIME_PLAYED, QUESTIONID, PROMPT, ANSWERID, ANSWER" + 
				" FROM USERS NATURAL JOIN SCENARIOS NATURAL JOIN USER_SCENARIO_INFO NATURAL JOIN QUESTIONS NATURAL JOIN ANSWERS NATURAL JOIN USER_RESPONSES WHERE USERID = ?";
		
				users.push(val[0].USERID);
				
				for(var i = 1; i < val.length; i++)
				{
					inQuery += ' OR USERID = ?'
					users.push(val[i].USERID);
				}

				dbConn.queryDB(mysql.format(inQuery, users), function(val2, err){
				
					if(!err)
					{
						dbConn.formatUserJSON(val2, function(ret, err){
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
	
});

router.get('/scenario', (req, res) => {
	
	//base query
	var scenarioid = req.query.scenid;

	if(scenarioid == undefined)
	{
		res.send('ERROR: MISSING PARAMETERS');
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
		res.send('ERROR: MISSING PARAMETERS');
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
		res.send('ERROR: MISSING PARAMETERS');
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

//gets each member in a given group
router.get('/getgroupmembers', (req, res) => {

	//gets a group id.
	var inserts = req.query.groupid;

	if(inserts == undefined)
	{
		res.send('ERR: MISSING PARAMETERS');
	}
	else
	{
		//query; gets the userid from each user in a given group with the stated groupid
		var inQuery = 'SELECT USERID, USERNAME FROM GROUPS NATURAL JOIN GROUP_MEMBERS NATURAL JOIN USERS WHERE GROUPID = ?';

		dbConn.queryDB(mysql.format(inQuery, inserts), function(val, err){
			
			if(err) {
				res.send(val);
			}
			else {
				res.send('{ "players:"' + JSON.stringify(val) + "}");
			}
		});
	}
})

//gets the number of times each answer was selected in a given group
router.get('/groupresponses', (req, res) => {

	//gets both the scenario's id as well as the group we're searching for
	var inserts = [req.query.scenid, req.query.groupid];
	//query, see line 261 for breakdown. Same thing but now adds groups
	var inQuery = 'SELECT SCENARIOID, TITLE, QUESTIONID, PROMPT, ANSWERID, ANSWER, SCORE, COUNT(USERID) AS NUMRESPONCES FROM USERS NATURAL JOIN SCENARIOS NATURAL JOIN QUESTIONS NATURAL JOIN ANSWERS NATURAL JOIN USER_RESPONSES NATURAL JOIN USER_SCENARIO_INFO NATURAL JOIN GROUPS  NATURAL JOIN GROUP_MEMBERS WHERE SCENARIOID = ? AND MOST_RECENT = 1 AND GROUPID = ? GROUP BY GROUPID, SCENARIOID, QUESTIONID, ANSWERID'

	//verifies that both parameters were passed in
	if(inserts[0] == undefined || inserts[1] == undefined)
	{
		res.send('ERROR: MISSING PARAMETERS');
	}
	else
	{
		//queries the db
		dbConn.queryDB(mysql.format(inQuery, inserts), function(val, err){
			if(err) {
				res.send(val);
			}
			else {
				dbConn.formatScenarioJSON(val, function(str, err){
					if(!err)
						res.send(str);
				});
			}
		});
	}
});

//gets the scores for members in a specific group in a specific scenario
router.get('/groupscores', (req, res) => {

	//gets the params
	var inserts = [req.query.scenid, req.query.groupid, req.query.savedata];

	//checks to make sure all of the params were sent
	if(inserts[0] == undefined || inserts[1] == undefined)
	{
		res.send('ERROR: MISSING PARAMETERS');
	}
	else
	{
		//query; see line 230 for full details. Adds group functionality.
		var inQuery = 'SELECT USERID, SCENARIOID, SUM(SCORE) AS USER_SCORE, MAX_SCORE FROM USERS NATURAL JOIN USER_SCENARIO_INFO NATURAL JOIN USER_RESPONSES NATURAL JOIN SCENARIOS NATURAL JOIN QUESTIONS NATURAL JOIN ANSWERS NATURAL JOIN GROUP_MEMBERS WHERE SCENARIOID = ? AND GROUPID = ? AND MOST_RECENT = 1 GROUP BY USERID';
		
		//queries db
		dbConn.queryDB(mysql.format(inQuery, inserts), function(val, err){
			if(err) {
				res.send(val);
			}
			else {
				//format accordingly
				res.send('{ "players:"' + JSON.stringify(val) + "}");
			}
		});
	}
});

router.get('/groupexceldata', (req, res) => {
	var groups = [], scenarios = [], inserts = [];
	var inQuery = '';
	var responsesQuery = '';
	var userQuery = '';

	//checks to make sure we have both groups and scenarios to query
	if(req.query.groups == undefined || req.query.scenarios == undefined)
	{
		res.send('ERROR: MISSING PARAMETERS');
	}
	else
	{
		//parse the groups and scenarios
		groups = JSON.parse(req.query.groups);
		scenarios = JSON.parse(req.query.scenarios);

		//if we have multiple scenarios and groups, pepare the query by grouping the two together; should be the one used most of the time
		if(scenarios.length > 1 && groups.length == scenarios.length)
		{
			//inQuery: get's the user's score and other important data
			inQuery = 'SELECT USERNAME, USERID, FIRSTNAME, LASTNAME, TIME_COMPLETE, TIME_PLAYED, SCENARIOID, TITLE, SUM(SCORE) AS USER_SCORE, MAX_SCORE, GROUPID, GROUP_NAME FROM USERS NATURAL JOIN USER_SCENARIO_INFO NATURAL JOIN USER_RESPONSES NATURAL JOIN SCENARIOS NATURAL JOIN QUESTIONS NATURAL JOIN ANSWERS NATURAL JOIN GROUPS NATURAL JOIN GROUP_MEMBERS WHERE ((SCENARIOID = ? AND GROUPID = ?)';
			//responsesQuery: gets the number of times an answer was selected + question info
			responsesQuery = 'SELECT SCENARIOID, QUESTIONID, PROMPT, ANSWERID, ANSWER, SCORE, COUNT(USERID) AS NUMRESPONCES, GROUPID, GROUP_NAME FROM USERS NATURAL JOIN SCENARIOS NATURAL JOIN QUESTIONS NATURAL JOIN ANSWERS NATURAL JOIN USER_RESPONSES NATURAL JOIN USER_SCENARIO_INFO NATURAL JOIN GROUPS NATURAL JOIN GROUP_MEMBERS WHERE ((SCENARIOID = ? AND GROUPID = ?)';
			//userQuery: gets all of the user's data, including each answer they selected
			userQuery = 'SELECT USERNAME, USERID, FIRSTNAME, LASTNAME, TIME_COMPLETE, TIME_PLAYED, SCENARIOID, TITLE, QUESTIONID, PROMPT, ANSWERID, ANSWER, SCORE, GROUPID, GROUP_NAME FROM USERS NATURAL JOIN USER_SCENARIO_INFO NATURAL JOIN USER_RESPONSES NATURAL JOIN SCENARIOS NATURAL JOIN QUESTIONS NATURAL JOIN ANSWERS NATURAL JOIN GROUPS NATURAL JOIN GROUP_MEMBERS WHERE ((SCENARIOID = ? AND GROUPID = ?)';
			
			//push the initial scenario and group
			inserts.push(scenarios[0]);
			inserts.push(groups[0]);

			//for each additional group and scenario, add a point to insert the values into each query as well as add the id's to inserts
			for(var i = 1; i < groups.length; i++)
			{
				inQuery += ' OR (SCENARIOID = ? AND GROUPID = ?)';
				userQuery += ' OR (SCENARIOID = ? AND GROUPID = ?)';
				responsesQuery += ' OR (SCENARIOID = ? AND GROUPID = ?)';
				inserts.push(scenarios[i]);
				inserts.push(groups[i]);
			}

			//finish the queries
			inQuery += ') AND MOST_RECENT = 1 GROUP BY GROUPID, SCENARIOID, USERID';
		    userQuery += ') AND MOST_RECENT = 1 ORDER BY GROUPID, SCENARIOID, USERID, QUESTIONID, ANSWERID';
			responsesQuery += ') AND MOST_RECENT = 1 GROUP BY GROUPID, SCENARIOID, QUESTIONID, ANSWERID';
			
		}
		//otherwise if we only have one scenario, query on the one scenario for each group
		else
		{
			//same as above, just slightly different queries
			inQuery = 'SELECT USERNAME, USERID, FIRSTNAME, LASTNAME, TIME_COMPLETE, TIME_PLAYED, SCENARIOID, TITLE, SUM(SCORE) AS USER_SCORE, MAX_SCORE, GROUPID, GROUP_NAME FROM USERS NATURAL JOIN USER_SCENARIO_INFO NATURAL JOIN USER_RESPONSES NATURAL JOIN SCENARIOS NATURAL JOIN QUESTIONS NATURAL JOIN ANSWERS NATURAL JOIN GROUPS NATURAL JOIN GROUP_MEMBERS WHERE SCENARIOID = ? AND (GROUPID = ?';
			responsesQuery = 'SELECT SCENARIOID, QUESTIONID, PROMPT, ANSWERID, ANSWER, SCORE, COUNT(USERID) AS NUMRESPONCES, GROUPID, GROUP_NAME FROM USERS NATURAL JOIN SCENARIOS NATURAL JOIN QUESTIONS NATURAL JOIN ANSWERS NATURAL JOIN USER_RESPONSES NATURAL JOIN USER_SCENARIO_INFO NATURAL JOIN GROUPS NATURAL JOIN GROUP_MEMBERS WHERE SCENARIOID = ? AND (GROUPID = ?';
			userQuery = 'SELECT USERNAME, USERID, FIRSTNAME, LASTNAME, TIME_COMPLETE, TIME_PLAYED, SCENARIOID, TITLE, MAX_SCORE, GROUPID, GROUP_NAME FROM USERS NATURAL JOIN USER_SCENARIO_INFO NATURAL JOIN USER_RESPONSES NATURAL JOIN SCENARIOS NATURAL JOIN QUESTIONS NATURAL JOIN ANSWERS NATURAL JOIN GROUPS NATURAL JOIN GROUP_MEMBERS WHERE SCENARIOID = ? AND (GROUPID = ?';
			inserts.push(scenarios[0]);
			inserts.push(groups[0]);

			for(var i = 1; i < groups.length; i++)
			{
				inQuery += ' OR GROUPID = ?';
				userQuery += ' OR GROUPID = ?';
				responsesQuery += ' OR GROUPID = ?';
				inserts.push(groups[i]);

			}

			inQuery += ') AND MOST_RECENT = 1 GROUP BY GROUPID, SCENARIOID, USERID';
			userQuery += ') AND MOST_RECENT = 1 ORDER BY GROUPID, SCENARIOID, USERID, QUESTIONID, ANSWERID';
			responsesQuery += ') AND MOST_RECENT = 1 GROUP BY GROUPID, SCENARIOID, QUESTIONID, ANSWERID';
		}

		//query for the user scores and data
		dbConn.queryDB(mysql.format(inQuery, inserts), function(val, err){

			if(err) {
				res.send('ERR: COULD NOT FIND USER SCORES');
			}
			else {
				//if we succeed, query to get the counts for the questions
				dbConn.queryDB(mysql.format(responsesQuery, inserts), function(resVal, err){

					if(err) {
						res.send('ERR: COULD NOT GET COUNTS');
					}
					else {
						//if we succeed, query to get the user data + individual answers
						dbConn.queryDB(mysql.format(userQuery, inserts), function(userVal, err){

							if(err){
								res.send('ERR: COULD NOT GET USER DATA');
							}
							//if we succeed, we need the question/answer info for the scenarios that were actually played
							else{
								//gets the question + answer info from each scenario
								inQuery = 'SELECT SCENARIOID, QUESTIONID, PROMPT, ANSWERID, ANSWER, SCORE FROM QUESTIONS NATURAL JOIN ANSWERS WHERE SCENARIOID = ?';
						
								//holds the inserts for the query; init and set index = 1
								var scenarioInserts = [];
								scenarioInserts.push(val[0].SCENARIOID);
								var scenIndex = 1;

								//loop through the initial user query
								for(var i = 1; i < val.length; i++)
								{
									//if we've found a new scenario, add it to our inserts and extend the query
									if(val[i].SCENARIOID != scenarioInserts[scenIndex-1])
									{
										scenarioInserts.push(val[i].SCENARIOID);
										scenIndex++;
										inQuery += ' OR SCENARIOID = ?';
									}	
								}

								inQuery += ' ORDER BY SCENARIOID';

								//query for the full scenario info
								dbConn.queryDB(mysql.format(inQuery, scenarioInserts), function(answerVal, err){
									
									if(err) {
										res.send('ERR: COULD NOT GET FULL SCENARIO INFO');
									}
									//if we succeed we have everything we need, so send it to be transformed into a .xlsx
									else {
										excelExports.exportDataFull(val, resVal, answerVal, userVal, function(workbook, err)
										{
											if(!err)
											{
												//get temporary path to prevent storage on db
												var tempFilePath = tempy.file({extension: '.xlsx'});
												//create the file and then send it to the user
												workbook.xlsx.writeFile(tempFilePath).then(function() {
													
													res.sendFile(tempFilePath, function(err){
														console.log('ERR: SENDING FILE');
													});
												});
											}
										});
									}
								});
							}
						})
					}
				});
			}
		});
	}
})


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
				   req.body.PASSWORD, req.body.PROFILE_PIC, req.body.BIRTHDAY];

	if(inserts[0] == undefined || inserts[1] == undefined || inserts[2] == undefined || inserts[3] == undefined || inserts[4] == undefined || 
	   inserts[5] == undefined || inserts[6] == undefined )
	{
		res.send('ERROR: MISSING PARAMETERS');
	}
	else
	{
		var i = 0; 
		for(i = 0; i < inserts.length - 2; i++)
		{
			if(inserts[i] == undefined)
			{
				inserts[i] = null;
			}
		}

		//get query and combine the two
		var inQuery = "INSERT INTO USERS VALUES('0',?,?,?,?,?,?,?,NOW(),'0')";

		//insert the values into the db. 
		dbConn.queryDB(mysql.format(inQuery, inserts), function(val, err){

			if(err) {
				res.send(val);
			}
			else {
				res.send("successfully inserted user into db");
			}
		});
	}
});

//updates a user's info
router.post('/updateUser', (req, res) => {

	//gets all possible things to update for the user
	var userId = req.body.USERID;
	var inserts = [req.body.USERNAME, req.body.FIRSTNAME, req.body.LASTNAME, req.body.EMAIL, 
				   req.body.PASSWORD, req.body.PROFILE_PIC, req.body.BIRTHDAY, req.body.ADMIN_STATUS];

	//sets up things to update
	var sqlComms = [' USERNAME = ?', ' FIRSTNAME = ?', ' LASTNAME = ?', ' EMAIL_ADDR = ?', ' PASSWORD = ?',
					' PROFILE_PIC = ?', ' BIRTHDAY = ?', ' ADMIN_STATUS = ?'];

	var count = 0;
	var newInserts = [];

	//start query
	var inQuery = 'UPDATE USERS SET ';

	//loop through each inserts. if they're not undefined, update them.
	for(var i = 0; i < inserts.length; i++)
	{
		if(inserts[i] != undefined)
		{
			//if we have more than one thing to update, use a comma to separate them
			if(count > 0)
			{
				inQuery += ',';
			}
			//add the query string to the query
			inQuery += sqlComms[i];
			//add the value to a separate array
			newInserts.push(inserts[i]);
			//increment count
			count++;
		}
	}

	//finish query to only update users with the specified id
	inQuery += ' WHERE USERID = ?';
	newInserts.push(userId);

	//if we're updating at least one field, query to update it/them
	if(count > 0)
	{
		dbConn.queryDB(mysql.format(inQuery, newInserts), function(val, err){

			if(err) {
				res.send(val);
			}
			else {
				res.send("successfully updated user");
			}
		});
	}
	else
	{
		res.send('ERROR: NO UPDATES SPECIFIED');
	}
});

//sends the player's data from the game to the db
router.post('/playerdata', (req, res) => {
	//gets params
	var inserts = [req.body.USERID, req.body.SCENARIOID, req.body.TIME_COMPLETE, req.body.TIME_PLAYED, req.body.ANSWERS];

	//verifies that all params were passed
	if(inserts[0] == undefined || inserts[1] == undefined || inserts[2] == undefined || inserts[3] == undefined || inserts[4] == undefined)
	{
		res.send('ERROR: MISSING PARAMETER');
	}
	else
	{
		//passes the data to the db to parse and insert accordingly
		dbConn.insertUserResponseDB(inserts, function(val, err){
			if(err) {
				res.send(val);
			}
			else {
				//format accordingly
				res.send('successfully did the thing');
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
/*
	//query to get the cultureid using the location from the database
	dbConn.queryDB(mysql.format(inQuery, inData.LOCATION), function(val, err){
		
		//if we found the culture, pass it along with the json to insert the rest of the info
		if(val[0].CULTUREID != undefined)
		{
			dbConn.insertScenarioInfo(inData, val[0].CULTUREID, function(val, err){
				res.send(val);
			});
		}
	});
});*/

//creates a group
router.post('/creategroup', (req, res) => {

	//gets the params
	var inserts = [req.body.GROUP_NAME, req.body.CREATOR];
	var inQuery;

	//can't make a group without a creator userid, but if there's no group name we can proceed with the default "newgroup1"
	if(req.body.CREATOR == undefined)
	{
		res.send('ERROR: MISSING PARAMETERS');
	}
	else if(req.body.GROUP_NAME == undefined)
	{
		inserts = req.body.CREATOR;
		inQuery = "INSERT INTO GROUPS VALUES('0', 'NewGroup1', ?)";
	}
	else
	{
		inserts = [req.body.GROUP_NAME, req.body.CREATOR];
		inQuery = "INSERT INTO GROUPS VALUES('0',?,?)";

	}

	//formats query and executes it.
	dbConn.queryDB(mysql.format(inQuery, inserts), function(val, err){
		if(err) {
			res.send('ERR: FAILED TO CREATE GROUP');
		}
		else {
			res.send('success');
		}	
	});
});

//adds members into a group. can insert however many id's are passed to it
router.post('/addmembers', (req, res) => {

	var members;
	//get group to insert into
	var groupid = req.body.groupid;
	var inQuery = 'SELECT USERID FROM USERS WHERE';
	var inserts = [], inInserts = [];

	if(groupid == undefined || req.body.userid == undefined)
	{
		res.send('ERROR: MISSING PARAMETERS');
	}
	else
	{
		//parses the userids into a useable array
		members = JSON.parse(req.body.userid);

		for(var a = 0; a < members.length; a++)
		{
			if(a != 0)
			{
				inQuery += ' OR';
			}

			inQuery += ' USERID = ?';
		}

		

		dbConn.queryDB(mysql.format(inQuery, members), function(users, err){
			if(err) {
				res.send('ERR');
			}
			else {
				//prepares to insert each userid by creating an array with arrays containing the insert values
				inserts = [], inInserts = [];
				var i = 0, j = 0;

				inQuery = 'SELECT USERID FROM GROUP_MEMBERS WHERE (';;
				for(i = 0; i < users.length; i++)
				{
					inserts.push(users[i].USERID);
					if(i != 0)
					{
						inQuery += ' OR ';
					}

					inQuery += 'USERID = ?';
				}

				inQuery += ') AND GROUPID = ? ORDER BY USERID';

				inserts.push(groupid);

				dbConn.queryDBEmpty(mysql.format(inQuery, inserts), function(val, err){
					if(err) {
						res.send('ERR: FAILED TO ADD MEMBERS 1');
					}
					else {

						i = 0;
						while(j < users.length)
						{
							if(i >= val.length || users[j].USERID != val[i].USERID)
							{
								inInserts.push([groupid, users[j].USERID]);
								j++;
							}
							else
							{
								while(j < users.length && users[j].USERID== val[i].USERID)
								{
									j++;
								}
							}
							i++;
						}

						//query
						inQuery = "INSERT INTO GROUP_MEMBERS(GROUPID, USERID) VALUES ?";

						//inserts each row into the db.

						if(inInserts.length > 0)
						{
							dbConn.queryMulti(inQuery, inInserts, function(val, err){
								if(err) {
									res.send('ERR: FAILED TO ADD MEMBERS 2');
								}
								else {
									res.send('success');
								}	
							});
						}
						else
						{
							res.send('NO VALID USERS TO INSERT');
						}
						
					}
				});

			}
		})

		

		
	}
});

//Passport Routes

router.post('/loginUser',
	passport.authenticate('local-login'),
	function(req,res){
		res.send(req.user);
	}
);

router.get('/logoutUser', function(req,res){
	req.logout();
	res.send("Logged out.");
});

router.post('/signupUser', 
	passport.authenticate('local-signup'),
	function(req,res){
		console.log("Signup successful.");
		res.send("Account successfully created.");
	}
);

/*
	var members;
	//get group to insert into
	var groupid = req.body.groupid;
	var inQuery = "DELETE FROM GROUP_MEMBERS WHERE GROUPID = ? AND (USERID = ?";

	if(groupid == undefined || req.body.userid == undefined)
	{
		res.send('ERROR: MISSING PARAMETERS');
	}
	else
	{
		//parses the userids into a useable array
		members = JSON.parse(req.body.userid);

		var inserts = [];

		inserts.push(groupid);
		inserts.push(members[0]);

		var i = 0;
		for(i = 1; i < members.length; i++)
		{
			inQuery += ' OR USERID = ?';
			inserts.push(members[i]);
		}		

		inQuery += ')';
		//remove any users with an id mentioned before
		dbConn.queryDB(mysql.format(inQuery, inserts), function(val, err){
			if(err) {
				res.send('ERR: FAILED TO ADD MEMBERS');
			}
			else {
				res.send('success');
			}	
		});
	}
});*/

//removes all members from a group. 
router.post('/removeallmembers', (req, res) => {


	//get group to insert into
	var groupid = req.body.groupid;

	var inQuery = "DELETE FROM GROUP_MEMBERS WHERE GROUPID = ?";

	if(groupid == undefined)
	{
		res.send('ERROR: MISSING PARAMETERS');
	}
	else
	{	
		//removes all users from the group
		dbConn.queryMulti(inQuery, groupid, function(val, err){
			if(err) {
				res.send('ERR: FAILED TO ADD MEMBERS');
			}
			else {
				res.send('success');
			}	
		});
	}
});




/*
process.on('warning', (warning) => {
  console.warn(warning.name);    // Print the warning name
  console.warn(warning.message); // Print the warning message
  console.warn(warning.stack);   // Print the stack trace
});
*/


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