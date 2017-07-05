var express = require('express');
var router = express.Router();
var data = require('../data/players.json');
var dbConn = require('./dbConn');
var mysql = require('mysql');


var returnval;
var userTable = ["USERS", "ANSWERS", "USER_RESPONSES", "QUESTIONS", "SCENARIO"];

//API Listing
router.get('/', (req, res) => {
    res.send('api works 2');
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