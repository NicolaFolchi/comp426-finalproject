export const renderSite = function () {
    renderTweet();
    $("#fixedbutton").on("click", postTweet);
    $("#tweetbutton").on("click", typeTweet);
    $("#submiteditbutton").on("click", submitEdit);
    $("#make_search").click(makeSearch);
    $("#log-out-button").click(handleLogOut);
}

export const getProfile = async function() {
    let result = await axios({
        method: 'get',
        url: 'http://localhost:3000/getLoggedInUser',
    });
    return result;
}

export const handleLogOut = async function () {
    await axios({
        method: 'post',
        url: 'http://localhost:3000/logout'
    });
    document.location.href = '../index.html';
}

export const getTrack = async function (id, token) {
    const result = await axios({
        method: 'get',
        url: `https://api.spotify.com/v1/tracks/${id}`,
        headers: {
            'Authorization': 'Bearer ' + token
        },
        json: true
    });
    return result;
}

export const getAlbum = async function (id, token) {
    const result = await axios({
        method: 'get',
        url: `https://api.spotify.com/v1/albums/${id}`,
        headers: {
            'Authorization': 'Bearer ' + token
        },
        json: true
    });
    return result;
}

export const renderTrackResult = async function (id, token) {
    let track_json = await getTrack(id, token);
    let track = track_json.data;
    let post = `
        <a href="/track_page/index.html?id=${id}">
        <div class="card">
            <div class="card-image">
                <figure class="image">
                    <img src="${track.album.images[0].url}" style="height: 50%; width: 50%;">
                </figure>
            </div>
            <div class="card-content">
                <div class="media">
                    <div class="media-content">
                        <p class="title is-4">${track.name}</p>
                        <p class="subtitle is-6">${track.album.name}</p>
                        <p class="subtitle is-6">${track.artists[0].name}</p>
                        <p class="subtitle is-6">Average Rating: alskdfjlasf</p>
                    </div>
                </div>
            </div>
        </div>
        </a>
        <br>
    `;
    $(".search_results").append(post);
}

export const renderAlbumResult = async function (id, token) {
    let album_json = await getAlbum(id, token);
    let album = album_json.data;
    let post = `
        <a href="/album_page/index.html?id=${id}">
        <div class="card">
            <div class="card-image">
                <figure class="image">
                    <img src="${album.images[0].url}" style="height: 50%; width: 50%;">
                </figure>
            </div>
            <div class="card-content">
                <div class="media">
                    <div class="media-content">
                        <p class="title is-4">${album.name}</p>
                        <p class="subtitle is-6">${album.artists[0].name}</p>
                        <p class="subtitle is-6">Average Rating: alskdfjlasf</p>
                    </div>
                </div>
            </div>
        </div>
        </a>
        <br>
    `;
    $(".search_results").append(post);
}

export const makeSearch = async function () {
    let type = $("#search_type").val();
    let search_text = $("#search_text").val();
    document.location.href = `./search_page/index.html?q=${search_text}&t=${type}`;
}

