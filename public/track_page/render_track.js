$(function () {
    renderTrackPage();
    $("#make_search").click(searchButtonClick);
    $("#search_text").val("");
    $("#search_type").val('track');
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

    //-------------------------- LOGIN / LOGOUT -----------------------------
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
    <h2 class="artist subtitle is-2">
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
            $(".artist").append(`, ${track.artists[i].name}`);
        }
    }
    $root.append(`
    <nav class="level">
    <div class="level-item has-text-centered">
      <div>
        <p class="heading">Average Rating</p>
        <p class="title" id="avg-rating">5</p>
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
    <br id="for-edit" class="">
        <div style="float: left; width: 50%; padding:5px;">
            <img src="${track.album.images[0].url}">
        </div>
        <div style="float: left; width: 50%; padding:5px;">
            <p class="title is-2">${track.name}</p>
            <p class="subtitle is-3">${track.artists[0].name}</p>
            <p class="subtitle is-5">Released: ${track.album.release_date}</p>

            <textarea id="review" class="textarea" placeholder="What are your thoughts?"></textarea>
            <fieldset id="rating">
            <input type="radio" id="star5" name="rating" value="5" /><label class = "full" for="star5" title="Awesome - 5 stars"></label>
            <input type="radio" id="star4half" name="rating" value="4.5" /><label class="half" for="star4half" title="Pretty good - 4.5 stars"></label>
            <input type="radio" id="star4" name="rating" value="4" /><label class = "full" for="star4" title="Pretty good - 4 stars"></label>
            <input type="radio" id="star3half" name="rating" value="3.5" /><label class="half" for="star3half" title="Meh - 3.5 stars"></label>
            <input type="radio" id="star3" name="rating" value="3" /><label class = "full" for="star3" title="Meh - 3 stars"></label>
            <input type="radio" id="star2half" name="rating" value="2.5" /><label class="half" for="star2half" title="Kinda bad - 2.5 stars"></label>
            <input type="radio" id="star2" name="rating" value="2" /><label class = "full" for="star2" title="Kinda bad - 2 stars"></label>
            <input type="radio" id="star1half" name="rating" value="1.5" /><label class="half" for="star1half" title="Meh - 1.5 stars"></label>
            <input type="radio" id="star1" name="rating" value="1" /><label class = "full" for="star1" title="Sucks big time - 1 star"></label>
            <input type="radio" id="starhalf" name="rating" value="0.5" /><label class="half" for="starhalf" title="Sucks big time - 0.5 stars"></label>
        </fieldset>
            <br>
            <br>
            <button id="make_post_button" class="button is-success is-light" style="display: relative;">Submit</button>
            <button id="make_edit_button" class="button is-success is-light" style="display: none;">Edit</button>
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
    $("#make_post_button").click(async function(){
        await submitPost(track, id);
        $("#post_modal").attr("style", "display: none;");
        $("#review").val("");
        $("#rating").prop("selectedIndex", 0);
    });
    $("#make_edit_button").click(async function () {
        await submitEdit(track);
        $("#post_modal").attr("style", "display: none;");
    });
    $(".share").on("click", makePost);

    //------------------ DISPLAY POSTS ABOUT ALBUM -----------------------
    $root.append(`
        <div class="container" id="track-reviews">
            <p class="title">Reviews</p>
        </div>
        <br>
    `);
    $("#track-reviews").append(await renderTrackPosts(track));
}

export async function makePost() {
    if((await getProfile()).data.username == null){
        alert("You must login to make posts");
        document.location.href = "../login/index.html";
    }
    else{
        $("#make_post_button").attr("style", "display: relative;");
        $("#make_edit_button").attr("style", "display: none;");
        $("#post_modal").attr("style", "display: block;");
    }
}

export async function submitPost(track, id) {
    let posttext = document.getElementById("review").value;
    let postscore = $("input[name=rating]:checked", '#rating').val();

    console.log(posttext, postscore);

    await axios({
        method: 'post',
        url: 'http://localhost:3000/tuits',
        data: {
            "type": "track",
            "spotify-id": id,
            "review": posttext,
            "rating": postscore
        },
        withCredentials: true,
    });

    $("#track-reviews").append(await renderTrackPosts(track));
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

export const getProfile = async function() {
    let result = await axios({
        method: 'get',
        url: 'http://localhost:3000/getLoggedInUser',
    });
    return result;
}

const renderTrackPosts = async function (track) {
    $("#track-reviews").html(`<p class="title">Reviews</p>`);
    let result = ((await axios({
        method: 'get',
        url: 'http://localhost:3000/tuits',
        withCredentials: true,
    })).data).filter(e => e["spotify-id"] == track.id);

    let sum = 0;
    for(let i = 0; i < result.length; i++){
        sum += parseFloat(result[i].rating);
    };
    let avg_rating = sum / result.length;
    $("#avg-rating").html(avg_rating.toFixed(2));

    let post = ``;
    for(let i = 0; i < result.length; i++){
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
        post = ``;
        post += `
        <div class="card" id="${result[i]["id"]}" style="display: flex; flex-direction: column;">
        <div class="card-image">
            <div style="float: left; width: 50%; padding:10px; text-align:center;">
                <img src="${track.album.images[0].url}"> 
                <p class="title is-4">${track.name}</p>
                <p class="subtitle is-6">${track.album.artists[0].name}</p>
                <a class = "button is-primary is-small" href="/track_page/index.html?id=${result[i]["spotify-id"]}" style = "margin-top: -18px;" >See Track Page</a>                       
            </div>`;
            if((await getProfile()).data.username != result[i].authorUsername){
                post += `
                    <div style="float: left; width: 50%; padding:5px;">
                        <p class="title is-4">${result[i].authorFirstName} ${result[i].authorLastName}</p>
                        <p class="subtitle is-6">@${result[i].authorUsername}</p><br>
                    </div>`;
            }
            else{
                post += `
                    <div style="float: left; width: 40%; padding:5px;">
                        <p class="title is-4">${result[i].authorFirstName} ${result[i].authorLastName}</p>
                        <p class="subtitle is-6">@${result[i].authorUsername}</p><br>
                    </div>
                    <div style="float: left; width: 10%; padding:5px;">
                        <a class="button" id="edit-post-${result[i].id}"><i class="fas fa-edit"></i></a>
                        <a class="button" id="delete-post-${result[i].id}"><i class="fas fa-trash"></i></a>
                    </div>`;
            }
            post += `
            <div style="float: left; width: 50%; padding:5px;">
                <div class="content">
                <p class = "is-size-4">${result[i].review}</p>
                <div class = "content" style = "margin-top: 90px;">
                <p class = "is-size-4" id = "${result[i]["id"]}-rating">${stars}</p>
                <p class = "is-size-6 is-italic">${new Date(result[i]["createdAt"]).toLocaleTimeString()}  --  ${new Date(result[i]["createdAt"]).toLocaleDateString()}<p>
                </div>
                </div>
            </div>
        </div>
    </div><br>`;
    $("#track-reviews").append(post);
        $(`#edit-post-${result[i].id}`).click(function() {
            handleEditPost(result[i].id);
        });
        $(`#delete-post-${result[i].id}`).click(function() {
            handleDeletePost(result[i].id, track);
        });
    }
}

const handleEditPost = async function (id){
    let result = ((await axios({
        method: 'get',
        url: 'http://localhost:3000/tuits',
        withCredentials: true,
    })).data).filter(e => e["id"] == id);

    $("#for-edit").attr("class", `${id}`);
    $("#review").html(`${result[0].review}`);
    $("#make_edit_button").attr("style", "display: relative;");
    $("#make_post_button").attr("style", "display: none;");
    $("#post_modal").attr("style", "display: block;");
}

const submitEdit = async function (track) {
    let posttext = document.getElementById("review").value;
    let postscore = $("input[name=rating]:checked", '#rating').val();
    await axios({
        method: 'put',
        url: 'http://localhost:3000/tuits/' + $("#for-edit").attr("class"),
        data: {
            "review": posttext,
            "rating": postscore
        },
        withCredentials: true,
    });

    await renderTrackPosts(track);
}

const handleDeletePost = async function(id, track) {
    await axios({
        method: 'delete',
        url: 'http://localhost:3000/tuits/' + id
    })
    await renderTrackPosts(track);
}