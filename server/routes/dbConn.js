var mysql = require('mysql');

var pool = mysql.createPool({
	connectionLimit: 1000,
	//host: "10.171.204.166",
	host: "localhost",
	user: "root",
	password: "Bulb$asaur5m",
	database: "cvrfinal", 
})


exports.queryDB = function queryDB(inQuery,  callback)
{
	//connects user to the pool
	pool.getConnection(function(err, connection){	

		console.log(inQuery);
		if(err)
		{
			connection.release();
			callback("ERROR: COULDN'T CONNECT", "err");
		}
		else
		{
			//queries the db using inQuery
			connection.query(inQuery, function(err, rows, fields){
				
				connection.release();

				//if there wasn't an error, handle the result, otherwise something happened with connecting to db
				if(!err)
				{
					//if something was returned, return int via callback, otherwise give a no matches found err
					if(rows.length != 0)
					{	
						callback(rows , null);
					}
					else
					{
						callback("ERROR: NO MATCHES FOUND" , "err");
					}
					
										
				}
				else
				{
					console.log('connection problem');
				}
				
			});
		}
		
			
	});
}

exports.insertUserResponseDB = function insertUserResponseDB(inserts, callback)
{
	var inQuery = "INSERT INTO USER_SCENARIO_INFO VALUES(?,?,?,?,'0')";

	var localInserts = [inserts[0], inserts[1], inserts[2], inserts[3]];

	pool.getConnection(function(err, connection){	

		if(err)
		{
			connection.release();
			callback("ERROR: COULDN'T CONNECT", "err");
		}
		else
		{
			console.log('QUERY: ' + mysql.format(inQuery, localInserts));
			connection.query(mysql.format(inQuery, localInserts), function(err, rows, fields){
				
				if(!err)
				{	
					inQuery = "INSERT INTO USER_RESPONSES (USERID, SCENARIOID, TIME_COMPLETE, QUESTIONID, ANSWERID) VALUES ?";
					var values = [];
					var answers = JSON.parse(inserts[4]);
					var i = 0;

					for(i = 0; i < answers.length; i++)
					{
						values.push([inserts[0], inserts[1], inserts[2], pool.escape(i+1), pool.escape(answers[i])]);
					}

					connection.query(inQuery, [values], function(err, rows, fields){
			
						if(!err)
						{
							localInserts = [inserts[0], inserts[1]];
							inQuery = "UPDATE USER_SCENARIO_INFO SET MOST_RECENT = MOST_RECENT + 1 WHERE USERID = ? AND SCENARIOID = ?";

							connection.query(mysql.format(inQuery, localInserts), function(err, rows, fields){
			
								if(!err)
								{
									inQuery = "DELETE FROM USER_SCENARIO_INFO WHERE USERID = ? AND SCENARIOID = ? AND MOST_RECENT > 9";

									connection.query(mysql.format(inQuery, localInserts), function(err, rows, fields){

										connection.release();
			
										if(!err)
										{
											callback("Success", null);
										}
										else
										{
											console.log('ERR: PROBLEM WITH DELETE');
											callback("ERR: PROBLEM WITH DELETE", 'err');
										}
										
									});
								}
								else
								{
									connection.release();
									console.log('ERR: PROBLEM WITH UPDATE');
									callback("ERR: PROBLEM WITH UPDATE", 'err');
								}
								
							});	
												
						}
						else
						{
							connection.release();
							console.log('ERR: PROBLEM WITH INSERTING RESPONSES ' + inQuery + ' ' + values);
							callback("ERR: PROBLEM WITH INSERTING RESPONSES " + inQuery + ' ' +  values, 'err');
							
						}
						
					});
										
				}
				else
				{
					connection.release();
					console.log('ERR: PROBLEM WITH INSERTING INSTANCE');
					callback("ERR: PROBLEM WITH INSERTING INSTANCE: " + inserts, 'err');
				}
				
			});
		}
		
			
	});


}

//	var userQuery = "SELECT USERID, DATE_JOINED, TIME_PLAYED, PROFILE_PIC, EMAIL_ADDR, SCENARIOID, TITLE,  TIME_PLAYED, QUESTIONID, PROMPT, ANSWERID, ANSWER" + 
//	" FROM USERS NATURAL JOIN SCENARIO NATURAL JOIN USER_SCENARIO_INFO NATURAL JOIN QUESTIONS NATURAL JOIN ANSWERS NATURAL JOIN USER_RESPONSES WHERE USERID = ?";

//formats User JSON to accomodate arrays
exports.formatUserJSON = function formatUserJSON(str, callback)
{
	var retString = '{"players": [';
	console.log(str.length);

	var currID = -1;
	var currScenID = -1;
	var totalTime = 0;
	var i = 0;

	for(i = 0; i < str.length; i++)
	{
		
		if(currID == str[i].USERID)
		{
			if(currScenID == str[i].SCENARIOID)
			{
				retString += ',{"QUESTIONID": "' + str[i].QUESTIONID  + '",';
				retString += '"PROMPT": "' + str[i].PROMPT + '",';
				retString += '"ANSWERID": "' + str[i].ANSWERID + '",';
				retString += '"ANSWER": "' + str[i].ANSWER + '"}';

			}
			else
			{
				retString += ']},{"SCENARIOID": "' + str[i].SCENARIOID  + '",';
				retString += '"TITLE": "' + str[i].TITLE + '",';
				retString += '"TIME_PLAYED": "' + str[i].TIME_PLAYED + '",';

				retString += '"QUESTIONS": [{"QUESTIONID": "' + str[i].QUESTIONID  + '",';
				retString += '"PROMPT": "' + str[i].PROMPT + '",';
				retString += '"ANSWERID": "' + str[i].ANSWERID + '",';
				retString += '"ANSWER": "' + str[i].ANSWER + '"}';

				currScenID = str[i].SCENARIOID;
			}
		}
		else
		{
			if(i != 0)
			{
				retString += '},';
			}
			

			retString += '{"USERID": "' + str[i].USERID + '",';
			retString += '"DATE_JOINED": "' + str[i].DATE_JOINED + '",';
			retString += '"PROFILE_PIC": "' + str[i].PROFILE_PIC + '",';
			retString += '"EMAIL_ADDR": "' + str[i].EMAIL_ADDR + '",';

			retString += '"SCENARIOS": [{"SCENARIOID": "' + str[i].SCENARIOID  + '",';
			retString += '"TITLE": "' + str[i].TITLE + '",';
			retString += '"TIME_PLAYED": "' + str[i].TIME_PLAYED + '",';

			retString += '"QUESTIONS": [{"QUESTIONID": "' + str[i].QUESTIONID  + '",';
			retString += '"PROMPT": "' + str[i].PROMPT + '",';
			retString += '"ANSWERID": "' + str[i].ANSWERID + '",';
			retString += '"ANSWER": "' + str[i].ANSWER + '"}';
			
			currID = str[i].USERID;
			currScenID = str[i].SCENARIOID;

		}

		//console.log(i + ": " + retString);

	}

	retString += ']]}]}]}';

	callback(retString, null);

}

