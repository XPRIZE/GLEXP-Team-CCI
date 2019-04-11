function wb_build() {
    webix.ui({
        type: "space",
        rows: [
            {
                view: "toolbar",
                height: 55,
                autoWidth: true,
                cols: [
                    {
                        view: "button", value: "Home", width: 80, on: {
                            onItemClick: function () {
                                window.location.href = "index.php";
                            }
                        }
                    },
                    {
                        view: "label",
                        template: "<p class='toolbarCenterLabel'>Register</p>"
                    },
                    {width: 80},
                ]
            },
            {},
            {
                cols: [
                    {},
                    {
                        id: "loginForm",
                        view: "form", scroll: false, width: 300, header: "Create a new user account", elements: [
                            {name: "username", view: "text", value: '', label: "Username"},
                            {name: "email", view: "text", value: '', label: "Email"},
                            {name: "pass1", view: "text", type: 'password', value: '', label: "Password"},
                            {name: "pass2", view: "text", type: 'password', value: '', label: "Confirm password"},
                            {name: "passHint", view: "text", value: '', label: "Password hint"},
                            {
                                view: "button", value: "Register",
                                on: {
                                    onItemClick: function () {
                                        if (this.getParentView().validate()) {
                                            checkUsername($$("loginForm").elements.username.getValue(), function (good) {
                                                if (good) {
                                                    var data = $$("loginForm").elements;
                                                    var post = {};
                                                    post.username = data.username.getValue();
                                                    post.email = data.email.getValue();
                                                    post.password = hex_sha512(data.pass1.getValue());
                                                    post.password2 = hex_sha512(data.pass2.getValue());
                                                    post.hint = data.passHint.getValue();
                                                    new fake_post("php/process/newUser.php", {
                                                        username: data.username.getValue(),
                                                        password: {
                                                            type: "password",
                                                            value: data.pass1.getValue()
                                                        },
                                                        password2: data.pass2.getValue(),
                                                        hint: data.passHint.getValue(),
                                                        email: data.email.getValue(),
                                                    });
                                                } else {
                                                    webix.message("Username is already taken, sorry");
                                                }
                                            });
                                        }
                                    }
                                }
                            },
                        ],
                        elementsConfig: {
                            labelPosition: "top",
                        },
                        rules: {
                            $obj: function (data) {
                                // Blank checks
                                if (!data.username) {
                                    webix.message("Username cannot be blank");
                                    return false;
                                }
                                if (!data.email) {
                                    webix.message("Email cannot be empty");
                                    return false;
                                }
                                if (!data.pass1 || !data.pass2) {
                                    webix.message("Passwords cannot be empty");
                                    return false;
                                }
                                if (!data.passHint) {
                                    webix.message("Hint cannot be empty");
                                    return false;
                                }

                                if (data.pass1 !== data.pass2) {
                                    webix.message("Passwords must match");
                                    return false;
                                }
                                if (data.pass1.length < 6) {
                                    webix.message("Password must be at least 6 characters");
                                    return false;
                                }
                                if (data.pass1.toLowerCase() === "password") {
                                    webix.message("Come on man, choose something better than 'password'. That's like the first thing they try...");
                                    return false;
                                }
                                if (data.pass1.toLowerCase() === "password1") {
                                    webix.message("Password1? Lazy man... just lazy. You never had a favorite pet or something?");
                                    return false;
                                }
                                if (data.pass1.toLowerCase() === "password2") {
                                    webix.message("Alright, that's it!!");
                                    window.setTimeout(function () {
                                        window.location.href = "http://www.dummies.com/how-to/content/how-to-choose-and-to-protect-passwords.html";
                                    }, 1000);
                                    return false;
                                }
                                if (data.pass1 === data.passHint) {
                                    webix.message("Password hint cannot be password");
                                    return false;
                                }
                                if (data.email.split("@").length !== 2 || data.email.split(".").length < 2) {
                                    webix.message("Must enter a valid email");
                                    return false;
                                }

                                return true;
                            }
                        }
                    },
                    {},
                ]
            },
            {},
        ],
    });
}
function checkUsername(which, callback) {
    $.ajax({
        url: "php/ajax/checkUsername.php",
        data: {username: which},
        success: function (ret) {
            if (ret == "available") {
                callback(true);
            } else if (ret == "taken") {
                callback(false);
            } else {
                // document.body.innerHTML = ret;
                callback(false);
            }
        }
    });
}