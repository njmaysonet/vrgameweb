var mysql = require('mysql');

var pool = mysql.createPool({
	connectionLimit: 1000,
	//host: "10.171.204.166",
	host: "localhost",
	user: "root",
	password: "Bulb$asaur5m",
	database: "cvrfinal", 
})

//base query function
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
						callback(rows, null);
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

//same as queryDB but does multiple queries at once
exports.queryMulti = function queryMulti(inQuery, multiArr, callback)
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
			connection.query(inQuery, [multiArr], function(err, rows, fields){
				
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

//inserts data from the game into the db
exports.insertUserResponseDB = function insertUserResponseDB(inserts, callback)
{
	//get initial query
	var inQuery = "INSERT INTO USER_SCENARIO_INFO VALUES(?,?,?,?,'0')";

	var localInserts = [inserts[0], inserts[1], inserts[2], inserts[3]];

	//connect to db
	pool.getConnection(function(err, connection){	

		if(err)
		{
			connection.release();
			callback("ERROR: COULDN'T CONNECT", "err");
		}
		else
		{
			//console.log('QUERY: ' + mysql.format(inQuery, localInserts));

			//tries to insert the user's initial record into the db
			connection.query(mysql.format(inQuery, localInserts), function(err, rows, fields){
				
				//if we succeeded, insert each response into User_Responses
				if(!err)
				{	
					inQuery = "INSERT INTO USER_RESPONSES (USERID, SCENARIOID, TIME_COMPLETE, QUESTIONID, ANSWERID) VALUES ?";
					var values = [];
					var answers = JSON.parse(inserts[4]);
					var i = 0;

					//creates an array of arrays to insert each row into the db in one call. 
					for(i = 0; i < answers.length; i++)
					{
						values.push([inserts[0], inserts[1], inserts[2], pool.escape(i+1), pool.escape(answers[i])]);
					}

					//tries to insert the responses into the array
					connection.query(inQuery, [values], function(err, rows, fields){
			
						//if we succeeded, update the most recent fields
						if(!err)
						{
							//get the userid and scenarioid
							localInserts = [inserts[0], inserts[1]];
							//query; increments the most recent field by 1 for all rows with the specified userid and scenarioid
							inQuery = "UPDATE USER_SCENARIO_INFO SET MOST_RECENT = MOST_RECENT + 1 WHERE USERID = ? AND SCENARIOID = ?";

							//tries to update the rows
							connection.query(mysql.format(inQuery, localInserts), function(err, rows, fields){
			
								//if we succeeded, delete any rows with a most recent field greater than 9
								if(!err)
								{
									//prepare query. uses localInserts from the update
									inQuery = "DELETE FROM USER_SCENARIO_INFO WHERE USERID = ? AND SCENARIOID = ? AND MOST_RECENT > 9";

									//tries to delete the rows
									connection.query(mysql.format(inQuery, localInserts), function(err, rows, fields){
										
										//since it's the last query release the connection
										connection.release();
			
										if(!err)
										{
											callback("Success", null);
										}
										else
										{
											//console.log('ERR: PROBLEM WITH DELETE');
											callback("ERR: PROBLEM WITH DELETE", 'err');
										}
										
									});
								}
								else
								{
									connection.release();
									//console.log('ERR: PROBLEM WITH UPDATE');
									callback("ERR: PROBLEM WITH UPDATE", 'err');
								}
								
							});	
												
						}
						else
						{
							connection.release();
							//console.log('ERR: PROBLEM WITH INSERTING RESPONSES ' + inQuery + ' ' + values);
							callback("ERR: PROBLEM WITH INSERTING RESPONSES " + inQuery + ' ' +  values, 'err');
							
						}
						
					});
										
				}
				else
				{
					connection.release();
					//console.log('ERR: PROBLEM WITH INSERTING INSTANCE');
					callback("ERR: PROBLEM WITH INSERTING INSTANCE: " + inserts, 'err');
				}
				
			});
		}
		
			
	});


}

//inserts a scenario into the database using a JSON
exports.insertScenarioInfo = function insertScenarioInfo(json, cultureid, callback)
{
	//get first query initalized
	var inQuery = "INSERT INTO SCENARIOS VALUES('0',?,?,?,?,?)"
	//parepare the inserts
	var inserts = [pool.escape(cultureid), json.TITLE, json.DATE_CREATED, json.SUMMARY, json.MAX_SCORE];
	//for mass insertion
	var goals = [], availLang = [], questions = [], answers = [];
	var scenid;

	//looping through questions + answers
	var i = 0, j = 0;

	//connect to the db
	pool.getConnection(function(err, connection){	

		if(err)
		{
			connection.release();
			callback("ERROR: COULDN'T CONNECT");
		}
		else
		{
			//queries the db using inQuery
			console.log(mysql.format(inQuery, inserts));
			connection.query(mysql.format(inQuery, inserts), function(err, rows, fields){
				
				//if there wasn't an error, handle the result, otherwise something happened with connecting to db
				if(!err)
				{
					//tries to get the scenarioid after we insert it based on the cultureid and title (combined are unique)
					inQuery = 'SELECT SCENARIOID FROM SCENARIOS WHERE CULTUREID = ? AND TITLE = ?';
					inserts = [pool.escape(cultureid), json.TITLE];

					//tries to get the id
					connection.query(mysql.format(inQuery, inserts), function(err, rows, fields){
					
						//if we succeed try to insert the goals into the GOALS table
						if(!err)
						{
							scenid = rows[0].SCENARIOID;
							
							//prepares mass insertion by building array of arrays with info
							for(i = 0; i < json.GOALS.length; i++)
							{
								goals.push([pool.escape(scenid), json.GOALS[i].GOAL]);
							}

							//prepares query
							inQuery = 'INSERT INTO GOALS (SCENARIOID, GOAL) VALUES ?'

							//inserts goals into the db
							connection.query(inQuery, [goals], function(err, rows, fields){

								//if we succeed repeate the process for available languages
								if(!err)
								{
									for(i = 0; i < json.AVAILABLE_LANGUANGES.length; i++)
									{
										availLang.push([pool.escape(scenid), json.AVAILABLE_LANGUANGES[i].LANGUAGE]);
									}

									inQuery = 'INSERT INTO LANGUAGES (SCENARIOID, AVAIL_LANGUAGE) VALUES ?';
								
									//try to insert the available languages into the db
									connection.query(inQuery, [availLang], function(err, rows, fields){

										//if we succeeded, try to insert the questions and answers
										if(!err)
										{
											//get the relative indexes for the questions and answers. 
											for(i = 0; i < json.QUESTIONS.length; i++)
											{
												//builds the question inserts, initializing the id's to i+1
												questions.push([pool.escape(i+1), pool.escape(scenid), json.QUESTIONS[i].PROMPT]);
												//loops through each answer for the question i
												for(j = 0; j < json.QUESTIONS[i].ANSWERS.length; j++)
												{
													//builds the answers inserts, initializing the questions id to i+1 and answers id to j+1
													answers.push([pool.escape(j+1), pool.escape(i+1), pool.escape(scenid), json.QUESTIONS[i].ANSWERS[j].ANSWER, json.QUESTIONS[i].ANSWERS[j].SCORE, json.QUESTIONS[i].ANSWERS[j].REASONING]);
												}
											}

											//query for inserting questions
											inQuery = 'INSERT INTO QUESTIONS (QUESTIONID, SCENARIOID, PROMPT) VALUES ?';

											//tries to mass insert questions
											connection.query(inQuery, [questions], function(err, rows, fields){

												//if we succeed, try to finish it with inserting answers
												if(!err)
												{
													//get the answers query
													inQuery = 'INSERT INTO ANSWERS (ANSWERID, QUESTIONID, SCENARIOID, ANSWER, SCORE, REASONING) VALUES ?';
													
													//tries to mass insert answers into the db
													connection.query(inQuery, [answers], function(err, rows, fields){

														//release the connection since we're done
														connection.release();

														//return status
														if(!err)
														{
															callback('successfully added everything', null);
														}
														else
														{
															callback('ERR: COULD NOT INSERT ANSWERS', 'err');
														}
													
													});
												}
											});
										}
										else
										{
											connection.release();
											callback('ERR: COULD NOT INSERT AVAILABLE LANGUAGES', 'err');
										}
									
									});

								}
								else
								{
									connection.release();
									callback('ERR: COULD NOT ADD GOALS', 'err');
								}
							});
						}
						else
						{
							connection.release();
							callback('ERR: COULD FIND SCENARIO', 'err');
						}
						
					});
				}
				else
				{
					connection.release();
					callback('ERR: COULD NOT INSERT SCENARIO', 'err');
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
	var currTimeComplete = -1;
	var totalTime = 0;
	var i = 0;

	//loop through each row recieved from the db
	for(i = 0; i < str.length; i++)
	{
		
		//if the userid is still the current one, continue with that user's data
		if(currID == str[i].USERID)
		{
			//if the scenairoid and timestamp are the same, then add the new question + answer record
			if(currScenID == str[i].SCENARIOID && currTimeComplete == str[i].TIME_COMPLETE)
			{
				retString += ',{"QUESTIONID": "' + str[i].QUESTIONID  + '",';
				retString += '"PROMPT": "' + str[i].PROMPT + '",';
				retString += '"ANSWERID": "' + str[i].ANSWERID + '",';
				retString += '"ANSWER": "' + str[i].ANSWER + '"}';

			}
			//otherwise we're either in a new scenario or different playthrough. End the previous scenario and create a new one
			else
			{
				retString += ']},{"SCENARIOID": "' + str[i].SCENARIOID  + '",';
				retString += '"TITLE": "' + str[i].TITLE + '",';
				retString += '"TIME_PLAYED": "' + str[i].TIME_PLAYED + '",';
				retString += '"TIME_COMPLETE": "' + str[i].TIME_COMPLETE + '",';

				retString += '"QUESTIONS": [{"QUESTIONID": "' + str[i].QUESTIONID  + '",';
				retString += '"PROMPT": "' + str[i].PROMPT + '",';
				retString += '"ANSWERID": "' + str[i].ANSWERID + '",';
				retString += '"ANSWER": "' + str[i].ANSWER + '"}';

				currScenID = str[i].SCENARIOID;
				currTimeComplete = str[i].TIME_COMPLETE;
			}
		}
		//otherwise add a new user (always goes here when i = 0)
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
			retString += '"TIME_COMPLETE": "' + str[i].TIME_COMPLETE + '",';

			retString += '"QUESTIONS": [{"QUESTIONID": "' + str[i].QUESTIONID  + '",';
			retString += '"PROMPT": "' + str[i].PROMPT + '",';
			retString += '"ANSWERID": "' + str[i].ANSWERID + '",';
			retString += '"ANSWER": "' + str[i].ANSWER + '"}';
			
			//sets current data
			currID = str[i].USERID;
			currScenID = str[i].SCENARIOID;
			currTimeComplete = str[i].TIME_COMPLETE;

		}

		//console.log(i + ": " + retString);

	}

	//finishes the JSON
	retString += ']]}]}]}';

	callback(retString, null);

}

