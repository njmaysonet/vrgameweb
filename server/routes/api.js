var express = require('express');
var router = express.Router();
var data = require('../data/players.json');
var dbConn = require('./dbConnTest');
var mysql = require('mysql');


var returnval;

//API Listing
router.get('/', (req, res) => {
    res.send('api works 2');
});

router.get('/data', (req, res) => {
	
	dbConn.queryDB(req, function(val, err){
		if(err){
			res.send('err');
		}
		else{
			res.send(val);
		}
	});
	
});


/*
router.get('/data', (req, res) => {
	
	pool.getConnection(function(err, connection){	
		var inserts = 2;
		var userQuery = "SELECT * FROM LANGUAGES WHERE SCENARIOID = " + pool.escape(inserts);
		
		//query: userQuery = mySql query, err = error state, rows = data, fields = attributes (if needed)
		connection.query(userQuery, function(err, rows, fields){
			connection.release();
			if(!err){
				res.send(JSON.stringify(rows));
				//res = rows;
				
			}
			else{
				//res.send(JSON.stringify(rows));
				console.log('err');
			}
		});
		
		connection.on('error', function(error){
			return;
		});
			
	});
})

*/

/*
function myCallback(err, res, rows)
{
	if(err)
	{
		console.log("error");
	}
	else{
		//converts data to JSON format
		
		//console.log("pre: " + JSON.stringify(rows));
		res = JSON.stringify(rows);
		//console.log("post " + res);
		//console.log("new Callback");
		
		return JSON.stringify(rows);
		//compares output: result = JSON format, res = original data
		//console.log(result);
		//console.log(res);
		
	}
}
*/

module.exports = router;