const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

mongoose.connect("mongodb://localhost:20717:/pomDB", {useNewUrlParser: true});

// make these required and what not
const pomodoroSchema = {
    subject: String,
    timeInterval: Number
};

const pomodoroModel = mongoose.model("studySessions", pomodoroSchema);

const app = express();

app.set("view engine", "ejs"); 
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

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

