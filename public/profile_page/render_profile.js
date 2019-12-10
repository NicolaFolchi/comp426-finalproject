$(function () {
    renderProfilePage();
    $("#log-out-button").click(handleLogOut);
    $("#make_search").click(searchButtonClick);
    $("#search_text").val("");
    $("#search_type").val('track');
})

export const searchButtonClick = async function () {
    let type = $("#search_type").val();
    let search_text = $("#search_text").val();
    document.location.href = `../search_page/index.html?q=${search_text}&t=${type}`;
}

export const getProfile = async function () {
    let result = await axios({
        method: 'get',
        url: 'http://localhost:3000/getLoggedInUser',
    });
    return result;
}

export const editProfile = function (new_prof) {
    profile = new_prof;
    updateProfileInfo();
}

export const renderProfilePage = async function () {
    const auth = await axios({
        method: 'get',
        url: 'http://localhost:3000/getToken',
        json: true
    });
    let token = auth["data"];

    let result = await getProfile();
    let profile = result.data;
    if (profile.username == null) {
        $("#logged-out-buttons").attr("style", "display: relative;");
        $("#logged-in-buttons").attr("style", "display: none;");
    }
    else {
        $("#logged-out-buttons").attr("style", "display: none;");
        $("#logged-in-buttons").attr("style", "display: relative;");
    }
    const $root = $("#root");
    $root.append(`
        <div class="container" id="profile_info" style="padding-top: 0.4in;">
            <p class="title">Username: ${profile.username}</p>
            <p class="subtitle">${profile.firstName} ${profile.lastName}</p>
            <p>Email Address: ${profile.emailAddress}</p>
            <p>Password: ${profile.password}</p>
        </div>
        <button class="button" id="change_password_button">Change Password</button>
        <button class="button is-danger is-light" id="delete_profile">Delete Account</button>
        <br><br>
        <div class="container" id="user_posts" style="text-align: center;">
        </div>
    `)

    $("#user_posts").append(await renderUserPosts(profile, token));

    $("#change_password_button").click(function () {
        handleChangePassClick(profile);
    });
    $("#delete_profile").click(handleDeleteProfileClick);
}

const renderUserPosts = async function (profile, token) {
    let result = ((await axios({
        method: 'get',
        url: 'http://localhost:3000/tuits',
        withCredentials: true,
    })).data).filter(e => e.authorUsername == profile.username);
    let posts = `<p class="title">Posts Made:</p>`;
    for (let i = 0; i < result.length; i++) {
        if (result[i]["type"] == "track") {
            let track = (await getTrack(result[i]["spotify-id"], token)).data;
            posts += `
            <br>
            <div class="card" id="${result[i]["id"]}" style="width: 60%; margin: auto; display: flex; flex-direction: column;">
                <div class="card-content">
                    <div style="float: left; width: 50%; padding:5px; text-align:center;">
                        <img src="${track.album.images[0].url}">
                        <a href="/track_page/index.html?id=${result[i]["spotify-id"]}">See Track Page</a>                        
                    </div>
                    <div style="float: left; width: 50%; padding:5px;">
                        <p class="title is-4">${result[i].authorFirstName} ${result[i].authorLastName}</p>
                        <p class="subtitle is-6">@${result[i].authorUsername}</p><br>
                        <p class="title is-4">${track.name}</p>
                        <p class="subtitle is-6">${track.artists[0].name}</p>
                        <p class="subtitle is-6">Released: ${track.album.release_date}</p><br>

                        <div>
                            <p>${result[i].rating} Stars</p>
                            <p>${result[i].review}</p> <br>
                            <p>${new Date(result[i]["createdAt"]).toLocaleTimeString()}  --  ${new Date(result[i]["createdAt"]).toLocaleDateString()}<p>
                        </div>
                    </div>
                </div>
            </div><br>`;
        }
        else if (result[i]["type"] == "album") {
            let album = (await getAlbum(result[i]["spotify-id"], token)).data;
            posts += `
            <div class="card" id="${result[i]["id"]}" style="width:60%; margin: auto; display: flex; flex-direction: column;">
                <div class="card-content">
                    <div style="float: left; width: 50%; padding:5px; text-align:center;">
                        <img src="${album.images[0].url}"> 
                        <a href="/album_page/index.html?id=${result[i]["spotify-id"]}">See Album Page</a>                       
                    </div>
                    <div style="float: left; width: 50%; padding:5px;">
                        <p class="title is-4">${result[i].authorFirstName} ${result[i].authorLastName}</p>
                        <p class="subtitle is-6">@${result[i].authorUsername}</p><br>
                        <p class="title is-4">${album.name}</p>
                        <p class="subtitle is-6">${album.artists[0].name}</p>
                        <p class="subtitle is-6">Released: ${album.release_date}</p><br>

                        <div class="content">
                            <p>${result[i].rating} Stars</p>
                            <p>${result[i].review}</p> <br>
                            <p>${new Date(result[i]["createdAt"]).toLocaleTimeString()}  --  ${new Date(result[i]["createdAt"]).toLocaleDateString()}<p>
                        </div>
                    </div>
                </div>
            </div><br>`;
        }
    }
    return posts;
}

