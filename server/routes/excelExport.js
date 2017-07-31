var exceljs = require('exceljs');
var tempy = require('tempy');

exports.exportGroupScores = function exportGroupScores(inJson, callback)
{
    var workbook = new exceljs.Workbook();
    var worksheet = workbook.addWorksheet('My Sheet');

    worksheet.columns = [
        { header: 'UserID', key: 'id', width: 10 },
        { header: 'ScenarioID', key: 'scenid', width: 10 },
        { header: 'Score', key: 'usrScore', width: 10 },
        { header: 'MaxScore', key: 'maxscore', width: 10}
    ];

    console.log('I got ' + inJson);

    for(var i = 0; i < inJson.length; i++)
    {
        console.log(inJson[i].USERID + " " + inJson[i].SCENARIOID + " " + inJson[i].USER_SCORE + " " + inJson[i].MAX_SCORE);
        worksheet.addRow({id: inJson[i].USERID, scenid: inJson[i].SCENARIOID, usrScore: inJson[i].USER_SCORE, maxscore: inJson[i].MAX_SCORE});
    }
        
	callback(workbook, null);


}

exports.exportData = function exportData(scores, responses, callback)
{
    var workbook = new exceljs.Workbook();
    var worksheet = workbook.addWorksheet('data');

    var count = 0;
    var currScenario = -1;
    var currGroup = -1;

    inQuery = 'SELECT USERID, FIRSTNAME, LASTNAME, TIME_COMPLETE, TIME_PLAYED, SCENARIOID, SUM(SCORE) AS USER_SCORE, MAX_SCORE FROM USERS NATURAL JOIN USER_SCENARIO_INFO NATURAL JOIN USER_RESPONSES NATURAL JOIN SCENARIOS NATURAL JOIN QUESTIONS NATURAL JOIN ANSWERS NATURAL JOIN GROUP_MEMBERS WHERE (SCENARIOID = ? AND GROUPID = ?)';
    responsesQuery = 'SELECT SCENARIOID, QUESTIONID, PROMPT, ANSWERID, ANSWER, COUNT(USERID) AS NUMRESPONCES FROM USERS NATURAL JOIN SCENARIOS NATURAL JOIN QUESTIONS NATURAL JOIN ANSWERS NATURAL JOIN USER_RESPONSES NATURAL JOIN USER_SCENARIO_INFO NATURAL JOIN GROUPS WHERE (SCENARIOID = ? AND GROUPID = ?)';


    worksheet.addRow(['Group:', scores[0].GROUPID, scores[0].GROUP_NAME]);
    worksheet.addRow(['Scenario:', scores[0].SCENARIOID, scores[0].TITLE]);
    worksheet.addRow();
    worksheet.addRow(['USERID', 'FIRSTNAME', 'LASTNAME', 'TIME_COMPLETE', 'TOTAL_TIME', 'SCORE']);

    while(count < scores.length)
    {
        worksheet.addRow([scores[count].USERID, scores[count].FIRSTNAME, scores[count].LASTNAME, scores[count].TIME_COMPLETE, scores[count].TIME_PLAYED, scores[count].USER_SCORE]);

        count++;
    }

    count = 0;

    //scenarioid, questionid, prompt, answer, score, numresponses
    worksheet.addRow();
    worksheet.addRow(['ScenarioID', 'Question#', 'Prompt', 'Answer', 'Score', 'NumAnswers']);

    while(count < responses.length)
    {
        worksheet.addRow([responses[count].SCENARIOID, responses[count].QUESTIONID, responses[count].PROMPT, responses[count].ANSWER, responses[count].SCORE, responses[count].NUMRESPONCES]);

        count++;
    }

    while(count < scores.length || count < responses.length)
    {
        if(count == 0 || scores[count].GROUPID != currGroup || scores[count].SCENAIROID != currScenario)
        
        count++;        
    }

    callback(workbook, null);
}

