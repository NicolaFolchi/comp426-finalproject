$(function (){
    renderAlbumPage();
})

export const renderAlbumPage = async function() {
    //GET THINGS FROM API HERE
    let id = "2BTZIqw0ntH9MvilQ3ewNY";
    let album = await getAlbum(id);
    const $root = $("#root");
    $root.append(`
        <img src="${album.images[0].url}">
        <p class="title">${album.name}</p>
        <p class="subtitle">${album.artists}</p>
    `);
}

export const getAlbum = async function(id) {
    const album = await axios({
        method: 'get',
        url: `https://api.spotify.com/v1/albums/${id}`,
        withCredentials: true
    });
    return album;
}