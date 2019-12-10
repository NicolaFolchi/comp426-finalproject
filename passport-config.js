const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs');

function init(passport, getUser, getUserById) {
    const authenticateUser = async function (username, password, done) {
        const user = getUser(username);
        console.log(username);
        if (user == null) {
            return done(null, false, { message: 'No user found :(' });
        }
        try {
            // comparing our stored hashed password with the password the user is trying to log in with
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);

            } else {
                return done(null, false, { message: 'Failed to log in, password incorrect' });
            }
        } catch (e) {
            return done(e);
        }
    }
    passport.use(new LocalStrategy({ usernameField: 'username' }, authenticateUser));
    passport.serializeUser(function (user, done) { done(null, user.id) });
    passport.deserializeUser(function (id, done) { return done(null, getUserById(id)) });
}
module.exports = init;