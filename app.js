/*
TODO
    - Re-style whole site ?
    - Implement flash messages
    - Check to see if username is a real email
    - password validation (6 characters & rules etc.)
    - Add options for different types of charts?
    - Disable autocomplete
    - Add instructions on homePage on how to use time form
    - rename homePage.ejs , and the route for it
    - Put document titles in the all EJS pages
    - Favicon
*/


const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const ejs = require("ejs");
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

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
      },
      //perhaps take this out
    password: {
        type: String,
      },
    // an array of strings because 
    subject: {
        type: [{
            pomSubject: String,
            timeInterval: Number
        }]}
});

userSchema.plugin(passportLocalMongoose);

const userModel = mongoose.model("User", userSchema);

passport.use(userModel.createStrategy());

passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

//######################################################## END OF BOILERPLATE ############################################

//routes
app.route('/users/login')
    // when the user trys to access the login page, send it to them
    .get((req, res) => {
        res.render('login');
    })
    // when the user posts to the login page we have to do some authorization
    .post((req, res) => {
        // do authorization here
        const user = new userModel({
            username: req.body.username,
            password: req.body.password
        });
        //logging in the user
        req.login(user, (err) => {
            //if an error occurs , send them back to the login page
            if(err){
                console.log('error');
                res.redirect('/users/login');
            }
            // upon a successful login, send them to the home route
            // upon an unsuccessful login, send them back to the login page
            else{
                passport.authenticate('local', {
                    successRedirect: '/homePage',
                    failureRedirect: '/users/login'
                })(req , res);
            }
        });
    });

//Register route 
app.route('/users/register')
    // Render the register page when user tries to access it
    .get((req, res) => {
        res.render('register');
    })
    .post((req, res) => {
        // sign up user here and do authorization
        /* this .regsiter (from passport-local-mongoose) register(user, password, cb) 
        Convenience method to register a new user instance with a given password. 
        Checks if username is unique. See login example. 
        Seems to return an object with err.name and err.message if error
        */
       //register the user, and create a new docuent for the pomodoro collection and intitalize as empty
       userModel.register({username: req.body.username}, req.body.password, (err, user) => {
        if(err){
            console.log(err.message);
            res.redirect('/users/register');
        }
        // if no errors, authenticate user using passport
        else{
            passport.authenticate('local', {
                successRedirect: '/homePage',
                failureRedirect: '/users/register'
            })(req , res);
        }
    });
    });

app.route('/homePage')  
    .get((req, res) => {
        if(req.isAuthenticated()){
            res.render('homePage');
        }
        else{
            res.redirect('/users/login');
        }
    })
    .post((req, res) => {
        let studySubject = _.capitalize(req.body.subject);
        let timerHours = parseInt(req.body.timerHours, 10);
        let timerMinutes = parseInt(req.body.timerMinutes, 10);
        let timerSeconds = parseInt(req.body.timerSeconds, 10);
        
        let totalTimeInSeconds = 0;

        totalTimeInSeconds += (timerHours * 3600) + (timerMinutes * 60) + timerSeconds;

        // store in data base

        //See if the user has already studied that subject
        userModel.findOne({username: req.user.username}, function(err, foundUser){
            if(err){
                console.log(err);
            }
            else{
                // If the user already has studied that subject, we want to append it to his time for the subject
                //Searches Through the found user's subject array to see if they've already studied the subject
                for(let i = 0; i < foundUser.subject.length; i++){
                    if(_.capitalize(foundUser.subject[i].pomSubject) === studySubject){
                        foundUser.subject[i].timeInterval += totalTimeInSeconds;
                        foundUser.save();
                        break;
                    }

                    //If user hasn't studied that subject before, append it to the end
                    else if(i === foundUser.subject.length - 1 && _.capitalize(foundUser.subject[i].pomSubject) !== studySubject){
                        foundUser.subject.push({
                            pomSubject: studySubject,
                            timeInterval: totalTimeInSeconds
                        });
                        foundUser.save();
                        break;
                    }

                // If the user hasn't studied a subject before
                }
                 if(foundUser.subject.length === 0){
                    foundUser.subject.push({
                    pomSubject: studySubject,
                    timeInterval: totalTimeInSeconds
                    });
                    foundUser.save();
                }    
            }
        });
        res.render('timerPage', {timerTime: totalTimeInSeconds, studySubject: studySubject});
    });

// Route For Stats Page
app.route('/stats')
    .get((req, res) => {
        if(req.isAuthenticated()){
            userModel.findOne({username: req.user.username}, (err, foundUser) => {
                if(err){
                    console.log(err);
                }
                else{
                    res.render('graph', {studyHistory: JSON.stringify(foundUser)});
                }
            });
        }

        else{
            res.redirect('/users/login');
        }
});

app.route('/')
    .get((req, res) => {
        res.render('startPage');
    });

app.route('/logout')
    .get((req, res) => {
        req.logout();
        res.redirect('/');
    });

app.listen(3000, function(){
    console.log('server listening on port 3000!');
});