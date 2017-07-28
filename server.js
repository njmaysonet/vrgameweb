//Dependencies
var express = require('express');
var path = require('path');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');

//Variables
var port = process.env.PORT || '3000';

//Express setup
var app = express();

//API routes
var api = require('./server/routes/api');

//Parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Allow Cross Origin
app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    next();
})

//Routes
app.use('/api', api)

//Configuration
app.configure(function(){
    app.use(express.cookieParse());
    app.use(express.bodyParser());
    app.use(express.session({secret: 'hamboning'}));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
});

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