exports.exportDataFull = function exportDataFull(scores, responses, answers, users, callback)
{

    //new excel workbook obj
    var workbook = new exceljs.Workbook();

    //counters for the respective queries
    var scoresCount = 0, responsesCount = 0, answersCount = 0, usersCount = 0;
    //marks where the answers array started for a given scenario
    var answersStart = 0;
    //holds the current scenario and group
    var currScenario = -1, currGroup = -1;


    //loops as long as we have scores and answers to parse
    while(scoresCount < scores.length || answersCount < answers.length)
    {
        //if either we haven't made a worksheet yet or we're between datasets, make a new workbook
        if((scoresCount == 0 && responsesCount == 0) || ((scoresCount < scores.length && (scores[scoresCount].GROUPID != currGroup || (scores[scoresCount].GROUPID == currGroup && scores[scoresCount].SCENARIOID != currScenario))) &&
           ((responsesCount < responses.length) && (responses[responsesCount].GROUPID != currGroup || (responses[responsesCount].GROUPID == currGroup && responses[responsesCount].SCENARIOID != currScenario))) && 
             (answersCount == answers.length || (answersCount < answers.length && answers[answersCount].SCENARIOID != currScenario))))
        {
            //if this isn't the first time, make another new worksheet with the user's full data in it
            if(!(scoresCount == 0 && responsesCount == 0) && usersCount < users.length)
            {
                //create a new worksheet with the groupid, scenarioid + data
                worksheet = workbook.addWorksheet(currGroup + ' ' + currScenario + ' data');

                //set column constraints
                worksheet.columns = [
                    {width: 15}, {width: 15}, {width: 15}, {width: 15}, {width: 16}, 
                    {width: 15}, {width: 15}, {width: 75}, {width: 25}, {width: 15}
                ];

                //init worksheet
                worksheet.addRow(['Group:', currGroup, users[usersCount].GROUP_NAME, '', '', '', 'Scenario:', users[usersCount].TITLE, currScenario,  '']);
                worksheet.addRow();
                worksheet.addRow(['USERID', 'USERNAME', 'FIRSTNAME', 'LASTNAME', 'TIME_COMPLETE', 'TOTAL_TIME', 'Question#', 'Prompt', 'Answer', 'Score']);
                
                //loop through the users who are part of the group and did the given scenario. Add the info into the worksheet
                while(usersCount < users.length && users[usersCount].GROUPID == currGroup && users[usersCount].SCENARIOID == currScenario)
                {
                    worksheet.addRow([users[usersCount].USERID, users[usersCount].USERNAME, users[usersCount].FIRSTNAME, users[usersCount].LASTNAME, users[usersCount].TIME_COMPLETE, users[usersCount].TIME_PLAYED,
                                      users[usersCount].QUESTIONID, users[usersCount].PROMPT, users[usersCount].ANSWER, users[usersCount].SCORE]);
                    usersCount++;
                }
            }

            //create a new worksheet with the new group and scenario
            worksheet = workbook.addWorksheet(scores[scoresCount].GROUPID + ' ' + scores[scoresCount].SCENARIOID);

            //set column constraints
            worksheet.columns = [
                {width: 15}, {width: 15}, {width: 15}, {width: 15}, {width: 16}, {width: 15}, {width: 15}, 
                {width: 15}, {width: 15}, {width: 75}, {width: 25}, {width: 15}, {width: 15}
            ];

            //init worksheet
            worksheet.addRow(['Group:', scores[scoresCount].GROUPID, scores[scoresCount].GROUP_NAME, '', '', '', '', '', 'Scenario:', scores[scoresCount].TITLE, scores[scoresCount].SCENARIOID]);
            worksheet.addRow();
            worksheet.addRow(['USERID', 'USERNAME', 'FIRSTNAME', 'LASTNAME', 'TIME_COMPLETE', 'TOTAL_TIME', 'SCORE', '', 'Question#', 'Prompt', 'Answer', 'Score', 'NumAnswers']);
            
            //if we're in the same scenario, restart the answers index, otherwise set the start to the new scenario
            if(currScenario == scores[scoresCount].SCENARIOID)
            {
                answersCount = answersStart;
            }
            else
            {
                answersStart = answersCount;
            }

            //set the current scenario/group
            currScenario = scores[scoresCount].SCENARIOID;
            currGroup = scores[scoresCount].GROUPID;
            
        }

       
        //check if there are any users left in the group for the scenario
        if((answersCount < answers.length) && (scoresCount >= scores.length || (scoresCount < scores.length && (scores[scoresCount].GROUPID != currGroup || (scores[scoresCount].GROUPID == currGroup && scores[scoresCount].SCENARIOID != currScenario)))))
        {
            //if at least one user selected the answer, use the responses table for the data
            if(responsesCount < responses.length && (answers[answersCount].SCENARIOID == responses[responsesCount].SCENARIOID && answers[answersCount].QUESTIONID == responses[responsesCount].QUESTIONID &&
               answers[answersCount].ANSWERID == responses[responsesCount].ANSWERID))
            {
                //add the row with the correct values
                worksheet.addRow(['','', '', '', '', '', '', '', 
                              responses[responsesCount].QUESTIONID, responses[responsesCount].PROMPT, responses[responsesCount].ANSWER, 
                              responses[responsesCount].SCORE, responses[responsesCount].NUMRESPONCES]);

                //increment the responsesCount since we found a valid response
                responsesCount++;
                              
            }
            //otherwise if no one selected the answer, it's missing from responses, so get it from answers and set the num_responses = 0
            else
            {
                worksheet.addRow(['','', '', '', '', '', '', '', 
                              answers[answersCount].QUESTIONID, answers[answersCount].PROMPT, answers[answersCount].ANSWER, 
                              answers[answersCount].SCORE, 0]);

            }
            
            //increment answers since no matter what we find an answer
            answersCount++;
        }
        //otherwise if there are no more answers, do a row with only user data
        else if(scoresCount < scores.length && ((answersCount >= answers.length && responsesCount >= responses.length) || (responsesCount < responses.length && (responses[responsesCount].GROUPID != currGroup || (responses[responsesCount].GROUPID == currGroup && responses[responsesCount].SCENARIOID != currScenario)))))
        {
            //insert the row and incrememnt scoresCount
            worksheet.addRow([scores[scoresCount].USERID, scores[scoresCount].USERNAME, scores[scoresCount].FIRSTNAME, scores[scoresCount].LASTNAME, 
                              scores[scoresCount].TIME_COMPLETE, scores[scoresCount].TIME_PLAYED, scores[scoresCount].USER_SCORE, '', '', '', '', '', '']);
            scoresCount++;
        }
        //otherwise the row has both scores and responses
        else if(answersCount < answers.length && scoresCount < scores.length && answersCount < answers.length)
        {
            //if there's an answer with at least one response, use the responses query result for the right side
            if(responsesCount < responses.length && (answers[answersCount].SCENARIOID == responses[responsesCount].SCENARIOID && answers[answersCount].QUESTIONID == responses[responsesCount].QUESTIONID &&
               answers[answersCount].ANSWERID == responses[responsesCount].ANSWERID))
            {
                worksheet.addRow([scores[scoresCount].USERID, scores[scoresCount].USERNAME, scores[scoresCount].FIRSTNAME, scores[scoresCount].LASTNAME, 
                              scores[scoresCount].TIME_COMPLETE, scores[scoresCount].TIME_PLAYED, scores[scoresCount].USER_SCORE, '', 
                              responses[responsesCount].QUESTIONID, responses[responsesCount].PROMPT, responses[responsesCount].ANSWER, 
                              responses[responsesCount].SCORE, responses[responsesCount].NUMRESPONCES]);

                responsesCount++;
                              
            }
            //otherwise no one answered the given answer, so use the answers query result to fill in the missing data and set num_responses = 0
            else
            {
                worksheet.addRow([scores[scoresCount].USERID, scores[scoresCount].USERNAME, scores[scoresCount].FIRSTNAME, scores[scoresCount].LASTNAME, 
                              scores[scoresCount].TIME_COMPLETE, scores[scoresCount].TIME_PLAYED, scores[scoresCount].USER_SCORE, '', 
                              answers[answersCount].QUESTIONID, answers[answersCount].PROMPT, answers[answersCount].ANSWER, 
                              answers[answersCount].SCORE, 0]);
            }
            

            //increment scores and count since we got a new user + answer
            scoresCount++;
            answersCount++;
        }
        //otherwise pray you don't get here because this just hopes you don't infinitely loop somehow you naughty person
        else
        {
            responsesCount++;
            scoresCount++;
            answersCount++;
        }      
    }

    //for the last page create the user data page (same code as above)
    if(usersCount < users.length)
    {
        worksheet = workbook.addWorksheet(currGroup + ' ' + currScenario + ' data');

        worksheet.columns = [
            {width: 15}, {width: 15}, {width: 15}, {width: 15}, {width: 16}, 
            {width: 15}, {width: 15}, {width: 75}, {width: 25}, {width: 15}
        ];

        worksheet.addRow(['Group:', currGroup, users[usersCount].GROUP_NAME, '', '', '', 'Scenario:', users[usersCount].TITLE, currScenario, '']);
        worksheet.addRow();
        worksheet.addRow(['USERID', 'USERNAME', 'FIRSTNAME', 'LASTNAME', 'TIME_COMPLETE', 'TOTAL_TIME', 'Question#', 'Prompt', 'Answer', 'Score']);
        
        while(usersCount < users.length && users[usersCount].GROUPID == currGroup && users[usersCount].SCENARIOID == currScenario)
        {
            worksheet.addRow([users[usersCount].USERID, users[usersCount].USERNAME, users[usersCount].FIRSTNAME, users[usersCount].LASTNAME, users[usersCount].TIME_COMPLETE, users[usersCount].TIME_PLAYED,
                                users[usersCount].QUESTIONID, users[usersCount].PROMPT, users[usersCount].ANSWER, users[usersCount].SCORE]);
            usersCount++;
        }
    }
    //then return
    callback(workbook, null); 
}
