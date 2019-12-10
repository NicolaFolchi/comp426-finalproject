let mongoose = require('mongoose');
let Schema = mongoose.Schema;

mongoose.connect("mongodb://localhost/users");

let email_match = [/^\w+([\.-]?\w+)*@([\.-]?\w+)*(\.\w{2,3})+$/, "Invalid email format"];

let user_schema = new Schema({
    username: { type: String, required: "Username is required", maxlength: [16, "Username must be less than 17 characters"], minlength: [4, "Username length must be more than 3 characters"] },
    password: { type: String, required: "Password is required" },
    firstName: { type: String, required: "First name is required" },
    lastName: { type: String, required: "Last Name is required" },
    emailAddress: { type: String, required: "Email is required", match: email_match}
});

let User = mongoose.model("User", user_schema);

module.exports.User = User;