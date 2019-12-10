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
    <br>
    <br>
    <div class="container">
    <h1 class="title is-1">
    ${track.name}
    </h1>
    <h2 class="subtitle is-2">
    By ${track.artists[0].name}
    </h2>
    </div>
    <br>
    <div class = "media">
    <div class = "media-content">
    <div class = "content">
    <figure class = "image">
    <img class= "is-centered" src="${track.album.images[0].url}" style="height: 45%; width: 45%;">
    </figure>
    </div>
    </div>
    </div>
    <br>
    `);
    if (track.artists.length > 1) {
        for (let i = 1; i < track.artists.length; i++) {
            $root.append(`, ${track.artists[i].name}`);
        }
    }
    $root.append(`
    <nav class="level">
    <div class="level-item has-text-centered">
      <div>
        <p class="heading">Average Rating</p>
        <p class="title">5</p>
      </div>
    </div>
    <div class="level-item has-text-centered">
      <div>
        <p class="heading">Popularity</p>
        <p class="title">${track.popularity}</p>
      </div>
    </div>

    <div class="level-item has-text-centered">
      <div>
        <p class="heading">Release Date</p>
        <p class="title">${track.album.release_date}</p>
      </div>
    </div>
  </nav>
        <iframe src="https://open.spotify.com/embed/track/${track.id}" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
    `);

    //------------------------- SHARE TRACK ------------------------------
    $root.append(`
    <nav class="level">
    <div class="level-left">
      <div class="level-item">
      <button class="button share is-primary is-large">Share Track</button>
      </div>
    </div>
    <div class="level-right">
    <div class="level-item">
    <a class="button is-primary is-large" href="/album_page/index.html?id=${track.album.id}">See full album</a>
    </div>
    </div>
  </nav>
    
    <br>
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
            <p class="title">Reviews</p>
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