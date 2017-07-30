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
    var worksheet = workbook.addWorksheet('My Sheet');

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

exports.exportData2 = function exportData2(scores, responses, callback)
{

    var workbook = new exceljs.Workbook();

    var scoresCount = 0;
    var responsesCount = 0;
    var currScenario = -1;
    var currGroup = -1;

    while(scoresCount < scores.length || responsesCount < responses.length)
    {
        //console.log(scoresCount + ' ' + responsesCount);
        if((scoresCount == 0 && responsesCount == 0) || ((scoresCount < scores.length && (scores[scoresCount].GROUPID != currGroup || (scores[scoresCount].GROUPID == currGroup && scores[scoresCount].SCENARIOID != currScenario))) &&
           (responsesCount < responses.length && (responses[responsesCount].GROUPID != currGroup || (responses[responsesCount].GROUPID == currGroup && responses[responsesCount].SCENARIOID != currScenario)))))
        {
            //make new page
            console.log('init page');
            worksheet = workbook.addWorksheet(scores[scoresCount].GROUPID + ' ' + scores[scoresCount].SCENARIOID);

            worksheet.columns = [
                {width: 15}, {width: 15}, {width: 15}, {width: 15}, {width: 16}, {width: 15}, {width: 15}, 
                {width: 15}, {width: 15}, {width: 75}, {width: 25}, {width: 15}, {width: 15}
            ];

            worksheet.addRow(['Group:', scores[scoresCount].GROUPID, scores[scoresCount].GROUP_NAME, '', '', '', '', '', 'Scenario:', scores[scoresCount].TITLE, scores[scoresCount].SCENARIOID]);
            worksheet.addRow();
            worksheet.addRow(['USERID', 'USERNAME', 'FIRSTNAME', 'LASTNAME', 'TIME_COMPLETE', 'TOTAL_TIME', 'SCORE', '', 'Question#', 'Prompt', 'Answer', 'Score', 'NumAnswers']);
            currScenario = scores[scoresCount].SCENARIOID;
            currGroup = scores[scoresCount].GROUPID;
        }

       
        if(responsesCount < responses.length && (scoresCount >= scores.length || (scoresCount < scores.length && (scores[scoresCount].GROUPID != currGroup || (scores[scoresCount].GROUPID == currGroup && scores[scoresCount].SCENARIOID != currScenario)))))
        {
            console.log('responses only row');
            worksheet.addRow(['','', '', '', '', '', '', '', 
                              responses[responsesCount].QUESTIONID, responses[responsesCount].PROMPT, responses[responsesCount].ANSWER, 
                              responses[responsesCount].SCORE, responses[responsesCount].NUMRESPONCES]);
            responsesCount++;
        }
        else if(scoresCount < scores.length && (responsesCount >= responses.length || (responsesCount < responses.length && (responses[responsesCount].GROUPID != currGroup || (responses[responsesCount].GROUPID == currGroup && responses[responsesCount].SCENARIOID != currScenario)))))
        {
            console.log('scores only row');
            worksheet.addRow([scores[scoresCount].USERID, scores[scoresCount].USERNAME, scores[scoresCount].FIRSTNAME, scores[scoresCount].LASTNAME, 
                              scores[scoresCount].TIME_COMPLETE, scores[scoresCount].TIME_PLAYED, scores[scoresCount].USER_SCORE, '', '', '', '', '', '']);
            scoresCount++;
        }
        else if(responsesCount < responses.length && scoresCount < scores.length)
        {
            console.log('everything row');
            worksheet.addRow([scores[scoresCount].USERID, scores[scoresCount].USERNAME, scores[scoresCount].FIRSTNAME, scores[scoresCount].LASTNAME, 
                              scores[scoresCount].TIME_COMPLETE, scores[scoresCount].TIME_PLAYED, scores[scoresCount].USER_SCORE, '', 
                              responses[responsesCount].QUESTIONID, responses[responsesCount].PROMPT, responses[responsesCount].ANSWER, 
                              responses[responsesCount].SCORE, responses[responsesCount].NUMRESPONCES]);

            responsesCount++;
            scoresCount++;
        }
        else
        {
            console.log('idk fix something');
            responsesCount++;
            scoresCount++;

        }      
    }


    callback(workbook, null);
}