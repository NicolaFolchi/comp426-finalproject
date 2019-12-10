let fs = require("fs");
let binData = fs.readFileSync("data.json");
let usrsData = fs.readFileSync('users.json');
let db = JSON.parse(binData);
let usrsDB = JSON.parse(usrsData);

// console.log(db);

console.log("server is up and running");

let express = require("express");
// used to parse the request body
let bodyParser = require("body-parser");
// used for the creation of unique id's for tuiter posts
const shortid = require('shortid');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const User = require('./models/user').User;
const router_app = require('./routes_app');
const session_middleware = require('./middlewares/session');
const passport = require('passport');

let app = express();

let server = app.listen(3000, () => {
    console.log('we out heree');
});

// this allows me to have express look into a folder 'public' and retrieve static files (html, imgs)
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(session({
    secret: 'swofhigryaefqwn',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// sending all of our posts data
app.get('/tuits', function (request, response) {
    console.log(request.session.user_id);
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
    request.body['author'] = request.session.user_username;
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
    fs.writeFile("data.json", data, function (err, result) {
        if (err) console.log('error', err);
    });

    // console.log(reply);
    response.send(reply);
});
// signing up process
app.post("/users", async function (request, response) {
    // finding if username or email already exist on user database
    User.find({ $or: [{ username: request.body.username }, { emailAddress: request.body.email }] }, async function (err, userd) {
        if (!userd.length) {
            try {
                let username = request.body.username;
                let password = await bcrypt.hash(request.body.password, 10);
                // let password = request.body.password;
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

                // creating user on mongodb
                let user = new User(userData);
                user.save(function (err, user, ) {
                    if (err) {
                        console.log(String(err));
                        response.status(400).send(String(err));
                    } else {
                        console.log('todo bien');
                        // created
                        response.status(201).send();
                    }
                })
                // User.find(function (err, doc) {
                // console.log(doc);
                // });
                // console.log(userd);

            } catch {
                // server issue :/
                response.status(500).send();
            }
        } else {
            console.log(userd);
            response.status(400).send("Username/Email are being used  :/");
        }
    })
});

// login process and user authorization
app.post('/login', function (request, response) {

    User.find({ username: request.body.username }, async function (err, userd) {
        if (!userd.length) {
            return response.status(404).send('User not found');
        }
        try {
            if (await bcrypt.compare(request.body.password, userd[0].password)) {
                console.log(userd[0]._id);
                request.session.user_id = userd[0]._id;
                request.session.user_username = userd[0].username;
                request.session.user_obj = userd[0];
                console.log(request.session.user_id);
                return response.redirect('/')
                // response.send("HOLA MUNDO HERMOSO");
            } else {
                response.status(400).send('Failed to log in, password incorrect');
            }
        } catch {
            response.status(500).send("something weird happened  :s");
        }
    })
    // User.find( {username: request.session.user_username}, function(err,usr){
    //     console.log(usr);
    //     console.log(request.session.user_username);
    // })
});
// sending logged in user info to front-end
app.get('/getLoggedInUser', function (request, response) {
    response.send(request.session.user_obj);
});

app.delete('/users', function (request, response) {
    // redirecting to home
    response.sendFile(__dirname + '/public/index.html');
    // deleting the user on the db
    User.findByIdAndRemove({ _id: request.session.user_id }, function (err) {
        if (err) {
            console.log(err);
            return response.status(500).send();
        }
        return response.status(200).send()
    });
    // killing the cookie session
    request.session.destroy(function (err) {
        if (err) {
            console.log(err);
            return response.status(500).send()
        }
        return response.status(200).send();
    });
});

app.post('/logout', function(request, response){
    response.sendFile(__dirname + '/public/index.html');
    // killing the cookie session
    request.session.destroy(function (err) {
        if (err) {
            console.log(err);
            return response.status(500).send()
        }
        return response.status(200).send();
    });
} )
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

app.use('/app', session_middleware);
app.use('/app', router_app);