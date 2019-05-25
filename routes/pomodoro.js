const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const router = express.Router();

router.use(express.urlencoded({ extended: true }));

const userModel = require('../models/userModel');

/*
TODO
    - Move routes pertaining to timerPage and graphPage from app.js into here
    - Add checks to make sure that user is authenticated (keep the timer page to be rendered as it is)
*/

// Route for timer and home page
router.route('/')
    .get((req, res) => {
        if(req.isAuthenticated()){
            res.render('homePage');
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
                for(let i = 0; i < foundUser.subject.length; i ++){
                    if(foundUser.subject[i].studySubject){
                        foundUser.subject[i].studySubject += totalTimeInSeconds;
                        foundUser.save();
                        break;
                    }

                    //If user hasn't studied that subject before, append it to the end
                    if(i === foundUser.subject.length - 1 && foundUser.subject.length[i] !== studySubject){
                        foundUser.subject.push({
                            subject: studySubject,
                            timeInterval: totalTimeInSeconds
                        });
                        break;
                    }
                }
                
            }
        });
        res.render('timerPage', {timerTime: totalTimeInSeconds, studySubject: studySubject});
    });

// Route For Stats Page
    router.route('/stats')
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


    //         // tap into req.user to query the correct user's data
    //         pomodoroModel.find({}, function(err, studyHistory){
    //      if(err){
    //         console.log(err);
    //     }
    //      else{
    //         // send study history
    //         res.render('graph', {studyHistory: JSON.stringify(studyHistory)});
    //     }
    //     });
    // });
