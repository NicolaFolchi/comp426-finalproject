// through this file is where our logged in user routes should be established as only logged in users will have access to
let express = require('express');
let router = express.Router();

router.get('/', function(request, response){
    response.sendFile(__dirname + '/app/feed.html');
    
})

module.exports = router;