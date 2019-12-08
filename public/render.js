export const renderSite = function () {
    const $root = $('#root');
    renderTweet();
    $("#fixedbutton").on("click", postTweet);
    $("#tweetbutton").on("click", typeTweet);
    $("#submiteditbutton").on("click", submitEdit);

}

async function renderTweet() {
    const $root = $('#root');
    $root.append(`
        <a href="/album_page/index.html?id=0bCAjiUamIFqKJsekOYuRw">TEST</a>
    `)
    // getting all tweets from the server
    const result = await axios({
        method: 'get',
        url: 'http://localhost:3000/tuits',
        withCredentials: true,
    });
    // dynamically rendering all of the 50 newest tweets with their respective card provided by bulma
    let tweets = `<div id="tweets">`;
    for (let i = 0; i < 10; i++) {
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
            tweets += `
            <br>
            <div class="card" id="${result.data[i]["id"]}">
                <div class="card-content">
                    <div class="media">
                    <div class="media-left">
                        <figure class="image is-48x48">
                        <img src="https://bulma.io/images/placeholders/96x96.png" alt="Placeholder image">
                        </figure>
                    </div>
                    <div class="media-content" id="author${result.data[i]["id"]}">
                        <p class="title is-4">${result.data[i]["author"]}</p>
                        <p class="subtitle is-6">@${result.data[i]["author"]}</p>
                    </div>
                </div>

                <div class="content">
                    ${result.data[i]["body"]}
                    
                    <br>
                    <p>${new Date(result.data[i]["createdAt"]).toLocaleTimeString()}  --  ${new Date(result.data[i]["createdAt"]).toLocaleDateString()}<p>
                </div>
                <footer class="card-footer">
                        <a class="card-footer-item myLikeButtons ${result.data[i]["isLiked"]}" id="likeButton${result.data[i]["id"]}" data-id="${result.data[i]["id"]}" data-likeStatus="${result.data[i]["isLiked"]}">Like ${result.data[i]["likeCount"]}</a>
                        <a class="card-footer-item myRetweetButtons" data-id="${result.data[i]["id"]}" data-text="${result.data[i]["body"]}">Retweet ${result.data[i]["retweetCount"]} </a>
                        <a class="card-footer-item myReplyButtons" data-id="${result.data[i]["id"]}" data-text="${result.data[i]["body"]}">Reply ${result.data[i]["replyCount"]}</a>
                </footer>
            </div>`;
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


$(function () {
    renderSite();
});

$(document).ready(function () {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function () {
        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");
    });
});


  // --- TODO --- 
  // Learn a way to update html without having to re-render all tweets (maybe JSON)
  // Create your own server so the application does not depend on the university's
    // Create a login/register authentication to add new users to the app
  // Add a profile tab where you can see your own tweets