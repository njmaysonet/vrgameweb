var express = require('express');
var router = express.Router();
var data = require('../data/players.json');
var dbConn = require('./dbConn');
var mysql = require('mysql');
var http = require('http').Server(express);
var io = require('socket.io')(http);



var returnval;
var userTable = ["USERS", "ANSWERS", "USER_RESPONSES", "QUESTIONS", "SCENARIO"];

//API Listing
router.get('/', (req, res) => {
    res.send('api works 2');
});

router.get('/user/:id', (req, res) => {
	
	var userQuery = "SELECT * FROM USERS WHERE USERID = ?";
	dbConn.queryDB(userQuery, req.params.id, function(val, err){
		if(err){
			res.send(val);
		}
		else{
			res.send('{"players": ' + JSON.stringify(val) + '}');
		}
	});
	
});

/*
players
-date joined(date:string)
-time played(hours:number)
-scenarios (array)
    -name
    -question responses (array)
        -question
        -response
    -completed:boolean
    -time completed:time(number)
-profile pic (filename.extension)
-email address(string:email URL) **will not be shown in profile to public so don't need it right now

SELECT  SEC_TO_TIME( SUM( TIME_TO_SEC( `timeSpent` ) ) ) AS timeSum  
FROM YourTableName  
*/

router.get('/userinfo/:id', (req, res) => {
	
	var userQuery = "SELECT USERID, DATE_JOINED, TIME_PLAYED, PROFILE_PIC, EMAIL_ADDR, SCENARIOID, TITLE,  TIME_PLAYED, QUESTIONID, PROMPT, ANSWERID, ANSWER" + 
	" FROM USERS NATURAL JOIN SCENARIO NATURAL JOIN USER_SCENARIO_INFO NATURAL JOIN QUESTIONS NATURAL JOIN ANSWERS NATURAL JOIN USER_RESPONSES WHERE USERID = ?";
	dbConn.queryDB(userQuery, req.params.id, function(val, err){

		if(err){

			userQuery = "SELECT USERID, DATE_JOINED, PROFILE_PIC, EMAIL_ADDR FROM USERS WHERE USERID = ?";
			dbConn.queryDB(userQuery, req.params.id, function(inVal, inErr){
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
		else{
			dbConn.formatUserJSON(val, function(ret, err){
				if(!err)
				{
					res.send(ret);
				}
			});
		}
	});
	
});


router.post('/insertUser', function(req, res){
	var location = req.body.LOCATION;
	var mainLang = req.body.MAIN_LANGUAGE;

	var userQuery = "INSERT INTO CULTURES VALUES(?,?)";

	dbConn.queryDB(userQuery, [location, mainLang], function(val, err){

		if(err){
			res.send(val);
		}
		else{
			res.send("successfully inserted into db");
		}
	});

});



router.get('/data', (req, res) => {
	
	//dbConn.getQuery(SELECT, FROM, WHERE(FIELDS), WHERE(VALUES), EXTRA(**)))
	dbConn.getQuery([], ["GOALS"], [], [], ["SCENARIOID","",""], function(val, err){
		if(err){
			res.send('err');
		}
		else{
			res.send(val);
		}
	});
	
});

router.get('/update', (req, res) => {
	

	//dbConn.updateRow(TABLE, SETLEFTSIDE, SETRIGHTSIDE, WHERELEFTSIDE, WHERERIGHTSIDE))
	
	dbConn.updateRow(["GOALS"], ["GOAL"], ["Check into a hotel!"], ["GOAL ="], ["Check into a hotel"], function(val, err){
		if(err){
			res.send('err');
		}
		else{
			res.send(val);
		}
	});
	
});

router.get('/insert', (req, res) => {
	

	//dbConn.updateRow(TABLE, SETLEFTSIDE, SETRIGHTSIDE, WHERELEFTSIDE, WHERERIGHTSIDE))
	
	dbConn.insertUser([0, "YRyo", "Andrew", "Dignan", "DDigna@gmail.com", "brbttyl", "/teemo.jpg", "1995-05-15", new Date(), 2], function(val, err){
		if(err){
			res.send('err');
		}
		else{
			res.send(val);
		}
	});
	
});



//Extra: [ORDER BY, GROUP BY, LIMIT]

//	mysqlConn.getQuery(["USERID", "FIRSTNAME", "SCENARIOID", "SUM(SCORE)"], "userTable", ["USERID"], [5], ["SCENARIOID"], function(val, err){
module.exports = router;