/*
    element_Dropdown.js
    Author: Wallis Muraca

    Handles the bottom UI, including the dropdown and
    cover previews to indicate which nodes are selected.
    Probably not super elegant, but it works. 

    [ ]  -->  [ ]
         ==>

*/

class NavigationNodes_Dropdown extends NavigationNodes_element {
    constructor(elem) {
        super(elem);
    }

    // For that node, loop through and get all links, then fill dropwdown 
    populateDropdown(node) {
        document.getElementById('firstNodeSelected').innerHTML = node.name;

        // Get select element
        let select = document.getElementById("pathSelections");

        // Empty options panel to prevent duplicates
        for (let o in select.options) {
            select.options.remove(o);
        }

        // Enable by default (disabled if no paths, down like 5 lines)
        select.removeAttribute("disabled");

        // Loop through paths
        for (let l in node.paths) {
            let linkName = node.paths[l].link_name;
            let pageName = "P" + node.paths[l].page + ": ";
            let name = pageName + linkName;
            if (name) {
                select.options[select.options.length] = new Option(name);
                select.options[select.options.length-1].setAttribute("node-id", node.paths[l].map_node_path_id);
            }
        }
        if (node.paths.length === 1 && !node.paths[0].link_name) {
            select.options[0] = new Option("No paths for connection");
            select.setAttribute("disabled", "true");
            return 0;
        }

        // Return length of options so we can determine if buttons need disabling or not
        // If length 0, no buttons can be clicked
        return select.options.length;

    }

    // return node-id of dropdown selection
    getDropdownSelection() {
        // Get select element
        let select = document.getElementById("pathSelections");

        return select.options[select.selectedIndex].getAttribute("node-id");
    }

    // If no books are selected
    makeDropdownEmpty() {
        document.getElementById('firstNodeSelected').innerHTML = "[No node selected]";
        document.getElementById('secondNodeSelected').innerHTML = "[No node selected]";
        
        let select = document.getElementById("pathSelections");

        // Empty the dropdown
        for (let o in select.options) {
            select.options.remove(o);
        }
    }

    // If no node is passed, used default "No node selected"
    // Else get name from the node
    setFirstNodeTitle(node) {
        let replace = node ? node.name : "[No node selected]"
        document.getElementById('firstNodeSelected').innerHTML = replace
    }

    // Ditto but for the second
    // Eventually I would like to combine this into one slick method bc
    // this is definitely repetitive 
    setSecondNodeTitle(node) {
        let replace = node ? node.name : "[No node selected]"
        document.getElementById('secondNodeSelected').innerHTML = replace
    }

    // To SET the dropdown selection
    // Loop through existing options, and when a match is made,
    // set to selected
    setDropdownSelection(selection) {
        let select = document.getElementById("pathSelections");

        for (let o in select.options) {
            if (select.options[o].value == selection) {
                select.options[o].selected = true;
                break;
            }
        }
    }
}    