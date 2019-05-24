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
        res.render('homePage');
    })
    .post((req, res) => {
        let studySubject = _.capitalize(req.body.subject);
        let timerHours = parseInt(req.body.timerHours, 10);
        let timerMinutes = parseInt(req.body.timerMinutes, 10);
        let timerSeconds = parseInt(req.body.timerSeconds, 10);

        let totalTimeInSeconds = 0;

        totalTimeInSeconds += (timerHours * 3600) + (timerMinutes * 60) + timerSeconds;

        // store in data base

        //Searches to see if that subject already exist in the database
        pomodoroModel.findOne({subject: studySubject}, function(err, foundSession){
            if(err){
                console.log(err);
            }
            else{
                // If it already exists, append to it's total time count to the existing document
                if(foundSession){
                    foundSession.timeInterval += totalTimeInSeconds;
                    foundSession.save();
                }
                else{
                    // if it doesn't exist yet, insert into the collection as a new document
                    const newPomodoro = new userModel({
                        subject: studySubject,
                        timeInterval: totalTimeInSeconds
                    });
                    newPomodoro.save();
                }
            }
        });
        res.render('timerPage', {timerTime: totalTimeInSeconds, studySubject: studySubject});
    });

// Route For Stats Page
    router.route('/stats')
        .get((req, res) => {
            // tap into req.user to query the correct user's data
            pomodoroModel.find({}, function(err, studyHistory){
         if(err){
            console.log(err);
        }
         else{
            // send study history
            res.render('graph', {studyHistory: JSON.stringify(studyHistory)});
        }
        });
    });