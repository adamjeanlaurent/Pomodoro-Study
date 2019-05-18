let timer = document.getElementById('timer');
let pauseBTN = document.getElementById('pause');
let resumeBTN = document.getElementById('resume');

let counter = 0;
let timeLeft = parseInt(timeForTimer, 10);

timer.innerHTML = convertSeconds(timeLeft - counter);

pauseBTN.addEventListener("click", function(){
    clearInterval(interval);
    pauseBTN.style.display = "none";
    resumeBTN.style.display = "block";
});

resumeBTN.addEventListener("click", function(){
    interval = setInterval(timeIt, 1000);
    resumeBTN.style.display = "none";
    pauseBTN.style.display = "block";
});

let interval = setInterval(timeIt, 1000);
pauseBTN.click();

if (timeLeft === 0){
    clearInterval(interval); // stops the time interval
    resumeBTN.style.display = "none";
    pauseBTN.style.display = "none";
}

let alarm = new Audio('alarm.mp3');

function convertSeconds(s){
    let hour = 0;
    if(s >= 3600){
        hour = Math.floor(s/3600);
        s = s - (hour * 3600);
    }

    let min = Math.floor(s / 60);
    let sec = s % 60;
    if(sec < 10){
        sec = '0' + sec;
    }

    if(min < 10){
        min = '0' + min;
    }

    if(hour < 10){
        hour = '0' + hour;
    }
    return hour + ':' + min + ':' + sec;
}

function timeIt(){
    //make a check in the server, to make sure the user's time is greater than 0 , and perhaps lower than 24 hours?
    counter++;
    timer.innerHTML = convertSeconds(timeLeft - counter);

    if (counter == timeLeft){
        alarm.play();
        clearInterval(interval); // stops the time interval
        resumeBTN.style.display = "none";
        pauseBTN.style.display = "none";
    }
}




