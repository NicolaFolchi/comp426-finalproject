$(function() {
    renderSearch();
    $("#make_search").click(searchButtonClick);
})

export const getAlbum = async function(id, token) {
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

export const renderTrackResult = async function (id, token) {
    let track_json = await getTrack(id, token);
    let track = track_json.data;
    let post = `
    <div class = "container">
    <a href="/track_page/index.html?id=${id}">
    <div class="card" style="width: 38%; margin: auto;">
        <div class="card-image">
            <figure class="image is-marginless">
                <img src="${track.album.images[0].url}" style="height: 100%; width: 100%;">
            </figure>
        </div>
        <div class="card-content">
            <div class="media">
                <div class="media-content">
                    <p class="title is-4">${track.name}</p>
                    <p class="subtitle is-6">${track.album.artists[0].name}</p>
                </div>
            </div>
        </div>
    </div>
    </a>
    </div>
    <br>
    `;
    $("#root").append(post);
}

export const renderAlbumResult = async function (id, token) {
    let album_json = await getAlbum(id, token);
    let album = album_json.data;
    let post = `
        <div class = "container">
        <a href="/album_page/index.html?id=${id}">
        <div class="card" style="width: 38%; margin: auto;">
            <div class="card-image">
                <figure class="image is-marginless">
                    <img src="${album.images[0].url}" style="height: 100%; width: 100%;">
                </figure>
            </div>
            <div class="card-content">
                <div class="media">
                    <div class="media-content">
                        <p class="title is-4">${album.name}</p>
                        <p class="subtitle is-6">${album.artists[0].name}</p>
                    </div>
                </div>
            </div>
        </div>
        </a>
        </div>
        <br>
    `;
    $("#root").append(post);
}

export const makeSearch = async function (token, query, type) {
    let search = await axios({
        method: 'get',
        url: `https://api.spotify.com/v1/search?q=${query}&type=${type}`,
        headers: {
            'Authorization': 'Bearer ' + token
        },
        json: true
    });
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
    var searchquery = query.replace(/%20/g, " ");
    $root.append(`
        <p class="title" style="margin-bottom: 20px;">Showing ${type} results for "${searchquery}":</p>
        <button class="button is-primary" id="home" style="margin-bottom: 20px;">Return to Home Page</button>
    `)
    if(type == "track"){
        let search_body = search.data.tracks.items;
        search_body.forEach(element => {
            renderTrackResult(element.id, token);
        });
    }
    else {
        let search_body = search.data.albums.items;
        search_body.forEach(element => {
            renderAlbumResult(element.id, token);
        });
    }
    $("#search_text").val("");
    $("#search_type").val('track');
    $("#home").click(function(){ document.location.href = "../index.html" });
}

async function renderSearch() {
    //--------------------------- AUTHENTICATION ----------------------------
    const auth = await axios({
        method: 'get',
        url: 'http://localhost:3000/getToken',
        json: true
    });
    let token = auth["data"];

    const $root = $('#root');
    $root.html("");

    let params = location.search.substring(1).split("&");
    let query = params[0].substring(2);
    let type = params[1].substring(2);

    makeSearch(token, query, type);
}

export const searchButtonClick = async function () {
    let type = $("#search_type").val();
    let search_text = $("#search_text").val();
    document.location.href = `./index.html?q=${search_text}&t=${type}`;
}

export const getProfile = async function() {
    let result = await axios({
        method: 'get',
        url: 'http://localhost:3000/getLoggedInUser',
    });
    return result;
}