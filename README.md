# Pomodoro Study
Pomodro Web Application To Help You Study! Built With JavaScript, Node.js, Express.js, MongoDB, EJS, HTML, CSS, and a few other tools and packages. 

Site is deployed here using Heroku and MongoDB Atlas http://pomodorostudy.herokuapp.com/

The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s. The technique uses a timer to break down work into intervals, traditionally 25 minutes in length, separated by short breaks. Each interval is known as a pomodoro, from the Italian word for 'tomato', after the tomato-shaped kitchen timer that Cirillo used as a university student.

## How To Use

- Register an account

- Type a subject of your choosing along with a time interval

- Start Timer and Study!

- When the timer runs out, an alarm will play for a few seconds

- Either reset the timer or go to the stats page to see your study data visualized! 


## Gif Of Usage

<img src = "git.gif">

## Installation and Setup Instructions

Clone down this repository. You will need `node` , `npm` and `mongoDB` installed globally on your machine.  

Installation:

`npm i`

To Start Server:

Open A new terminal session and run `mongod`, and run `node app.js` in the project directory.

To Visit App:

`localhost:3000`

## Reflection

- I use the pomodoro technique daily to study/ do work, there are many sites for practicing this technique, but none of them allow the user to save and see their progress visually. Seeing progress and the hard work you've put into something is a great motivator for continuing success. 

- This was a huge learning experience because it's the first time i've built an application of this scale, and one of the main challenges I ran into was authentication.

- After a few days of research and reading documentation I decided to use the Passport.js's local strategy for authentication, and express-session for creating cookies and sessions.

- The entire list of technologies used here are, JavaScript, HTML, CSS, Passport.js, EJS, Node.js, Express.js, CanvasJS, express-session, Mongoose, MongoDB, Lodash, and a few other NPM packages.
