var express = require('express');
var router = express.Router();
var data = require('../data/players.json');
var dbConn = require('./dbConn');
var mysql = require('mysql');
var http = require('http').Server(express);
var io = require('socket.io')(http);

//API Listing
router.get('/', (req, res) => {
    res.send('api works 3');
});

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

//gets all user info where userid = id;
router.get('/user', (req, res) => {
	
	//base query
	var userid = req.query.userid;
	var userQuery = "SELECT * FROM USERS WHERE USERID = ?";

	//searches db for user with userid = id. 
	dbConn.queryDB(mysql.format(userQuery, userid), function(val, err){
		//if none was found return err message, otherwise JSONify data and return
		if(err)
		{
			res.send(val);
		}
		else
		{
			res.send('{"players": ' + JSON.stringify(val) + '}');
		}
	});
	
});

router.get('/scenario', (req, res) => {
	
	//base query
	var scenarioid = req.query.scenid;
	var test = req.query.test;
	console.log("I got " + scenarioid + " " + test);

	var scenarioQuery = "SELECT * FROM SCENARIOS WHERE SCENARIOID = ?";

	//searches db for user with userid = id. 
	dbConn.queryDB(mysql.format(scenarioQuery, scenarioid), function(val, err){
		//if none was found return err message, otherwise JSONify data and return
		if(err)
		{
			res.send(val);
		}
		else
		{
			res.send('{"scenarios": ' + JSON.stringify(val) + '}');
		}
	});
	
});

//returns all relevant user info where userid = id
router.get('/userinfo', (req, res) => {
	
	var userid = req.query.userid;
	//gross query
	var userQuery = "SELECT USERID, DATE_JOINED, TIME_PLAYED, PROFILE_PIC, EMAIL_ADDR, SCENARIOID, TITLE,  TIME_PLAYED, QUESTIONID, PROMPT, ANSWERID, ANSWER" + 
	" FROM USERS NATURAL JOIN SCENARIOS NATURAL JOIN USER_SCENARIO_INFO NATURAL JOIN QUESTIONS NATURAL JOIN ANSWERS NATURAL JOIN USER_RESPONSES WHERE USERID = ?";
	
	//searches db to see if userid = id exists with game data.
	dbConn.queryDB(mysql.format(userQuery, userid), function(val, err){

		//if there was an error make sure it wasn't becasue the user just hasn't played a scenario
		if(err){
			//new query for just relevant user data
			userQuery = "SELECT USERID, DATE_JOINED, PROFILE_PIC, EMAIL_ADDR FROM USERS WHERE USERID = ?";

			//query db; if there's still an error than either something bad happened or no user has userid = id. otherwise return user data
			dbConn.queryDB(mysql.format(userQuery, userid), function(inVal, inErr){
				if(inErr)
				{
					res.send('no users found');
				}
				else
				{
					res.send('{ "players:"' + JSON.stringify(inVal) + "}");
				}

			})
		}
		//if there was no error JSONify the data and return it.
		else{
			dbConn.formatUserJSON(val, function(ret, err){
				if(!err)
				{
					res.send(ret);
				}
				else
				{
					res.send("ERROR: JSON-CONVERSION FAILED");
				}
			});
		}
	});
	
});

//http://localhost:3000/api/multiuser?userid=["1","4","8"]
router.get('/multiuser', (req, res) => {

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

	console.log(inQuery);

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

router.get('/scenarioscores', (req, res) => {

	var inQuery = 'SELECT USERID, USERNAME, SUM(SCORE) AS TOTAL_SCORE FROM USERS NATURAL JOIN USER_SCENARIO_INFO NATURAL JOIN USER_RESPONSES NATURAL JOIN QUESTIONS NATURAL JOIN ANSWERS WHERE SCENARIOID = ? GROUP BY USERID';
	dbConn.queryDB(mysql.format(inQuery, req.query.scenid), function(val, err){
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

//SELECT SCENARIOID, QUESTIONID, PROMPT, ANSWERID, ANSWER, COUNT(USERID) AS NUMRESPONCES FROM USERS NATURAL JOIN SCENARIOS NATURAL JOIN QUESTIONS NATURAL JOIN ANSWERS NATURAL JOIN USER_RESPONSES NATURAL JOIN USER_SCENARIO_INFO WHERE SCENARIOID = 1 GROUP BY ANSWERID;





//inserts culture into the db
//https://stackoverflow.com/questions/14551194/how-are-parameters-sent-in-an-http-post-request if we have issues getting data
//using postman for now
router.post('/insertCulture', function(req, res){

	//get inserts
	var inserts = [req.body.LOCATION, req.body.MAIN_LANGUAGE];

	//get query and combine the two
	var userQuery = "INSERT INTO CULTURES VALUES('0',?,?);";
	userQuery = mysql.format(userQuery, inserts);

	//insert the values into the db. 
	dbConn.queryDB(userQuery, function(val, err){

		if(err)
		{
			res.send(val);
		}
		else
		{
			res.send("successfully inserted culture into db");
		}
	});

});

router.post('/insertUser', function(req, res){

	//get inserts
	var inserts = [req.body.USERNAME, req.body.FIRSTNAME, req.body.LASTNAME, req.body.EMAIL, req.body.PASSWORD, req.body.PROFILE_PIC, req.body.BIRTHDAY, '2017-07-19', '0'];

	//get query and combine the two
	var userQuery = "INSERT INTO USERS VALUES('0',?,?,?,?,?,?,?,?,?);";

	//insert the values into the db. 
	dbConn.queryDB(mysql.format(userQuery, inserts), function(val, err){

		if(err)
		{
			res.send(val);
		}
		else
		{
			res.send("successfully inserted user into db");
		}
	});

});

module.exports = router;