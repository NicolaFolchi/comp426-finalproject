$(function (){
    renderAlbumPage();
})

// ################# TO DO ###################
// - average rating
// - relevant posts
// - make pretty
// - make post button functional
// - modal box for sharing album
// ###########################################

export const renderAlbumPage = async function() {
    //--------------------------- AUTHENTICATION ----------------------------
    const result = await axios({
        method: 'get',
        url: 'http://localhost:3000/getToken',
        json: true
    });
    let token = result["data"];

    //--------------------------- GET ALBUM ---------------------------------
    let id = location.search.substring(4);
    //let id = "1sJzod7aGgZwu2ShYec8GQ";
    let album_json = await getAlbum(id, token);
    let album = album_json.data;

    //----------------------- DISPLAY ALBUM INFO ----------------------------
    const $root = $("#root");
    $root.append(`
        <div class="container">
        <img src="${album.images[0].url}" style="height: 40%; width: 40%;">
        <p class="title">${album.name}</p>
        <p class="subtitle">Artist(s): ${album.artists[0].name}
    `);
    if(album.artists.length > 1){
        for(let i = 1; i < album.artists.length; i++){
            $root.append(`, ${album.artists[i].name}`);
        }
    }
    $root.append(`
        </p>
        <p>Released: ${album.release_date}</p>
        <p>Average Rating: a lot</p> 
    `);
    let tracks = `
    <table class="table is-striped is-fullwidth is-bordered">
        <tr>
            <th>Index</th>
            <th>Track</th>
            <th>Length</th>
        </tr>`;
    for(let i = 0; i < album.tracks.items.length; i++){
        tracks += `
            <tr>
                <td>${i+1}</td>
                <td><a href="/track_page/index.html?id=${album.tracks.items[i].id}">${album.tracks.items[i].name}</a></td>
                <td>${parseInt(album.tracks.items[i].duration_ms/60000)+":"+("0" + parseInt((album.tracks.items[i].duration_ms/1000) % 60)).slice(-2)}</td>
            </tr>
        `;
    }
    tracks += `</table>`;
    $root.append(tracks);
    $root.append(`
        <iframe src="https://open.spotify.com/embed/album/${album.id}" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
        </div><br><br>
    `)

    //------------------------- SHARE ALBUM ------------------------------
    $root.append(`
        <button class="button">Share Album</button>
    `);

    //------------------ DISPLAY POSTS ABOUT ALBUM -----------------------
    $root.append(`
        <div class="container">
            <p class="title">Relevant Posts</p>
        </div>
        <br>
    `);
}

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