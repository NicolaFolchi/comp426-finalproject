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
        <section class="hero is-primary">
        <div class="hero-body">
        <div class="container">
        <h1 class="title">
        ${album.name}
        </h1>
        <h2 class="subtitle">
        By ${album.artists[0].name}
        </h2>
        </div>
        </div>
        </section>
        <br>
        <div class = "media">
        <div class = "media-content">
        <div class = "content">
        <figure class = "image">
        <img class= "is=centered" src="${album.images[0].url}" style="height: 45%; width: 45%;">
        </figure>
        </div>
        </div>
        </div>
    `);
    if(album.artists.length > 1){
        for(let i = 1; i < album.artists.length; i++){
            $(".subtitle").append(`, ${album.artists[i].name}`);
        }
    }
    $root.append(`
    <nav class="level">
      <div class="level-left">
        <div class="level-item">
          <p class="title">
          Released: ${album.release_date}
          </p>
        </div>
      </div>
    
      <div class="level-right">
        <p class="level-item title"><strong>Average Rating: 5 </strong></p>
      </div>
    </nav>
    <iframe src="https://open.spotify.com/embed/album/${album.id}" width="1050" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
    `);
    let tracks = `
    <table class="table is-striped is-fullwidth is-bordered">
        <tr>
            <th>Track</th>
            <th>Length</th>
        </tr>`;
    for(let i = 0; i < album.tracks.items.length; i++){
        tracks += `
            <tr>
                <td><a href="/track_page/index.html?id=${album.tracks.items[i].id}">${album.tracks.items[i].name}</a></td>
                <td>${parseInt(album.tracks.items[i].duration_ms/60000)+":"+("0" + parseInt((album.tracks.items[i].duration_ms/1000) % 60)).slice(-2)}</td>
            </tr>
        `;
    }
    tracks += `</table>`;
    $root.append(tracks);
    $root.append(`<nav class="level">
    <div class="level-left">
      <div class="level-item">
      <button class="share button is-primary is-large">Share Album</button>
      </div>
    </div>
  </nav>
    `)

    //------------------------- SHARE ALBUM ------------------------------
    $(".share").on("click", renderEdit);

    //------------------ DISPLAY POSTS ABOUT ALBUM -----------------------
    $root.append(`
        <div class="container">
            <p class="title">Reviews</p>
        </div>
        <br>
    `);
}


export function renderEdit() {
    $(".button").replaceWith(`
    <div class = "editform">
    <textarea class="textarea" id="reviewtext" placeholder="Write a review"></textarea>
    <div class="select">
    <select id="reviewscore">
    <option>0</option>
    <option>1</option>
    <option>2</option>
    <option>3</option>
    <option>4</option>
    <option>5</option>
    </select>
    </div>
    <div><button class="submit button">Submit</button><button class="cancel button">Cancel</button></div>
    </div>`);
    $(".cancel").on("click", cancelPost);
    $(".submit").on("click", submitPost);


}

export function cancelPost(){
    $(".editform").replaceWith(`<button class="share button">Share Album</button>`)
    $(".share").on("click", renderEdit);
}

export async function submitPost() {
    let posttext = document.getElementById("reviewtext").value;
    let e = document.getElementById("reviewscore");
    let postscore = e.options[e.selectedIndex].value;

    console.log(posttext, postscore);

    await axios({
        method: 'post',
        url: 'http://localhost:3000/tuits',
        data: {
            "type": "tweet",
            "body": posttext
        },
        withCredentials: true,
    });

    $(".editform").replaceWith(`<button class="share button">Share Album</button>`)
    $(".share").on("click", renderEdit);
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