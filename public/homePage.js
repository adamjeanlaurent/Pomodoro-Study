// This code ensure that on the homePage, the user is only able to type numeric input and up to 2 characters for each field
function setInputFilter(textbox, inputFilter) {
    ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
      textbox.addEventListener(event, function() {
        if (inputFilter(this.value)) {
          this.oldValue = this.value;
          this.oldSelectionStart = this.selectionStart;
          this.oldSelectionEnd = this.selectionEnd;
        } else if (this.hasOwnProperty("oldValue")) {
          this.value = this.oldValue;
          this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
        }
      });
    });
}

setInputFilter(document.getElementById("hoursBox"), function(value) {
    return /^\d*$/.test(value);
});

setInputFilter(document.getElementById("minutesBox"), function(value) {
    return /^\d*$/.test(value);
});

setInputFilter(document.getElementById("secondsBox"), function(value) {
    return /^\d*$/.test(value);
});
    