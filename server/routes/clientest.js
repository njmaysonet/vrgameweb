var Client = require('mysql').Client;
var client = new Client(); 
client.host ='10.171.204.166';
client.user = 'root';
client.password = 'student';
console.log("connecting...");
client.connect(function(err, results) {
    if (err) {
        console.log("ERROR: " + err.message);
        throw err;
    }
    console.log("connected.");
    clientConnected(client);
});

clientConnected = function(client)
{
	tableHasData(client);
}           


tableHasData = function(client)
{
    client.query(
        'SELECT * FROM USERS LIMIT 0,10',
        function selectCb(err, results, fields) {
            if (err) {
                console.log("ERROR: " + err.message);
                throw err;
            }
            console.log("Got "+results.length+" Rows:");
            for(var i in results){
			 
				console.log(results[i]); 
				console.log('\n');
				
            //console.log("The meta data about the columns:");
            //console.log(fields);     
			}
            client.end();
        });
};