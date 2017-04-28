/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function login(success, error) {
    readFile("loggedIn.txt", function (userID) {
	if (userID) {
	    readFile("users/" + userID + "/school.xml", function (xml) {
		if (xml) {
		    success(userID, xml);
		} else {
		    console.error("Boo, bad XML");
		    console.error(xml);
		    error();
		}
	    })
	} else {
	    error("Not logged in");
	    error();
	}
    })
}
