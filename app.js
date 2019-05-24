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

// make these required and what not
const pomodoroSchema = new mongoose.Schema({
    subject: String,
    timeInterval: Number
});

pomodoroSchema.plugin(passportLocalMongoose);

const pomodoroModel = mongoose.model("studySessions", pomodoroSchema);

passport.use(pomodoroModel.createStrategy());

passport.serializeUser(pomodoroModel.serializeUser());
passport.deserializeUser(pomodoroModel.deserializeUser());

//######################################################## END OF BOILERPLATE ############################################

app.get('/', function(req,res){
    res.render('homePage');
});

app.post('/', function(req,res){
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
                const newPomodoro = new pomodoroModel({
                    subject: studySubject,
                    timeInterval: totalTimeInSeconds
                });
                newPomodoro.save();
            }
        }
    });
    
    res.render('timerPage', {timerTime: totalTimeInSeconds, studySubject: studySubject});
});


app.get('/stats', function(req,res){
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

app.listen(3000, function(){
    console.log('server listening on port 3000!');
});

