const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.use(session({
    secret: 'Our little secret.',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs"); 
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:20717:/pomDB", {useNewUrlParser: true});

mongoose.set('useCreateIndex', true);


pomodoroSchema.plugin(passportLocalMongoose);

passport.use(pomodoroModel.createStrategy());

passport.serializeUser(pomodoroModel.serializeUser());
passport.deserializeUser(pomodoroModel.deserializeUser());

//######################################################## END OF BOILERPLATE ############################################

//routes
app.use('/', require('./routes/pomodoro'));
app.use('users', require('./routes/users.js'));


app.listen(3000, function(){
    console.log('server listening on port 3000!');
});

