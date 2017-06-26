var mysql = require('mysql');

var pool = mysql.createPool({
	connectionLimit: 1000,
	host: "localhost",
	user: "root",
	password: "Bulb$asaur5m",
	database: "culturalvrupdate"
})

module.exports = {
	
		
	queryDB: function (req, callback)
	{
		pool.getConnection(function(err, connection){	
			var inserts = 2;
			var userQuery = "SELECT * FROM LANGUAGES WHERE SCENARIOID = " + pool.escape(req);
			
			//query: userQuery = mySql query, err = error state, rows = data, fields = attributes (if needed)
			connection.query(userQuery, function(err, rows, fields){
				connection.release();
				if(!err){
					callback(JSON.stringify(rows), null);
					//res.send(JSON.stringify(rows));
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
		
	}
	
}