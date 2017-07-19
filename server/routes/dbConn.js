var mysql = require('mysql');

var pool = mysql.createPool({
	connectionLimit: 1000,
	//host: "10.171.204.166",
	host: "localhost",
	user: "root",
	password: "Bulb$asaur5m",
	database: "culturalvrupdate", 
})


exports.queryDB = function queryDB(inQuery, val, callback)
{
	
	pool.getConnection(function(err, connection){	

		//query: userQuery = mySql query, err = error state, rows = data, fields = attributes (if needed)
		connection.query(inQuery, val, function(err, rows, fields){
			
			connection.release();

			if(!err)
			{
				
				if(rows.length != 0)
				{	
					callback(rows , null);
				}
				else
				{
					callback("ERROR: NO MATCHES FOUND " + val, "err");
				}
				
									
			}
			else
			{
				console.log('connection problem');
			}
			
		});
		
		connection.on('error', function(error){
			return;
		});
			
	});
}

//	var userQuery = "SELECT USERID, DATE_JOINED, TIME_PLAYED, PROFILE_PIC, EMAIL_ADDR, SCENARIOID, TITLE,  TIME_PLAYED, QUESTIONID, PROMPT, ANSWERID, ANSWER" + 
	" FROM USERS NATURAL JOIN SCENARIO NATURAL JOIN USER_SCENARIO_INFO NATURAL JOIN QUESTIONS NATURAL JOIN ANSWERS NATURAL JOIN USER_RESPONSES WHERE USERID = ?";


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


/*
{
	"players": [
		{"USERID": 1,
		 "DATE_JOINED": Tue May 30 2017 00:00:00 GMT-0400 (Eastern Daylight Time),
		 "PROFILE_PIC": /wand.png,
		 "EMAIL_ADDR": HGranger@gmail.com,
		 "SCENARIOS": [
			 {"SCENARIOID": 1,
			  "TITLE": Ordering Food at a Restaurant,
			  "TIME_PLAYED": 01:30:30,
			  "QUESTIONS": [
				  {"QUESTIONID": 1,
				   "PROMPT": What do you call the person serving your table?,
				   "ANSWERID": 1,
				   "ANSWER": Person
				  },
				  {"QUESTIONID": 2,
				   "PROMPT": How much should you usually tip for a meal?,
				   "ANSWERID": 5,
				   "ANSWER": 15-25%
				  }
			   ],
			{"SCENARIOID": 3,
			 "TITLE": Checking into a Hotel,
			 "TIME_PLAYED": 01:14:30,
			 "QUESTIONS": [
				 {"QUESTIONID": 5,
				  "PROMPT": What item is often on the service desk to ask for help?,
				  "ANSWERID": 14,
				  "ANSWER": Megaphone
				 },
				 {"QUESTIONID": 6,
				  "PROMPT": How should you thank an employee of the hotel if they bring your bags to your room?,
				  "ANSWERID": 18,
				  "ANSWER": Thank them}
			 ]
		 ]
			}
	]
}

*/
