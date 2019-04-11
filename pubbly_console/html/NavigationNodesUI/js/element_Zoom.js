/*
    element_Zoom.js
    Author: Wallis Muraca

    Element class for zoom buttons
*/

class NavigationNodes_Zoom extends NavigationNodes_element {
    constructor(elem) {
        super(elem);
        this.availableEvents.push("click");
    }
}