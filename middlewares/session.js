// through this file we check if the user is logged in.
module.exports = function (request, response, next){
    if (!request.session.user_id){
        response.redirect('/login');
    } else {
        next();
    }

}