const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

/*
TODO
    - Move routes pertaining to timerPage and graphPage from app.js into here
    - Add checks to make sure that user is authenticated (keep the timer page to be rendered as it is)
*/