// load the things we need
//mongoDB module with extra features #fancyversion
var mongoose = require('mongoose');

//Hashpasswords (encrypts what is sent to database)
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
// schema - outlines how your database info is presented
var userSchema = mongoose.Schema({
// a nested document (a document inside of a document)
// https://mongoosejs.com/docs/schematypes.html#maps
    local            : {
        email        : String,
        password     : String
    },
    facebook         : {
        id           : String,
        token        : String,
        name         : String,
        email        : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }

});

// generating a hash for password (hashing means the password become encrypted for security purposes)
userSchema.methods.generateHash = function(password) {//password is the password the user typed in
  // hashSync is a method of bcrype module, genSeltSyns is a callback function of hashSync
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
