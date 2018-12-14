document.addEventListener("DOMContentLoaded", function() {
    new fake_post("../../php/process/newUser.php", {
        username: "jason",
        password: {
            type: "password",
            value: "asdfasdf"
        },
        hint: "it's asdf",
        email: "jason@jason.jason",
        age: 25
    });
});
