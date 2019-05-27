const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const ejs = require("ejs");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const isemail = require('isemail');

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
    password: {
        type: String,
      },
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

//######################################################## END OF BOILERPLATE ###########################################################################

//routes
app.route('/users/login')
    // when the user trys to access the login page, render it 
    .get((req, res) => {
        res.render('login');
    })
    .post((req, res) => {
        //check for empty fields
        if(!req.body.username || !req.body.password){
            return res.render('login', {errors: [{msg: 'Fill In All Fields'}], password: req.body.password, name: req.body.username});
        }
        const user = new userModel({
            username: req.body.username,
            password: req.body.password
        });
        //logging in the user
        req.login(user, (err) => {
            //if an error occurs , send the user back to the login page
            if(err){
                res.redirect('/users/login');
                console.log(err);
            }
            // upon a successful login, send the user to the home route
            // upon an unsuccessful login, send the user back to the login page to try again
            else{
                passport.authenticate('local', {
                    successRedirect: '/homePage',
                    failureRedirect: '/users/login',
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
        let password = req.body.password;
        let username = req.body.username;
        let errors = [];

        // check required fields
        if(!password || !username){
            errors.push({msg: 'Please Fill In All Fields'});
        }

        // check password length
        if(password.length < 6){
            errors.push({msg: 'Password Needs To Be At Least 6 Characters'});
        }

        // check if valid email address
        if(!isemail.validate(username)){
            errors.push({msg: 'Invalid Email Address'});
        }

        userModel.findOne({username: username}, (err, foundUser) => {
            if(foundUser){
                errors.push({msg: 'Email Taken By Another User'});
            }
        });
        
        //if there are errors re-render register page with errors
        if(errors.length > 0){
            return res.render(('register'), {errors: errors, name: username, password: password});
        }

       //register the user, and create a new document for the users collection and intitalize it's subject array as empty
       userModel.register({username: req.body.username}, password, (err, user) => {
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

//home page route
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
        let errors = [];

        // Check if any fields are blank
        if(!req.body.subject || !req.body.timerHours || !req.body.timerMinutes || !req.body.timerSeconds){
            errors.push({msg: 'Please Fill In All Fields'});
        }

        //check for non-numeric input for the timer
        if(isNaN(req.body.timerHours) || isNaN(req.body.timerMinutes || isNaN(req.body.timerSeconds))){
            errors.push({msg: 'Please Put Numeric Input For Time'});
        }

        //Render the page with errors if there are any
        if(errors.length > 0){
            return res.render('homePage', {errors: errors, 
                subject: req.body.subject, 
                hours: req.body.timerHours, 
                minutes: req.body.timerMinutes, 
                seconds: req.body.timerSeconds});
        }
        
        // parsing data after checking for errors
        let studySubject = _.capitalize(req.body.subject);
        let timerHours = parseInt(req.body.timerHours, 10);
        let timerMinutes = parseInt(req.body.timerMinutes, 10);
        let timerSeconds = parseInt(req.body.timerSeconds, 10);
        
        let totalTimeInSeconds = 0;

        totalTimeInSeconds += (timerHours * 3600) + (timerMinutes * 60) + timerSeconds;

        //check if the user has already studied that subject
        userModel.findOne({username: req.user.username}, function(err, foundUser){
            if(err){
                console.log(err);
            }
            else{
                // If the user already has studied that subject, we want to append it to their existing time for that subject
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

                }
                // If the user hasn't studied a subject before create a new index in their subject array
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

// Route For Stats Page with Bar Graph
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

// Route For Stats Page with Pie Chart
app.route('/stats/pie')
    .get((req, res) => {
        if(req.isAuthenticated()){
            userModel.findOne({username: req.user.username}, (err, foundUser) => {
                if(err){
                    console.log(err);
                }
                else{
                    // Getting the total amount of time the user has studied every subject
                    let totalTimeStudied = 0;
                    foundUser.subject.forEach((subject) => {
                        totalTimeStudied += subject.timeInterval;
                    })
                    res.render('pieChart', {studyHistory: JSON.stringify(foundUser), totalTimeStudied: totalTimeStudied});
                }
            });
        }

        else{
            res.redirect('/users/login');
        }
});

// Startup page route
app.route('/')
    .get((req, res) => {
        res.render('startPage');
    });

//logout route
app.route('/logout')
    .get((req, res) => {
        req.logout();
        res.redirect('/');
    });

app.listen(3000, function(){
    console.log('server listening on port 3000!');
});