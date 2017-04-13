var express = require('express');
var router = express.Router();

//API Listing
router.get('/', (req, res) => {
    res.send('api works');
});

module.exports = router;