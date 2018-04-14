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



//generateAnalytics(1);
