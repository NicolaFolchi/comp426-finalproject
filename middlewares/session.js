module.exports = function (request, response, next){
    if (!request.session.user_id){
        response.redirect('/login');
    } else {
        next();
    }

}