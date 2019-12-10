$(function (){
    renderAlbumPage();
})

// ################# TO DO ###################
// - average rating
// - relevant posts
// - make pretty
// - make post button functional
// - home button for album and track and profile pages
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
    $root.append(`
    <button class="share button">Share Album</button>
    <div id="post_modal" class="modal">
        <div class="modal-content">
            <div style="float: left; width: 50%; padding:5px;">
                <img src="${album.images[0].url}">
            </div>
            <div style="float: left; width: 50%; padding:5px;">
                <p class="title is-4">${album.name}</p>
                <p class="subtitle is-6">${album.artists[0].name}</p>
                <p class="subtitle is-6">Released: ${album.release_date}</p>

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

export function cancelPost(){
    $(".editform").replaceWith(`<button class="share button">Share Album</button>`)
    $(".share").on("click", makePost);
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
    $(".share").on("click", makePost);
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