const $root = $('#root');




// var client_id = 'af2ce6ca8d05496ebde76dff70598354'
// var client_secret = 'f0e685f8afc441d6954d0321d73698e3'

export async function authorize() {
const result = await axios({
    method: 'get',
    url: 'http://localhost:3000/getToken',
    json: true
});

let token = result["data"];

const result2 = await axios({
    method: 'get',
    url: 'https://api.spotify.com/v1/albums/62l9OeWPnsSwWYhBiivSRV',
    headers: {
        'Authorization': 'Bearer ' + token
    },
    json: true
});

console.log(result2);

}

authorize();