function wb_build() {
    webix.ui({
        type: "space", rows: [
            {
                view: "toolbar",
                height: 55,
                autoWidth: true,
                cols: [
                    {},
                    {
                        view: "label",
                        template: "<p class='toolbarCenterLabel text-center m-0' style='font-size:19;line-height:42px'>Console Login</p>"
                    },
                    {}
                ]
            },
            {},
            {
                cols: [
                    {},
                    {
                        id: "loginForm",
                        view: "form", scroll: false, elements: [
                            {name: "username", view: "text", value: '', label: "Username"},
                            {
                                name: "password", view: "text", type: 'password', value: '', label: "Password",
                                on: {
                                    onKeyPress: function (e) {
                                        if (e == 13) {
                                            $$(this).blur();
                                            login();
                                        }
                                    }
                                }
                            },
                            {
                                id: "loginError",
                                view: "label",
                                label: "",
                                align: "center",
                                css: {"color": "red", "transition": "0.5s"},
                                height: 0
                            },
                            {
                                margin: 10, cols: [
                                    {},
                                    {
                                        view: "button", value: "Register", on: {
                                            onItemClick: function () {
                                                window.location.href = "register.php";
                                            }
                                        }
                                    },
                                    {
                                        view: "button", value: "Login", id: "loginButton", type: "form",
                                        on: {
                                            onItemClick: function () {
                                                var data = $$("loginForm").getValues();
                                                var post = {};
                                                post.password = data.password;
                                                post.username = data.username;
                                                new fake_post("php/process/login.php", post);
                                            }
                                        }
                                    },
                                ]
                            }
                        ]
                    },
                    {},
                ]
            },
            {},
            {},
            {},
            {},
            {},
            {},
        ]
    });
}