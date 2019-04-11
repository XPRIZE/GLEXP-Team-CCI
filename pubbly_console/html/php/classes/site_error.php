<?php

/**
 * Error class. Called in both prod and dev.
 * 
 * If in dev, give a read out of the error message and location.
 * If in prod, simple redirect to the error.html file at web root.
 */
class Site_error {

    function __construct($message) {
        // No html templating here... could be something wrong with template class
        echo "" .
        "<div class='container'>" .
        "<div class='tab selected'>" .
        "<div class='text'>" .
        "<h2 class='f-red'>ERROR</h2>" .
        "<p class='f-darkblue' style='margin:0;padding:0'>" .
        "$message" .
        "</p>" .
        "</div>" .
        "</div>" .
        "</div>" .
        "<hr>";
    }

}
