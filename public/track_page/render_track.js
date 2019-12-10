$(function () {
    renderTrackPage();
    $("#make_search").click(searchButtonClick);
})

export const searchButtonClick = async function () {
    let type = $("#search_type").val();
    let search_text = $("#search_text").val();
    document.location.href = `../search_page/index.html?q=${search_text}&t=${type}`;
}

export const renderTrackPage = async function () {
    //--------------------------- AUTHENTICATION ----------------------------
    const result = await axios({
        method: 'get',
        url: 'http://localhost:3000/getToken',
        json: true
    });
    let token = result["data"];

    //--------------------------- GET TRACK ---------------------------------
    let id = location.search.substring(4);
    //let id = "1sJzod7aGgZwu2ShYec8GQ";
    let track_json = await getTrack(id, token);
    let track = track_json.data;

    //----------------------- DISPLAY TRACK INFO ----------------------------
    const $root = $("#root");
    $root.append(`
        <div class="container">
        <img src="${track.album.images[0].url}" style="height: 40%; width: 40%;">
        <p class="title">${track.name}</p>
        <p class="subtitle">Artist(s): ${track.artists[0].name}
    `);
    if (track.artists.length > 1) {
        for (let i = 1; i < track.artists.length; i++) {
            $root.append(`, ${track.artists[i].name}`);
        }
    }
    $root.append(`
        </p>
        <p>Released: ${track.album.release_date}</p>
        <p>Average Rating: a lot</p> 
        <a class="button" href="/album_page/index.html?id=${track.album.id}">See full album</a>
        <iframe src="https://open.spotify.com/embed/track/${track.id}" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
    `);

    //------------------------- SHARE TRACK ------------------------------
    $root.append(`
        <button class="button share">Share Track</button>
        <div id="post_modal" class="modal">
        <div class="modal-content">
            <div style="float: left; width: 50%; padding:5px;">
                <img src="${track.album.images[0].url}">
            </div>
            <div style="float: left; width: 50%; padding:5px;">
                <p class="title is-4">${track.name}</p>
                <p class="subtitle is-6">${track.artists[0].name}</p>
                <p class="subtitle is-6">Released: ${track.album.release_date}</p>

                <textarea id="review" class="textarea" placeholder="What are your thoughts?"></textarea>
                <div class="select">
                    <select required id="rating">
                        <option value="" selected disabled hidden>--Rating--</option>
                        <option value="0">0 Stars</option>
                        <option value="1">1 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="5">5 Stars</option>
                    </select>
                </div>
                <button id="make_post_button" class="button is-success is-light">Submit</button>
                <button id="cancel_post" class="button is-danger is-light">Cancel</textarea>
            </div>
        </div>
    </div>
    `);
    window.onclick = function(event) {
        if (event.target.id == "post_modal") {
            $("#post_modal").attr("style", "display: none;")
            $("#review").val("");
            $("#rating").prop("selectedIndex", 0);
        }
    }
    $("#cancel_post").click(function() {
        $("#post_modal").attr("style", "display: none;");
        $("#review").val("");
        $("#rating").prop("selectedIndex", 0);
    });
    $(".share").on("click", makePost);

    //------------------ DISPLAY POSTS ABOUT ALBUM -----------------------
    $root.append(`
        <div class="container">
            <p class="title">Relevant Posts</p>
        </div>
        <br>
    `);
}

export function makePost() {
    $("#post_modal").attr("style", "display: block;");
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