async function renderTweet() {
    //--------------------------- AUTHENTICATION ----------------------------
    const auth = await axios({
        method: 'get',
        url: 'http://localhost:3000/getToken',
        json: true
    });
    let token = auth["data"];

    let prof = await getProfile();
    let profile = prof.data;
    if(profile.username == null) {
        $("#logged-out-buttons").attr("style", "display: relative;");
        $("#logged-in-buttons").attr("style", "display: none;");
    }
    else {
        $("#logged-out-buttons").attr("style", "display: none;");
        $("#logged-in-buttons").attr("style", "display: relative;");
    }

    const $root = $('#root');
    $root.html("");

    // getting all tweets from the server
    const result = (await axios({
        method: 'get',
        url: 'http://localhost:3000/tuits',
        withCredentials: true,
    })).data;
    // alert(result[0].type)
    // alert(result[0]["spotify-id"])
    // dynamically rendering all of the 50 newest tweets with their respective card provided by bulma
    let tweets = `<div id="tweets">`;
    for (let i = 0; i < 20; i++) {
        // if I created this tweet, then:
        // if (result.data[i]["isMine"] == true) {
        //     tweets += `
        //     <br>
        //     <div class="card" id="${result.data[i]["id"]}">
        //         <div class="card-content">
        //             <div class="media">
        //             <div class="media-left">
        //                 <figure class="image is-48x48">
        //                 <img src="https://bulma.io/images/placeholders/96x96.png" alt="Placeholder image">
        //                 </figure>
        //             </div>
        //             <div class="media-content">
        //                 <p class="title is-4">${result.data[i]["author"]}</p>
        //                 <p class="subtitle is-6">@${result.data[i]["author"]}</p>
        //             </div>
        //         </div>

        //         <div class="content">
        //             ${result.data[i]["body"]}
        //             <br>
        //             <p>${new Date(result.data[i]["createdAt"]).toLocaleDateString()}<p>
        //         </div>
        //         <footer class="card-footer">
        //                 <a class="card-footer-item myLikeButtons" data-id="${result.data[i]["id"]}" data-likeStatus="${result.data[i]["isLiked"]}">Like ${result.data[i]["likeCount"]}</a>
        //                 <a class="card-footer-item myRetweetButtons" data-id="${result.data[i]["id"]}" data-text="${result.data[i]["body"]}">Retweet ${result.data[i]["retweetCount"]} </a>
        //                 <a class="card-footer-item myReplyButtons" data-id="${result.data[i]["id"]}" data-text="${result.data[i]["body"]}">Reply ${result.data[i]["replyCount"]}</a>
        //                 <a  class="card-footer-item myEditButtons" data-id="${result.data[i]["id"]}" data-text="${result.data[i]["body"]}">Edit</a>
        //                 <a class="card-footer-item myDeleteButtons" data-id="${result.data[i]["id"]}">Delete</a>
        //         </footer>
        //     </div>`;
        // } else {
            let stars = ``;
                switch (result[i].rating) {
                    case "0.5":
                    stars =`<i class="star fas fa-star-half"></i>`;
                    break;

                    case "1":
                    stars =`<i class="star fas fa-star"></i>`;
                    break;

                    case "1.5":
                    stars = `<i class="star fas fa-star"></i><i class="star fas fa-star-half"></i>`;
                    break;

                    case "2":
                    stars = `<i class="star fas fa-star"></i><i class="star fas fa-star"></i>`;
                    break;

                    case "2.5":
                    stars = `<i class="star fas fa-star"></i><i class="star fas fa-star"></i><i class="star fas fa-star-half"></i>`;
                    break;

                    case "3":
                        stars= `<i class="star fas fa-star"></i><i class="star fas fa-star"></i><i class="star fas fa-star"></i>`;
                        break;

                    case "3.5":
                        stars =`<i class="star fas fa-star"></i><i class="star fas fa-star"></i><i class="star fas fa-star"></i><i class="star fas fa-star-half"></i>`;
                        break;

                    case "4":
                        stars = `<i class="star fas fa-star"></i><i class="star fas fa-star"></i><i class="star fas fa-star"></i><i class="star fas fa-star"></i>`;
                        break;

                    case "4.5":
                        stars = `<i class="star fas fa-star"></i><i class="star fas fa-star"></i><i class="star fas fa-star"></i><i class="star fas fa-star"></i><i class="star fas fa-star-half"></i>`;
                        break;

                    case "5":
                        stars = `<i class="star fas fa-star"></i><i class="star fas fa-star"></i><i class="star fas fa-star"></i><i class="star fas fa-star"></i><i class="star fas fa-star"></i>`;
                        break;

                    default:
                        break;
                }
            if(result[i]["type"] == "track"){
                let track = (await getTrack(result[i]["spotify-id"], token)).data;
                tweets += `
                <br>
                <div class="card" id="${result[i]["id"]}" style="display: flex; flex-direction: column;">
                    <div class="card-image">
                        <div style="float: left; width: 50%; padding:10px; text-align:center;">
                            <img src="${track.album.images[0].url}"> 
                            <p class="title is-4">${track.name}</p>
                            <p class="subtitle is-6">${track.album.artists[0].name}</p>
                            <a class = "button is-primary is-small" href="/track_page/index.html?id=${result[i]["spotify-id"]}" style = "margin-top: -18px;" >See Track Page</a>                       
                        </div>
                        <div style="float: left; width: 50%; padding:5px;">
                            <p class="title is-2">${result[i].authorFirstName} ${result[i].authorLastName}</p>
                            <p class="subtitle is-4">@${result[i].authorUsername}</p><br>
    
                            <div class="content">
                            <p class = "is-size-4">${result[i].review}</p>
                            <div class = "content" style = "margin-top: 90px;">
                            <p class = "is-size-4" id = "${result[i]["id"]}-rating">${stars}</p>
                            <p class = "is-size-6 is-italic">${new Date(result[i]["createdAt"]).toLocaleTimeString()}  --  ${new Date(result[i]["createdAt"]).toLocaleDateString()}<p>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            }
            else if(result[i]["type"] == "album"){
                let album = (await getAlbum(result[i]["spotify-id"], token)).data;
                tweets += `
                <br>
                <div class="card" id="${result[i]["id"]}" style="display: flex; flex-direction: column;">
                    <div class="card-image">
                        <div style="float: left; width: 50%; padding:10px; text-align:center;">
                            <img src="${album.images[0].url}"> 
                            <p class="title is-4">${album.name}</p>
                            <p class="subtitle is-6">${album.artists[0].name}</p>
                            <a class = "button is-primary is-small" href="/album_page/index.html?id=${result[i]["spotify-id"]}" style = "margin-top: -18px;" >See Album Page</a>                       
                        </div>
                        <div style="float: left; width: 50%; padding:5px;">
                            <p class="title is-2">${result[i].authorFirstName} ${result[i].authorLastName}</p>
                            <p class="subtitle is-4">@${result[i].authorUsername}</p><br>
    
                            <div class="content">
                                <p class = "is-size-4">${result[i].review}</p>
                                <div class = "content" style = "margin-top: 90px;">
                                <p class = "is-size-4" id = "${result[i]["id"]}-rating">${stars}</p>
                                <p class = "is-size-6 is-italic">${new Date(result[i]["createdAt"]).toLocaleTimeString()}  --  ${new Date(result[i]["createdAt"]).toLocaleDateString()}<p>
                                </div>
                                </div>
                        </div>
                    </div>
                </div>`;
                
            }
        // tweets += `
        //     <br>
        //     <div class="card" id="${result.data[i]["id"]}">
        //         <div class="card-content">
        //             <div class="media">
        //             <div class="media-left">
        //                 <figure class="image is-48x48">
        //                 <img src="https://bulma.io/images/placeholders/96x96.png" alt="Placeholder image">
        //                 </figure>
        //             </div>
        //             <div class="media-content" id="author${result.data[i]["id"]}">
        //                 <p class="title is-4">${result.data[i]["author"]}</p>
        //                 <p class="subtitle is-6">@${result.data[i]["author"]}</p>
        //             </div>
        //         </div>

        //         <div class="content">
        //             ${result.data[i]["body"]}
                    
        //             <br>
        //             <p>${new Date(result.data[i]["createdAt"]).toLocaleTimeString()}  --  ${new Date(result.data[i]["createdAt"]).toLocaleDateString()}<p>
        //         </div>
        //         <footer class="card-footer">
        //                 <a class="card-footer-item myLikeButtons ${result.data[i]["isLiked"]}" id="likeButton${result.data[i]["id"]}" data-id="${result.data[i]["id"]}" data-likeStatus="${result.data[i]["isLiked"]}">Like ${result.data[i]["likeCount"]}</a>
        //                 <a class="card-footer-item myRetweetButtons" data-id="${result.data[i]["id"]}" data-text="${result.data[i]["body"]}">Retweet ${result.data[i]["retweetCount"]} </a>
        //                 <a class="card-footer-item myReplyButtons" data-id="${result.data[i]["id"]}" data-text="${result.data[i]["body"]}">Reply ${result.data[i]["replyCount"]}</a>
        //         </footer>
        //     </div>`;
        // }
        // here I append each generated tweet to a div variable that would then be appended to the root
        tweets += `</div>`;
    }
    $root.append(tweets);
    // listen for all of the buttons on each tweet 
    $(".myEditButtons").on("click", editArea);
    $(".myDeleteButtons").on("click", deleteTweet);
    $(".myLikeButtons").on("click", likeToggle);
    $(".myReplyButtons").on("click", replyArea);
    $(".myRetweetButtons").on("click", retweetArea);
}

async function retweetTweet(event) {
    // through this data attr I get the ID of the clicked card/tweet
    let x = event.target.getAttribute("data-card");
    // Getting the specific tweet to be then appended to the retweet
    const retweet = await axios({
        method: 'get',
        url: 'http://localhost:3000/tuits/' + x,
        withCredentials: true,
    });

    // getting the value of whatever the user wrote on the text area
    let message = $("#myretweetarea").val();
    let link = "http://localhost:3000/tuits";
    const result = await axios({
        method: 'post',
        url: link,
        withCredentials: true,
        data: {
            "type": "retweet",
            "parent": x,
            // appending to the retweet whatever the user wants to comment plus the previous tweet body and author
            "body": `${message}<br><strong>Retweet from:</strong> @${retweet.data["author"]}<p>${retweet.data["body"]}</p>`
        },
    });
    // clearing the body so we then render the 50 newest tweets
    document.getElementById("root").innerHTML = '';
    renderTweet();
}
function retweetArea(event) {
    // gets id of the specific clicked tweet
    let x = event.target.getAttribute("data-id");
    let tweetBody = event.target.getAttribute("data-text");
    // here I create a new textarea and I append it to the tweet card so users can comment and then post. 
    // Therefore, if the id of that textarea does not exist; create one. if it does; remove it
    // this allows the button act as a toggle
    let tweetEditArea = document.getElementById("retweet_area_exists");
    if (tweetEditArea) {
        $("#retweet_area_exists").replaceWith("");
    }
    else {
        $("#" + x).append(`
        <div id="retweet_area_exists">
            <textarea class="textarea" id="myretweetarea" placeholder="what are you thinking?"></textarea>
            <button class="button is-success is-light" id="submitretweetbutton" data-card="${x}">Retweet</button>
        </div>`);
    }
    // listen for the created button
    $("#submitretweetbutton").on("click", retweetTweet);
}

async function replyTweet(event) {
    // through this data attr I get the ID of the clicked card/tweet
    let x = event.target.getAttribute("data-card");
    // Getting the specific tweet to be then appended to the retweet
    const reply = await axios({
        method: 'get',
        url: 'http://localhost:3000/tuits/' + x,
        withCredentials: true,
    });
    // getting the value of whatever the user wrote on the text area
    let message = $("#myreplyarea").val();
    let link = "http://localhost:3000/tuits";
    const result = await axios({
        method: 'post',
        url: link,
        withCredentials: true,
        data: {
            "type": "reply",
            "parent": x,
            // appending to the reply whatever the user wants to comment plus the previous tweet body and author
            "body": `${message}<br><strong>Reply to:</strong> @${reply.data["author"]}<p>${reply.data["body"]}</p>`
        },
    });
    document.getElementById("root").innerHTML = '';
    renderTweet();
}

function replyArea(event) {
    // gets id of the specific clicked tweet
    let x = event.target.getAttribute("data-id");
    let tweetBody = event.target.getAttribute("data-text");
    // here I create a new textarea and I append it to the tweet card so users can comment and then post. 
    // Therefore, if the id of that textarea does not exist; create one. if it does; remove it
    // this allows the button act as a toggle
    let tweetEditArea = document.getElementById("reply_area_exists");
    if (tweetEditArea) {
        $("#reply_area_exists").replaceWith("");
    }
    else {
        $("#" + x).append(`
        <div id="reply_area_exists">
            <textarea class="textarea" id="myreplyarea" placeholder="what are you thinking?"></textarea>
            <button class="button is-success is-light" id="submitreplybutton" data-card="${x}">Reply</button>
        </div>`);
    }
    // listen for the created button
    $("#submitreplybutton").on("click", replyTweet);
}

async function likeToggle(event) {
    // gets id of the specific clicked tweet
    let x = event.target.getAttribute("data-id");
    // gets boolean regarding if the tweet is liked or not
    let isLiked = event.target.getAttribute("data-likeStatus");
    // if is not liked then update server and add tweet to liked tweets
    if (isLiked == "false") {
        let link = "https://comp426fa19.cs.unc.edu/a09/tweets/" + x + "/like";
        const result = await axios({
            method: 'put',
            url: link,
            withCredentials: true,
        });
    } else {
        let link = "https://comp426fa19.cs.unc.edu/a09/tweets/" + x + "/unlike";
        const result2 = await axios({
            method: 'put',
            url: link,
            withCredentials: true,
        });
    }
    // clearing the body so we then render the 50 newest tweets
    document.getElementById("root").innerHTML = '';
    renderTweet();
}

async function deleteTweet(event) {
    // gets id of the specific clicked tweet
    let x = event.target.getAttribute("data-id");
    let link = "https://comp426fa19.cs.unc.edu/a09/tweets/" + x;
    const result = await axios({
        method: 'delete',
        url: link,
        withCredentials: true,
    });
    // clearing the body so we then render the 50 newest tweets
    document.getElementById("root").innerHTML = '';
    renderTweet();
}

async function submitEdit(event) {
    let x = event.target.getAttribute("data-card");
    let message = $("#myeditarea").val();
    let link = "https://comp426fa19.cs.unc.edu/a09/tweets/" + x;
    const result = await axios({
        method: 'put',
        url: link,
        withCredentials: true,
        data: {
            "body": message,
        },
    });
    // clearing the body so we then render the 50 newest tweets
    document.getElementById("root").innerHTML = '';
    renderTweet();
}

function editArea(event) {
    let x = event.target.getAttribute("data-id");
    // getting the text that exists in the tweet to use it as a placeholder for the textarea
    let tweetBody = event.target.getAttribute("data-text");
    // here I create a new textarea and I append it to the tweet card so users can comment and then post. 
    // Therefore, if the id of that textarea does not exist; create one. if it does; remove it
    // this allows the button act as a toggle
    let tweetEditArea = document.getElementById("edit_area_exists");
    if (tweetEditArea) {
        $("#edit_area_exists").replaceWith("");
    }
    else {
        $("#" + x).append(`
        <div id="edit_area_exists">
            <textarea class="textarea" id="myeditarea" placeholder="${tweetBody}"></textarea>
            <button class="button is-success is-light" id="submiteditbutton" data-card="${x}">Update</button>
        </div>`);
    }
    $("#submiteditbutton").on("click", submitEdit);
}


async function postTweet() {
    let message = $("#myarea").val();
    const result = await axios({
        method: 'post',
        url: 'http://localhost:3000/tuits',
        data: {
            "type": "tweet",
            "body": message
        },
        withCredentials: true,
    });
    document.getElementById("root").innerHTML = '';
    renderTweet();
    // hides the textarea after posting a tweet
    typeTweet();
}

function typeTweet() {
    // when the typearea div doesn't contain anything then append the textarea and button, if it does then clear it
    if ($("#typearea").is(':empty')) {
        $("#typearea").append(`<textarea class="textarea" id="myarea" placeholder="what are you thinking?"></textarea>`);
        $("#tweetbuttondiv").append(`<button class="button is-success is-light" id="fixedbutton">Tweet</button>`);
    }
    else {
        document.getElementById("typearea").innerHTML = '';
        document.getElementById("tweetbuttondiv").innerHTML = '';
    }
    // listen for the post tweet button
    $("#fixedbutton").on("click", postTweet);
}


$(async function () {
    $("#make_search").click(makeSearch);
    if ((await getProfile()).data.username == null){
        // render button
        let $root = $("#root");
        $root.append(`<p style="margin-top:1in;">hello</p>`)
    }
    else{
        renderSite();
    }
});

$(document).ready(function () {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function () {
        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");
    });
});