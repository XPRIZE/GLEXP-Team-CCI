function error(level, type, message) {
    // level ["fatal","warn","log"] | type ~Abouts where the error happened~ | message ~anything~
    this.level = (level === true) ? "fatal" : level.toString().toLowerCase();
    this.type = type.toLowerCase();
    this.message = message;

    var message = "";
    message += autocase(this.type);
    message += " error:\n";
    message += this.message;
    if (this.level === "update") {
        changeHTML(messyHTML("newEngineUpdate"));
    } else if (this.level === "fatal") {
        if (window.testing) {
            console.error("Fatal error");
        } else {
            fatalProductionError(message);
        }
    } else if (this.level === "warn") {
        console.warn(message);
        // window.alert(message);
    } else if (this.level === "log") {
        console.log(message);
    } else {
        console.error(`Unknown error level of ${this.level}, logging: `);
        console.log(message);
    }
}
function fatalProductionError(msg) {
    // When stuff breaks on our production platform! Display a client friendly error message page
    console.error(msg);
    // window.location.href = ("error.html");
}

function changeHTML(html) {
    // Only change once (first fatal);
    if (!window.htmlChanged) {
        window.htmlChanged = true;
        document.body.innerHTML = html;
    }
}

window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
    error("fatal","window error", errorMsg);
    return false;
}