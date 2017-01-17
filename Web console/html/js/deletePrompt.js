/**
 * Created by Jason on 8/24/2016.
 */
function deletePrompt(nameToCheck, typeOfDeletion, ajaxURL, callback) {
  if (window.confirm("Are you sure you want to delete " + '"' + nameToCheck + '"' + "? This action cannot be undone.")) {
    var pass = window.prompt("Type " + nameToCheck + " to DELETE " + typeOfDeletion);
    if (pass == nameToCheck) {
      $.ajax(ajaxURL).done(
        function (ret) {
          if (ret == "done") {
            if (callback) {
              callback();
            } else {
              window.location.href = window.location.href;
            }
          } else if (ret.split("error: ").length >= 2) {
            var mesg = ret.replace("</br>","\r\r");
            webix.message(mesg);
          } else {
            document.body.innerHTML = ret;
          }
        }
      );
    } else {
      if (pass) {
        webix.message("Wrong " + typeOfDeletion + " name");
      }
    }
  }
}