const updateProfileInfo = async function () {
    let profile = (await getProfile()).data;
    $("#profile_info").replaceWith(`
        <div class="container" id="profile_info">
            <p class="title">Username: ${profile.username}</p>
            <p class="subtitle">${profile.firstName} ${profile.lastName}</p>
            <p>Email Address: ${profile.emailAddress}</p>
            <p>Password: ${profile.password}</p>
        </div>
    `);
}

export const handleChangePassClick = function (profile) {
    $("#change_password_button").replaceWith(`
        <div id="change_password_form" style="border: solid; padding:5px;">
            <form>
                Current Password: <input type="text" id="cur_pass"><br>
                New Password: <input type="password" id="new_pass"><br>
                Confirm New Password: <input type="password" id="confirm_pass"><br>
                <a class="button" id="submit_pass_change">Submit</a>
                <button class="button is-danger is-light" id="cancel_pass_change">Cancel</button>
            <form>
            <p class="successful_pass_change" style="display: none; color: #48c774">Password changed successfully</p>
            <p class="pass_change_error" style="display: none; color: red;"></p>
        </div>
    `);
    $("#submit_pass_change").click(function () {
        handleSubmitPassChange(profile);
    });
    $("#cancel_pass_change").click(handleCancelPassChange)
}

export const handleSubmitPassChange = async function (profile) {
    // if($("#cur_pass").val() != user.password){
    //     alert("if")
    //     $(".pass_change_error").html("Current password does not match");
    //     $(".pass_change_error").attr("style", "display: relative; color: red;");
    //     return false;
    // }
    $(".pass_change_error").attr("style", "display: none; color: red;");
    profile = (await getProfile()).data;
    let test = true;
    let result = await axios({
        method: 'post',
        url: 'http://localhost:3000/changePassword',
        data: {
            "previousPassword": $("#cur_pass").val(),
            "newPassword": $("#new_pass").val(),
            "username": profile.username
        }
    }).catch(function (error) {
        test = false;
    });
    if (test) {
        if ($("#new_pass").val() != $("#confirm_pass").val()) {
            $(".pass_change_error").html("New passwords do not match");
            $(".pass_change_error").attr("style", "display: relative; color: red;");
            return false;
        }
        else {
            $("#change_password_form").replaceWith(`<button class="button" id="change_password_button">Change Password</button>`);
            $("#change_password_button").click(handleChangePassClick);
            $(".pass_change_error").attr("style", "display: none; color: red;");
            $(".successful_pass_change").attr("style", "display: relative; color: #48c774;")
            updateProfileInfo();
            return true;
        }
    }
    else {
        $(".pass_change_error").html("Current password does not match");
        $(".pass_change_error").attr("style", "display: relative; color: red;");
        return false;
    }
}

export const handleCancelPassChange = function () {
    $("#change_password_form").replaceWith(`<button class="button" id="change_password_button">Change Password</button>`);
    $("#change_password_button").click(handleChangePassClick);
}

export const handleDeleteProfileClick = async function () {
    if (confirm("Are you sure you want to delete your account?")) {
        alert("Profile Deleted");
        await axios({
            method: 'delete',
            url: 'http://localhost:3000/users',
        });
        document.location.href = '../index.html';
    }
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
