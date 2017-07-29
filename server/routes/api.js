var express = require('express');
var router = express.Router();
var data = require('../data/players.json');
var dbConn = require('./dbConn');
var mysql = require('mysql');
var http = require('http').Server(express);
var io = require('socket.io')(http);

var testjson = require('./scenairo.json');

//API Listing
router.get('/', (req, res) => {

	res.send('api works  5');
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

//gets userid for the game. can check via email or username
router.get('/gameuser', (req, res) =>{

	var userData;
	var inQuery;

	//sees if username and/or email are defined. If one is query on it, otherwise err.
	if(req.query.username == undefined && req.query.email == undefined)
	{
		res.send('ERR: NO PARAMETERS TO SEARCH FOR');
	}
	else if(req.query.email == undefined)
	{
		userData = req.query.username;
		inQuery = "SELECT USERID FROM USERS WHERE USERNAME = ?";
	}
	else
	{
		userData = req.query.email;
		inQuery = "SELECT USERID FROM USERS WHERE EMAIL_ADDR = ?";
	}

	//query db for the userid. returns an integer.
	dbConn.queryDB(mysql.format(inQuery, userData), function(val, err){
		if(err) {
			res.send(null);
		}
		else {
			//converts the query result into an int
			res.send(JSON.stringify(val[0].USERID));
		}
		
	});

});


//returns all relevant user info where userid = id
router.get('/userinfo', (req, res) => {
	
	var userid = req.query.userid;
	var history = req.query.history;

	//check to see if params are there
	if(userid == undefined)
	{
		res.send('ERROR: NO USERID PARAMETER');
	}
	else
	{
		//gross query
		var inQuery = "SELECT USERID, DATE_JOINED, TIME_PLAYED, PROFILE_PIC, EMAIL_ADDR, SCENARIOID, TITLE, TIME_COMPLETE, QUESTIONID, PROMPT, ANSWERID, ANSWER" + 
		" FROM USERS NATURAL JOIN SCENARIOS NATURAL JOIN USER_SCENARIO_INFO NATURAL JOIN QUESTIONS NATURAL JOIN ANSWERS NATURAL JOIN USER_RESPONSES WHERE USERID = ?";
		
		if(history == 'true')
		{
			inQuery += " AND MOST_RECENT = 1";
		}

		//searches db to see if userid = id exists with game data.
		dbConn.queryDB(mysql.format(inQuery, userid), function(val, err){

			//if there was an error make sure it wasn't becasue the user just hasn't played a scenario
			if(err) {
				//new query for just relevant user data
				inQuery = "SELECT USERID, DATE_JOINED, PROFILE_PIC, EMAIL_ADDR FROM USERS WHERE USERID = ?";

				//query db; if there's still an error than either something bad happened or no user has userid = id. otherwise return user data
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
//gets the data from multiple users. Array should be defined as above. Will ignore any id's that don't have users yet.
router.get('/multiuser', (req, res) => {

	//verifies that it was sent data
	if(req.query.userid == undefined)
	{
		res.send('ERROR: NO USERID PARAMETER');
	}
	else
	{
		//sets up query
		var inQuery = 'SELECT * FROM USERS WHERE USERID = ?';
		//converts the array of id's into an actual array for JS.
		var arr = JSON.parse(req.query.userid);

		//if we were sent data, build a query that searches for each index.
		if(arr.length > 1)
		{
			var i;

			for(i = 1; i < arr.length; i++)
			{
				if(i+1 < arr.length)
				{
					inQuery += ' OR USERID = ?';
				}
			}
		}
		else
		{
			res.send('ERROR: NO USERS SELECTED');
		}

		//query on the data by inserting the arr into the query
		dbConn.queryDB(mysql.format(inQuery, arr), function(val, err){
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

//gets all the info from a scenario row with scenarioid = inID
router.get('/scenario', (req, res) => {
	
	//gets the scenarioid that was passed.
	var scenarioid = req.query.scenid;

	//verifies we were sent data
	if(scenarioid == undefined)
	{
		res.send('ERROR: NO SCENARIOID PARAMETER');
	}
	else
	{
		//query
		var inQuery = "SELECT * FROM SCENARIOS WHERE SCENARIOID = ?";

		//searches db for scenarios with scenarioid = scenid
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

//gets the most recent scores of all users who played a scenario
router.get('/scenarioscores', (req, res) => {

	//gets the scenarioid that was passed
	var scenarioid = req.query.scenid;

	//verifies that it was passes the parameters
	if(scenarioid == undefined)
	{
		res.send('ERROR: NO SCENARIOID PARAMETER')
	}
	else
	{
		/*gross query; joins Users, User_Scenario_Info, User_Responses, Questions, and Answers to sum up the Score field in Answers for each answer the User selected in U_R.
		/renames the sum to Total_Score. Most recent limits the results to only their most recent playthroughs. 
		*/
		var inQuery = 'SELECT USERID, USERNAME, SUM(SCORE) AS TOTAL_SCORE FROM USERS NATURAL JOIN USER_SCENARIO_INFO NATURAL JOIN USER_RESPONSES NATURAL JOIN QUESTIONS NATURAL JOIN ANSWERS WHERE SCENARIOID = ? AND MOST_RECENT = 1 GROUP BY USERID';
		
		//queries the database
		dbConn.queryDB(mysql.format(inQuery, scenarioid), function(val, err){
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

//gets the number of times each answer was selected for each question in a given scenario
router.get('/scenarioresponses', (req, res) => {

	//gets the scenario parameter
	var scenarioid = req.query.scenid;

	//makes sure that a parameter was actually set
	if(scenarioid == undefined)
	{
		res.send('ERROR: NO SCENARIOID PARAMETER')
	}
	else
	{
		//query; joins the tables to count the number of users that selected a specific answer. Only gets the most recent responses
		var inQuery = 'SELECT SCENARIOID, QUESTIONID, PROMPT, ANSWERID, ANSWER, COUNT(USERID) AS NUMRESPONCES FROM USERS NATURAL JOIN SCENARIOS NATURAL JOIN QUESTIONS NATURAL JOIN ANSWERS NATURAL JOIN USER_RESPONSES NATURAL JOIN USER_SCENARIO_INFO WHERE SCENARIOID = ? AND MOST_RECENT = 1 GROUP BY ANSWERID';
		
		//queries db
		dbConn.queryDB(mysql.format(inQuery, scenarioid), function(val, err){
			if(err) {
				res.send(val);
			}
			else {
				//format accordingly
				res.send(JSON.stringify(val));
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
		var inQuery = 'SELECT USERID FROM GROUPS NATURAL JOIN GROUP_MEMBERS WHERE GROUPID = ?';

		dbConn.queryDB(mysql.format(inQuery, inserts), function(val, err){
			
			if(err) {
				res.send(JSON.stringify(val));
			}
			else {
				res.send(JSON.stringify(val));
			}
		});
	}
})

//gets the number of times each answer was selected in a given group
router.get('/groupresponses', (req, res) => {

	//gets both the scenario's id as well as the group we're searching for
	var inserts = [req.query.scenid, req.query.groupid];
	//query, see line 261 for breakdown. Same thing but now adds groups
	var inQuery = 'SELECT SCENARIOID, QUESTIONID, PROMPT, ANSWERID, ANSWER, COUNT(USERID) AS NUMRESPONCES FROM USERS NATURAL JOIN SCENARIOS NATURAL JOIN QUESTIONS NATURAL JOIN ANSWERS NATURAL JOIN USER_RESPONSES NATURAL JOIN USER_SCENARIO_INFO NATURAL JOIN GROUPS WHERE SCENARIOID = ? AND MOST_RECENT = 1 AND GROUPID = ? GROUP BY ANSWERID'

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
				//format accordingly
				res.send(JSON.stringify(val));
			}
		});
	}
});

//gets the scores for members in a specific group in a specific scenario
router.get('/groupscores', (req, res) => {

	//gets the params
	var inserts = [req.query.scenid, req.query.groupid];

	//checks to make sure all of the params were sent
	if(inserts[0] == undefined || inserts[1] == undefined)
	{
		res.send('ERROR: NO SCENARIOID PARAMETER')
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
				res.send(JSON.stringify(val));
			}
		});
	}
});


//inserts culture into the db
//https://stackoverflow.com/questions/14551194/how-are-parameters-sent-in-an-http-post-request if we have issues getting data
//using postman for now
router.post('/insertCulture', (req, res) => {

	//get inserts
	var inserts = [req.body.LOCATION, req.body.MAIN_LANGUAGE];
	if(inserts[0] == undefined || inserts[1] == undefined)
	{
		res.send('ERR: MISSING PARAMETER');
	}
	else
	{
		//get query and combine the two
		var inQuery = "INSERT INTO CULTURES VALUES('0',?,?)";

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

//inserts a user into the db; expects all info included
router.post('/insertUser', (req, res) => {

	//get inserts
	var inserts = [req.body.USERNAME, req.body.FIRSTNAME, req.body.LASTNAME, req.body.EMAIL, 
				   req.body.PASSWORD, req.body.PROFILE_PIC, req.body.BIRTHDAY, NOW(), '0'];

	//checks to verify that all necessary fields are filled.
	if(inserts[0] == undefined || inserts[4] == undefined)
	{
		res.send('ERROR: MISSING PARAMETER');
	}
	else
	{
		var i = 0; 
		for(i = 0; i < inserts.length; i++)
		{
			if(inserts[i] = undefined)
			{
				inserts[i] = null;
			}
		}

		//get query and combine the two
		var inQuery = "INSERT INTO USERS VALUES('0',?,?,?,?,?,?,?,?,?)";

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

//sends the player's data from the game to the db
router.post('/playerdata', (req, res) => {
	//gets params
	var inserts = [req.body.USERID, req.body.SCENARIOID, req.body.TIME_COMPLETE, req.body.TIME_PLAYED, req.body.ANSWERS];

	//verifies that all params were passed
	if(inserts[0] == undefined || inserts[1] == undefined || inserts[2] == undefined || inserts[3] == undefined || inserts[4] == undefined)
	{
		console.log('ERROR: MISSING PARAMETER');
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

//inserts a scenario into the database given a json file
router.get('/insertscenario', (req, res) => {

	var inData = testjson;

	//first need to get the cultureid
	var inQuery = 'SELECT CULTUREID FROM CULTURES WHERE LOCATION = ?';

	//query to get the cultureid using the location from the database
	dbConn.queryDB(mysql.format(inQuery, inData.LOCATION), function(val, err){
		console.log(val[0].CULTUREID);
		//if we found the culture, pass it along with the json to insert the rest of the info
		if(val[0].CULTUREID != undefined)
		{
			dbConn.insertScenarioInfo(inData, val[0].CULTUREID, function(val, err){
				res.send(val);
			});
		}
	});
});

//creates a group
router.post('/creategroup', (req, res) => {

	//gets the params
	var inserts = [req.body.GROUP_NAME, req.body.CREATOR];
	var inQuery;

	//can't make a group without a creator userid, but if there's no group name we can proceed with the default "newgroup1"
	if(req.body.CREATOR == undefined)
	{
		res.send('ERR: MISSING PARAMS');
	}
	else if(req.body.GROUP_NAME == undefined)
	{
		inserts = req.body.CREATOR;
		inQuery = "INSERT INTO GROUPS VALUES('0', null, ?)";
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

	if(groupid == undefined || req.body.userid == undefined)
	{
		res.send('ERR: MISSING PARAMS');
	}
	else
	{
		//parses the userids into a useable array
		members = JSON.parse(req.body.userids);

		//prepares to insert each userid by creating an array with arrays containing the insert values
		var inserts = [];
		var i = 0;
		for(i = 0; i < members.length; i++)
		{
			inserts.push([groupid, members[i]]);
		}

		//query
		var inQuery = "INSERT INTO GROUP_MEMBERS(GROUPID, USERID) VALUES ?";

		//inserts each row into the db.
		dbConn.queryMulti(inQuery, inserts, function(val, err){
			if(err) {
				res.send('ERR: FAILED TO ADD MEMBERS');
			}
			else {
				res.send('success');
			}	
		});
	}
});




process.on('warning', (warning) => {
  console.warn(warning.name);    // Print the warning name
  console.warn(warning.message); // Print the warning message
  console.warn(warning.stack);   // Print the stack trace
});



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