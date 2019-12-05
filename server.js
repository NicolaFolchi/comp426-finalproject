let fs = require("fs");
let binData = fs.readFileSync("data.js");
let usrsData = fs.readFileSync('users.js');
let db = JSON.parse(binData);
let usrsDB = JSON.parse(usrsData);

// console.log(db);

console.log("server is up and running");

let express = require("express");
let app = express();
// used to parse the request body
let bodyParser = require("body-parser");
// used for the creation of unique id's for tuiter posts
const shortid = require('shortid');

const bcrypt = require('bcryptjs');

let server = app.listen(3000, () => {
    console.log('we out heree');
});

// this allows me to have express look into a folder 'public' and retrieve static files (html, imgs)
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// sending all of our posts data
app.get('/tuits', function (request, response) {
    response.send(db);
});
// sending all data from a specific post
app.get('/tuits/:tuit', function (request, response) {
    let tuitID = request.params.tuit;
    for (let i = 0; i < db.length; i++) {
        if (db[i]['id'] == tuitID) {
            response.send(db[i]);
            break;
        }
    }
})
// making a post to the feed
app.post('/tuits', function (request, response) {
    let reply = {
        status: 'success',
        tuitData: request.body
    };

    // adding needed properties to my tuits
    request.body['id'] = shortid.generate();
    request.body['author'] = "Nico";
    request.body['isLiked'] = false;
    request.body['retweetCount'] = 0;
    request.body['replyCount'] = 0;
    request.body['likeCount'] = 0;
    request.body['someLikes'] = 0;
    request.body['createdAt'] = (new Date());


    // CHECK FOR TYPE OF POST, IF RETWEET/REPLY THEN INCREASE PARENT RETWEET/REPLY COUNT
    if (request.body['type'] == 'retweet') {
        for (let i = 0; i < db.length; i++) {
            if (db[i]['id'] == request.body['parent']) {
                db[i]['retweetCount'] += 1;
            }
        }
    }

    if (request.body['type'] == 'reply') {
        for (let i = 0; i < db.length; i++) {
            if (db[i]['id'] == request.body['parent']) {
                db[i]['replyCount'] += 1;
            }
        }
    }
    // adding as first element to json file
    db.unshift(request.body);
    let data = JSON.stringify(db, null, 2);
    fs.writeFile("data.js", data, function (err, result) {
        if (err) console.log('error', err);
    });

    // console.log(reply);
    response.send(reply);
});
// signing up process
app.post("/users", async function (request, response) {
    // finding on user database if username or email already exist
    let checkExistingUsername = usrsDB.find(user => user.username == request.body.user);
    let checkExistingEmail = usrsDB.find(user => user.emailAddress == request.body.email);
    if (checkExistingUsername != null) {
        return response.status(400).send("Username/email is being used :(");
    }
    if (checkExistingEmail != null) {
        return response.status(400).send("Email is being used :(");
    }
    try {
        let username = request.body.user;
        let password = await bcrypt.hash(request.body.password, 10);
        let fName = request.body.fName;
        let lName = request.body.lName;
        let email = request.body.email;
        let userData = {
            username: username,
            password: password,
            firstName: fName,
            lastName: lName,
            emailAddress: email
        };

        // console.log(userData);
        // adding as first element to json file
        usrsDB.unshift(userData);
        let data = JSON.stringify(usrsDB, null, 2);
        fs.writeFile("users.js", data, function (err, result) {
            if (err) console.log('error', err);
        });
        // created
        response.status(201).send();

    } catch {
        // server issue :/
        response.status(500).send();
    }
});
// login process and user authorization
app.post('/login', async function (request, response) {
    let username = usrsDB.find(user => user.username === request.body.user);
    if (username != null) {
        try {
            // comparing our stored hashed password with the password the user is trying to log in with
            if (await bcrypt.compare(request.body.password, username.password)) {
                response.status(200).send('Success, you are now logged in');

            } else {
                response.status(400).send('Failed to log in, password incorrect');
            }
        } catch {
            response.status(500).send();
        }
    }
    else {
        return response.status(404).send('User not found');
    }
});

// ------------------ SPOTIFY API INTEGRATION ---------------------------

const request = require('request');
const client_id = 'af2ce6ca8d05496ebde76dff70598354';
const client_secret = 'f0e685f8afc441d6954d0321d73698e3';

// your application requests authorization
let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
    },
    form: {
        grant_type: 'client_credentials'
    },
    json: true
};

app.get('/getToken', function (req, res) {
    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {

            // use the access token to access the Spotify Web API
            let token = body.access_token;
            res.send(token);
        }
    });
});
// app.post('/tuitts', function (req, res) {
//     request.post(authOptions, function (error, response, body) {
//         if (!error && response.statusCode === 200) {

//             // use the access token to access the Spotify Web API
//             let token = body.access_token;
//             let options = {
//                 url: `https://api.spotify.com/v1/albums/${req.body.albumid}`,
//                 headers: {
//                     'Authorization': 'Bearer ' + token
//                 },
//                 json: true
//             };
//             console.log(req.body.albumid);
//             // console.log(body);
//             request.get(options, function (error, response, body) {
//                 console.log(body);
//             });
//         }
//     });
// });
