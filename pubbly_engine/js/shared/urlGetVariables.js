/*
Self explanitory, probably should be moved to helper.js
*/
function getUrlVars() {
    /*
     * Breaks up the window.location.href URL
     * returns an obj of php url GET variables
     * 
     * href="index.php?var1=asdf&var2=qwerty"
     * {var1: "asdf", var2: "qwerty"}
     */
    let ret = {};
    // index.php?var1=asdf&...
    let url = window.location.href.split("/").pop();
    // var1=asdf&...
    let justVars = url.split("?");
    if (justVars.pop) {
        ret = justVars.pop().split("=");

    }   else    {
        console.warn("Error: URL does not have a ? at the end... probably not a PHP url, returning empty obj");
    }
    return ret;
}
