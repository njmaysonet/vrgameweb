//Dependencies
var express = require('express');
var path = require('path');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');

//Variables
var port = process.env.PORT || '3000';

//Express setup
var app = express();

//API routes
var api = require('./server/routes/api');

//Allow Cross Origin
app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    next();
})

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

//Configuration of middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
    secret: 'hamboning',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: true}
}));
app.use(passport.initialize());
app.use(passport.session());

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send("{Error: " + err.message + "}")
  console.log(err.message);
});


//HTTP Server
var server = http.createServer(app);

//Listen to port
server.listen(port, function(){
    console.log(`API running on localhost: ${port}`);
});