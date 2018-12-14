class fake_post {

    makeForm(url) {
        let form = document.createElement("form");
        form.method = "post";
        form.action = url;
        form.style.display = "none";
        document.body.appendChild(form);
        return form;
    }

    constructor(url, data) {
        let form = this.makeForm(url);
        for (let k in data) {
            let i = data[k];

            let postVal = (i.value) ? i.value : i;
            let type = (i.type) ? i.type : false;
            let input = document.createElement("input");
            if (!type) {
                // typeof 1 (easy), typeof "1" (shit)
                if (!isNaN(Number("b"))) {
                    // Is a number
                    input.type = "number";
                } else {
                    // assume text
                    input.type = "text";
                }
            } else {
                input.type = type;
            }
            input.name = k;
            input.value = postVal;

            form.appendChild(input);
        }
        form.submit();
    }
}

