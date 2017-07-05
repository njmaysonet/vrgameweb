var express = require('express');
var router = express.Router();
var data = require('../data/players.json');

//API Listing
router.get('/', (req, res) => {
    res.send('api works');
});

//To-Do Add Query Functionality
router.get('/data', (req, res) => {
    res.send(data);
})

module.exports = router;