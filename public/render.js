export const renderSite = function () {
    renderTweet();
    $("#make_search").click(makeSearch);
    $("#log-out-button").click(handleLogOut);
}

export const getProfile = async function () {
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
    if (profile.username == null) {
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
    if (profile.username == null) {
        tweets = `
            <div class="notification is-danger" style="vertical-align:center;">
            Welcome to Adagio! To see posts from all users, please log in.
            </div>
            <div class= "hero is-fullheight">
                <div class="card" style="display: flex; flex-direction: column;">
                    <div class="card-image">
                        <div style="float: left; width: 50%; padding:10px; text-align:center;">
                            <img src="https://i.scdn.co/image/ab67616d0000b2738940ac99f49e44f59e6f7fb3"> 
                            <p class="title is-4">Flower Boy</p>
                            <p class="subtitle is-6">Tyler, The Creator</p>
                            <a class = "button is-primary is-small" href="/album_page/index.html?id=2nkto6YNI4rUYTLqEwWJ3o" style = "margin-top: -18px;" >See Album Page</a>                       
                        </div>
                        <div style="float: left; width: 50%; padding:5px;">
                            <p class="title is-2">Future Hendrix</p>
                            <p class="subtitle is-4">@fHendrix</p><br>

                            <div class="content">
                            <p class = "is-size-6" style = "margin-top: -10px;">Tyler Creator easily puts out his best album yet, and one of the best albums of the year. 
                                This album may not filled with the hardest beats or the most insane rap flows,
                                        but it is very catchy and has a great sound to it. Awesome record 🔥🔥</p>
                            <div class = "content" style = "margin-top: 35px;">
                            <p class = "is-size-4"><i class="star fas fa-star"></i><i class="star fas fa-star"></i><i class="star fas fa-star"></i><i class="star fas fa-star"></i><i class="star fas fa-star-half"></i></p>
                            <p class = "is-size-6 is-italic">6:06:59 PM  --  12/10/2019<p>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`
    } else {
        let maxPosts = result.length;
        if(maxPosts > 20) { maxPosts = 20; }
        for (let i = 0; i < maxPosts; i++) {
            let stars = ``;
            switch (result[i].rating) {
                case "0.5":
                    stars = `<i class="star fas fa-star-half"></i>`;
                    break;

                case "1":
                    stars = `<i class="star fas fa-star"></i>`;
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
                    stars = `<i class="star fas fa-star"></i><i class="star fas fa-star"></i><i class="star fas fa-star"></i>`;
                    break;

                case "3.5":
                    stars = `<i class="star fas fa-star"></i><i class="star fas fa-star"></i><i class="star fas fa-star"></i><i class="star fas fa-star-half"></i>`;
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
            if (result[i]["type"] == "track") {
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
            else if (result[i]["type"] == "album") {
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
            // here I append each generated tweet to a div variable that would then be appended to the root
            tweets += `</div>`;
        }
    }
    $root.append(tweets);
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
