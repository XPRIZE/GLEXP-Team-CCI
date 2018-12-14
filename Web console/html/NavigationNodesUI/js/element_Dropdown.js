class NavigationNodes_Dropdown extends NavigationNodes_element {
    constructor(elem) {
        super(elem);
    }

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
            select.options[select.options.length] = new Option("No paths for connection");
            select.setAttribute("disabled", "true");
        }

        return select.options.length;

    }

    getDropdownSelection() {
        // Get select element
        let select = document.getElementById("pathSelections");

        return select.options[select.selectedIndex].getAttribute("node-id");
    }

    makeDropdownEmpty() {
        document.getElementById('firstNodeSelected').innerHTML = "[No node selected]";
        document.getElementById('secondNodeSelected').innerHTML = "[No node selected]";
        
        let select = document.getElementById("pathSelections");

        for (let o in select.options) {
            select.options.remove(o);
        }
    }

    setSecondNodeTitle(node) {
        document.getElementById('secondNodeSelected').innerHTML = node.name;
    }

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