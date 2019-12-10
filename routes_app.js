let express = require('express');
let router = express.Router();

router.get('/', function(request, response){
    response.sendFile(__dirname + '/app/feed.html');
    
})

module.exports = router;