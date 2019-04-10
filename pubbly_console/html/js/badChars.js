/**
 * Created by Jason on 8/27/2016.
 */
var noBadNameChars = function(str) {
  var badChars = ["'",'"',"`","."];
  for (var c = 0; c < badChars.length; c++) {
    var char = badChars[c];
    if (str.includes(char)) {
      webix.message("Name cannot contain the character " + char + ", please try again.");
      return false;
    }
  }
  return true;
}