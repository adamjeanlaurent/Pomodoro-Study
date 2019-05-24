const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const router = express.Router();

const userModel = require('./models/userModel');

//login route
router.route('/login')
    // when the user trys to access the login page, send it to them
    .get((req, res) => {
        res.render('login');
    })
    // when the user posts to the login page we have to do some authorization
    .post((req, res) => {
        // do authorization here
    });

//Register route 
router.route('/register')
    // Render the register page when user tries to access it
    .get((req, res) => {
        res.render('users/register');
    })
    .post((req, res) => {
        // sign up user here and do authorization
        /* this .regsiter (from passport-local-mongoose) register(user, password, cb) 
        Convenience method to register a new user instance with a given password. 
        Checks if username is unique. See login example. 
        Seems to return an object with err.name and err.message if error
        */
       //register the user, and create a new docuent for the pomodoro collection and intitalize as empty
       userModel.register({username: req.body.username}, req.body.password, (err, user) =>{
        if(err){
            console.log(err.message);
            res.redirect('/users/register');
        }
        // if no errors, authenticate user using passport
        else{
            // this callback is only triggered if the authentication was successful and we set up a cookie that saved their session
            passport.authenticate('local')(req, res, () =>{
                // redirect to the home route to get them to page to set up time
                res.redirect('/');
            });
        }
    });
    });