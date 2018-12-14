function NavigationUI(buildSpecs, container) {
    const _NavigationUI = this;

    /* buildSpecs: 
     *  display:[composite, single]
     *  bookLength:number
     */
    this.specs = {
        //  -- in init, to throw errors and stuff
        // display: buildSpecs.display,
        // length: bookLength,
        // initShown: true/false
        display: "",
        bookLength: 0,
        initShown: true,
        initEnabled: true,
        startPage: 0,
        lastPageSpread: true
    }

    this.elems = {
        cont: false,
        next: false,
        prev: false,
        goto: false,
        gotoSelect: false,
        gotoCover: false,
    }

    this.getCurPageString = function (updatePage) {
        if (updatePage == 0) {
            return "COVER";
        } else {
            if (this.specs.display !== "composite") {
                return updatePage;
            } else {
                if (updatePage == this.specs.bookLength - 1
                        && !this.specs.lastPageSpread) {
                    return (this.specs.bookLength - 1) * 2;
                } else {
                    let firstNum = updatePage * 2;
                    return firstNum + "-" + (1 + firstNum);
                }
            }
        }
    }

    this.enable = function () {
        $(".navigationUI .next").removeClass("disabled");
        $(".navigationUI .goto").removeClass("disabled");
        $(".navigationUI .previous").removeClass("disabled");
    }
    this.disable = function () {
        $(".navigationUI .next").addClass("disabled");
        $(".navigationUI .goto").addClass("disabled");
        $(".navigationUI .previous").addClass("disabled");
    }
    this.hide = function () {
        $(".navigationUI").css("display", "none");
    }
    this.show = function () {
        $(".navigationUI").css("display", "inline-block");
    }

    this.update = function (newPage) {
        // Update goto index

        // TODO: Use this.elems not $ shit
        // Update goto cover
        $(".goto p.cover").html(this.getCurPageString(newPage));

        // In case page changed through sequencing
        if ($(".goto select option:selected")[0])
            $(".goto select option:selected")[0].removeAttribute("selected");
        if ($(".goto select option.page_" + newPage)[0])
            $(".goto select option.page_" + newPage)[0].setAttribute("selected", "");

        // Disable next if no next
        if (newPage + 1 == this.specs.bookLength) {
            $(".navigationUI .next").addClass("noTurn");
        } else {
            $(".navigationUI .next").removeClass("noTurn");
        }
        // Disable prev if no prev
        if (newPage == 0) {
            $(".navigationUI .previous").addClass("noTurn");
        } else {
            $(".navigationUI .previous").removeClass("noTurn");
        }
    }

    this.init = function () {
        let errMessage = "";
        for (let prop in this.specs) {
            if (typeof buildSpecs[prop] == "undefined") {
                errMessage += "Missing buildSpecs property '" + prop + "'\r\n";
            } else {
                this.specs[prop] = buildSpecs[prop];
            }
        }
        if (errMessage !== "") {
            error("fatal", "navigationUI", errMessage + "\r\n" + "Check top of constructor for how to init");
        } else {
            this.specs.display = buildSpecs.display;
            this.specs.length = buildSpecs.bookLength;

            let options = "<option class='page_0'>COVER</option>";
            for (let p = 1; p < this.specs.bookLength; p++) {
                options += "\r\n<option class='page_" + p + "'>" + this.getCurPageString(p) + "</option>";
            }
            container.append(`
<div class='navigationUI'>
    <div class='previous'>
        <img />
    </div>
    <div class='goto'>
        <p class='cover'>COVER</p>
        <select class='dropdown'>
            ${options}
        </select>
    </div>
    <div class='next'>
        <img />
    </div>
</div>`);
            this.elems.cont = container.find(".navigationUI");
            // TODO: Put elems here

            // throw away props, only used here, no need to transfer over to this.specs
            if (!buildSpecs.initShown) {
                this.hide();
            }
            if (!buildSpecs.initEnabled) {
                this.disable();
            }
            this.update(this.specs.startPage);
        }
    };

    this.init();
}
