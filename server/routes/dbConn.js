var mysql = require('mysql');

var pool = mysql.createPool({
	connectionLimit: 1000,
	host: "localhost",
	user: "root",
	password: "Bulb$asaur5m",
	database: "culturalvrupdate"
})

var userTable = ["USERS", "ANSWERS", "USER_RESPONSES", "QUESTIONS", "SCENARIO"];
var scenarioTable = ["SCENARIO", "CULTURE", "GOALS", "LANGUAGES", "QUESTIONS", "ANSWERS"];
var extraConstraints = [" ORDER BY ", " GROUP BY ", " LIMIT "];
//exports.userTables = userTable;

exports.getQuery = function getQuery(fields, tables, attributes, values, extraCons, callback)
{
	var outQuery = "SELECT ";
	var i;
	
	if(fields.length == 0)
	{
		outQuery += " * "; 
	}
	else
	{
		for(i = 0; i < fields.length; i++)
		{
			outQuery += fields[i];
			if(i != fields.length - 1)
			{
				outQuery += ", ";
			}
		}
	}
	
	var tableArr = [];
	
	if(tables.valueOf() == 'userTable')
	{
		for(i = 0; i < userTable.length; i++)
		{
			tableArr.push(userTable[i]);
		}
	}
	else if(tables.valueOf() == 'scenarioTable')
	{
		for(i = 0; i < scenarioTable.length; i++)
		{
			tableArr.push(scenarioTable[i]);
		}
	}
	else
	{
		for(i = 0; i < tables.length; i++)
		{
			tableArr.push(tables[i]);
		}
	}
	
	for(i = 0; i < tableArr.length; i++)
	{
		if(i == 0)
		{
			outQuery += " FROM " + tableArr[i];
		}
		else
		{
			outQuery += " NATURAL JOIN " + tableArr[i];
		}
	}
	
	if(attributes.length != 0)
	{
		outQuery += " WHERE ";
		
		for(i = 0; i < attributes.length; i++)
		{
			if(i != 0)
			{
				if(attributes[i-1].valueOf() == attributes[i].valueOf())
				{
					outQuery += " OR ";
				}
				else
				{
					outQuery += " AND ";
				}
			}
		
			outQuery += attributes[i] + " = " + pool.escape(values[i]);
			//console.log(outQuery);

		}
	}
	
	for(i = 0; i < extraCons.length; i++)
	{
		if(extraCons[i].valueOf() != "")
		{
			outQuery += extraConstraints[i] + extraCons[i];
		}
	}
	
	console.log(outQuery);
	
	pool.getConnection(function(err, connection){	

		//query: userQuery = mySql query, err = error state, rows = data, fields = attributes (if needed)
		connection.query(outQuery, function(err, rows, fields){
			
			connection.release();
			
			if(!err){
				callback(JSON.stringify(rows), null);					
			}
			else{
				console.log('err');
			}
			
		});
		
		connection.on('error', function(error){
			return;
		});
			
	});
};

//exports.getQuery = function getQuery(fields, tables, attributes, values, extraCons, callback)
exports.updateRow = function updateRow(table, setAttributes, setValues, whereAttributes, whereValues, callback)
{
	var outQuery = "UPDATE "
	var i = 0;
	
	for(i = 0; i < table.length; i++)
	{
		outQuery += table[i];
		
		if(i+1 != table.length)
		{
			outQuery += ", ";
		}
	}
	
	outQuery += " SET "
	
	for(i = 0; i < setAttributes.length; i++)
	{
		outQuery += setAttributes[i] + " = " + pool.escape(setValues[i]);
		
		if(i+1 != setAttributes.length)
		{
			outQuery += ", ";
		}
	}
	
	if(whereAttributes.length != 0)
	{
		outQuery += " WHERE ";
		
		for(i = 0; i < whereAttributes.length; i++)
		{
			if(i != 0)
			{
				if(whereAttributes[i-1].valueOf() == whereAttributes[i].valueOf())
				{
					outQuery += " OR ";
				}
				else
				{
					outQuery += " AND ";
				}
			}
		
			outQuery += whereAttributes[i] + pool.escape(whereValues[i]);
			//console.log(outQuery);

		}
	}
	
	console.log(outQuery);
	
	pool.getConnection(function(err, connection){	

		//query: userQuery = mySql query, err = error state, rows = data, fields = attributes (if needed)
		connection.query(outQuery, function(err, rows, fields){
			
			connection.release();
			
			if(!err){
				callback(JSON.stringify(rows), null);					
			}
			else{
				console.log('err');
			}
			
		});
		
		connection.on('error', function(error){
			return;
		});
			
	});
	
}

exports.insertRow = function insertRow(table, vals, callback)
{
	var outQuery = "INSERT INTO " + table + " VALUES(";
	var i = 0;
	
	for(i = 0; i < vals.length; i++)
	{
		if(Number.isInteger(vals[i]))
		{
			outQuery += pool.escape(vals[i]);
		}
		else
		{
			outQuery += pool.escape(vals[i]);
		}
		
		if(i+1 != vals.length)
		{
			outQuery +=  ", ";
		}
	}
	
	outQuery += ")";
	console.log(outQuery);
	
	pool.getConnection(function(err, connection){	

		//query: userQuery = mySql query, err = error state, rows = data, fields = attributes (if needed)
		connection.query(outQuery, function(err, rows, fields){
			
			
			connection.release();
			
			if(!err){
				callback(JSON.stringify(rows), null);					
			}
			else{
				console.log('err');
			}
			
		});
		
		connection.on('error', function(error){
			return;
		});
			
	});
}

exports.insertUser = function insertRow(vals, callback)
{
	var outQuery = "INSERT INTO USERS VALUES(";
	var i = 0;
	
	for(i = 0; i < vals.length; i++)
	{
		if(Number.isInteger(vals[i]))
		{
			outQuery += pool.escape(vals[i]);
		}
		else
		{
			outQuery += pool.escape(vals[i]);
		}
		
		if(i+1 != vals.length)
		{
			outQuery +=  ", ";
		}
	}
	
	outQuery += ")";
	console.log(outQuery);
	
	pool.getConnection(function(err, connection){	

	
		connection.query("SELECT USERID FROM USERS WHERE EMAIL_ADDR = " + pool.escape(vals[4]), function(err, rows, fields){
			
			console.log(rows);
			if(rows.length == 0)
			{
				connection.query(outQuery, function(err, rows, fields){
					
					connection.release();
					
					if(!err){
						callback(JSON.stringify(rows), null);					
					}
					else{
						console.log('err');
					}
				});
			
				connection.on('error', function(error){
					return;
				});
			}
			else
			{
				connection.release();
				console.log("There was a duplicate email, err");
			}
		});
		
		connection.on('error', function(error){
				return;
		});
		//query: userQuery = mySql query, err = error state, rows = data, fields = attributes (if needed)
		
			
	});
}
