$(function () {
    renderTrackPage();
})

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
        <img src="${track.album.images[0].url}">
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

    //------------------------- SHARE ALBUM ------------------------------
    $root.append(`
        <button class="button">Share Track</button>
    `);

    //------------------ DISPLAY POSTS ABOUT ALBUM -----------------------
    $root.append(`
        <div class="container">
            <p class="title">Relevant Posts</p>
        </div>
        <br>
    `);
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