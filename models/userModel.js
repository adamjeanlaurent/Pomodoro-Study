const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
      },
    password: {
        type: String,
        required: true
      },
    // an array of strings because 
    subject: {
        type: [{
            subject: String,
            timeInterval: Number
        }]},
});

userSchema.plugin(passportLocalMongoose);

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;



