/*
    element_Entry.js
    Author: Wallis Muraca

    Element class for entry node button
*/


class NavigationNodes_Save extends NavigationNodes_element {
    constructor(elem) {
        super(elem);
        this.availableEvents.push("click");
    }
}