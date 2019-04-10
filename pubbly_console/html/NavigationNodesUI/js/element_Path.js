/*
    element_Path.js
    Author: Wallis Muraca

    Element class for path buttons
*/


class NavigationNodes_Path extends NavigationNodes_element {
    constructor(elem) {
        super(elem);
        this.availableEvents.push("click");
    }
}