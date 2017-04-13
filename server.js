//Dependencies
var express = require('express');
var path = require('path');
var http = require('http');
var bodyParser = require('body-parser');

//Variables
var port = process.env.PORT || '3005';

//Express setup
var app = express();

//API routes
var api = require('./server/routes/api');

//Parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
//Routes
app.use('/api', api)

//Static paths
app.use(express.static(path.join(__dirname,'dist')));

//'Catch all' for routes -- MUST COME AFTER ALL API ROUTES
app.get('*', (req,res) => {
   res.sendFile(path.join(__dirname, 'dist/index.html')); 
});

//Set port from environment -- default 3000
app.set('port', port);


//HTTP Server
var server = http.createServer(app);

//Listen to port
server.listen(port, function(){
    console.log(`API running on localhost: ${port}`);
});