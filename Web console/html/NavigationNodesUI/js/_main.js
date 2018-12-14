class NavigationNodes {

    insertNewNodeTest(newJSON) {
        let nj = {
            name: "static-Pots",
            cover: 0,
            links: Array(0),
            node_id: 21
        }
        nj.x = this.getCenter()[0];
        nj.y = this.getCenter()[1];

        //console.log("adding new node??");
        this.json[nj.name] = nj;
    }

    // Start of Jason messed around
    // Plus added a line to top of method eventMouseMoveCanvas

    play_getNodeInfoByFancyName(fancyName) {
        for (let nodeName in this.json) {
            if (this.json[nodeName].name == fancyName) {
                return this.json[nodeName];
            }
        }
    }
    // 
    play_getLines(mx, my) {
        let lines = [];
        for (let nodeName in this.json) {
            let node = this.json[nodeName];

            node.paths.map(pth => {
                if (pth.url) {
                    let endNode = this.play_getNodeInfoByFancyName(pth.url);
                    lines.push({
                        start: [
                            node.x + node.width / 2,
                            node.y + node.height / 2
                        ],
                        // End of whatever we use to calculate where the arrow ends, not where the center node ends.
                        end: this.determineArrowEndingPoint(node, endNode),
                        fromNode: node.name,
                        pathName: pth.name,
                        toNode: endNode.name
                    });
                }
            });
        }
        let firstHoveredLine = lines.find(ln => {
            // distanceToLineSegment? 
            // Shamelessly copied to helper.js from the first result of 
            // "github javascript distance of point and line MIT" (MIT best license)
            return distanceToLineSegment(
                    ln.start[0], ln.start[1],
                    ln.end[0], ln.end[1],
                    mx, my) < 10 // line thickness
        });

        return firstHoveredLine;
    }

    // End of Jason messed around


    loadAssets(cb) {
        let needed = 0;
        let recieved = 0;
        for (let nodeName in this.json) {
            // Counts how many unique images we need to load in to display the project
            needed++;
            // Easier loop
            let node = this.json[nodeName];
            // Assigning to node (carries backwards to this.json) for later access
            node.img = new Image();
            node.img.onload = function () {
                // Still references the variable declared at top of this.loadAssets
                recieved++;
                if (recieved == needed) {
                    // All images loaded in good... We can call a first draw function
                    cb();
                }
            };
            node.img.src = node.cover;
        }
        this.starImg = new Image();
        this.starImg.src = "NavigationNodesUI/assets/star.png";
    }

    // Puts nodes in a grid 
    placeVirginProjectNodes() {

    }
    checkIfProjectVirgin() {
        for (let nodeName in this.json) {
            if (typeof this.json[nodeName].x == "undefined") {
                // Returning auto "breaks";
                return true;
            }
        }
        // Only here if not yet returned (no need to break)
        return false;
    }

    clearCanvas() {
        this.inputs.nodeCanvas.clear();
    }

    drawAllNodes() {
        for (let nodeName in this.json) {
            let img = this.json[nodeName].img;
            if (img) {
                this.inputs.nodeCanvas.drawImage(
                        img,
                        this.json[nodeName].x,
                        this.json[nodeName].y,
                        this.json[nodeName].width,
                        this.json[nodeName].height);
                if (this.json[nodeName].isEntryNode) {
                    this.drawEntryNodeStar(this.json[nodeName]);
                }
            }
        }
    }

    drawNodeRect(color, node) {
        if (node !== undefined) {
            this.inputs.nodeCanvas.drawRect(
                    color,
                    node.x,
                    node.y,
                    node.width,
                    node.height);
        }
    }

    drawNodesRectanglesAndLines() {

        this.clearCanvas();
        this.determinePaths();
        this.drawAllNodes();
        //this.drawEntryNodeStar();
        this.drawNodeRect("red", this.curNode);
        this.drawNodeRect("green", this.secondNode);

    }

    drawEntryNodeStar(node) {
        this.inputs.nodeCanvas.drawImage(this.starImg,
                node.x + node.width / 2 - 25,
                node.y + node.height / 2 - 25, 50, 50);
    }

    getCenter() {
        let o = this.inputs.nodeCanvas.offset;
        let z = this.inputs.nodeCanvas.zoom;
        let c = this.inputs.nodeCanvas.getCenter();
        let widthMod = this.inputs.nodeCanvas.width * (1 / z / 2);
        let heightMod = this.inputs.nodeCanvas.height * (1 / z / 2);
        return[-o[0] + widthMod, -o[1] + heightMod, 50, 50];
    }

    determinePaths() {
        // Go through each node
        this.listOfPaths = [];
        let paths = {};
        for (let nodeName in this.json) {
            for (let l in this.json[nodeName].paths) {

                //this.inputs.nodeCanvas.drawLine("black",0,0,node.x,node.y);
                // Go through each path in that node
                for (let nodeNameAgain in this.json) {
                    // Go through each node again 
                    // If a path equals that node, add to array and break. moving on
                    // to next path
                    if (this.json[nodeName].paths[l].url == this.json[nodeNameAgain].name) {
                        this.listOfPaths.push([this.json[nodeName], this.json[nodeNameAgain]]);

                        let color = "gray";
                        if (this.json[nodeName] == this.curNode) {
                            // Populate dropdown to show existing path
                            if (this.json[nodeNameAgain] == this.secondNode || this.secondNode == undefined) {
                                this.inputs.dropDown.setDropdownSelection(this.json[nodeName].paths[l].name);
                                color = "black";
                            }
                        }

                        let arrowEndingLoc = this.determineArrowEndingPoint(this.json[nodeName], this.json[nodeNameAgain]);
                        let pathName = nodeName + "-" + nodeNameAgain;
                        if (paths[pathName]) {
                            paths[pathName].lineWidth += 5;
                        } else {
                            paths[pathName] = {
                                start: [
                                    this.json[nodeName].x + this.json[nodeName].width / 2,
                                    this.json[nodeName].y + this.json[nodeName].height / 2,
                                ],
                                end: [
                                    arrowEndingLoc[0],
                                    arrowEndingLoc[1]
                                ],
                                color: color,
                                lineWidth: 1
                            }
                        }
                    }
                }
            }
        }
        for (let path in paths) {
            this.inputs.nodeCanvas.drawArrow(paths[path].color,
                    paths[path].start[0],
                    paths[path].start[1],
                    paths[path].end[0],
                    paths[path].end[1],
                    Math.min(30, paths[path].lineWidth));
        }
    }

    determineArrowEndingPoint_backup(node1, node2) {
        let slope = getSlope(node1.x, node1.y, node2.x, node2.y);
        let minRadius = Math.max(node2.height, node2.width) / 2;
        let xMod = 0;
        let yMod = 0;
        let closeX, farX, closeY, farY;

        if (node1.x < node2.x) {
            closeX = (node2.x + node2.width / 2) - minRadius;
            farX = (node2.x + node2.width / 2) + minRadius;
        } else {
            closeX = (node2.x + node2.width / 2) + minRadius;
            farX = (node2.x + node2.width / 2) - minRadius;
        }

        if (node1.y < node2.y) {
            closeY = (node2.y + node2.height / 2) - minRadius;
            farY = (node2.y + node2.height / 2) + minRadius;
        } else {
            closeY = (node2.y + node2.height / 2) + minRadius;
            farY = (node2.y + node2.height / 2) - minRadius;
        }

        let avgX = (closeX + farX) / 2;
        let avgY = (closeY + farY) / 2;

        let ang = angle(node1.x, node1.y, node2.x, node2.y);
        if (Math.abs(ang) > 45 && Math.abs(ang) < 125) {
            // Draw to middle top/bottom
            return [avgX, closeY];
        } else {
            // Draw to left/right middle
            return [closeX, avgY];
        }
    }

    determineArrowEndingPoint(node1, node2) {
        if (node1.y + node1.height < node2.y) {
            if (node1.x + node1.width / 2 < node2.x) {
                return [node2.x, node2.y];
            } else if (node1.x + node1.width / 2 < node2.x + node2.width) {
                return [node2.x + node2.width / 2, node2.y];
            } else {
                return [node2.x + node2.width, node2.y];
            }
        } else if (node1.y < node2.y + node2.height) {
            if (node1.x + node1.width / 2 < node2.x) {
                return [node2.x, node2.y + node2.height / 2];

            } else {
                return [node2.x + node2.width, node2.y + node2.height / 2];
            }
        } else {
            if (node1.x + node1.width / 2 < node2.x) {
                return [node2.x, node2.y + node2.height];

            } else if (node1.x + node1.width / 2 < node2.x + node2.width) {
                return [node2.x + node2.width / 2, node2.y + node2.height];

            } else {
                return [node2.x + node2.width, node2.y + node2.height];
            }
        }
    }

    generateNodeConnectionArrowPoints(node1, node2) {
        // TODO 10/4
        for (let l in node1.paths) {
            if (node1.paths[l].url == node2.name) {
                // Position logic
                this.inputs.nodeCanvas.drawArrow("black", node1.x, node1.y, node2.x, node2.y);
            }
        }
    }

    drawAllLines() {
        for (let nodeName in this.json) {
            if (this.json[nodeName] == this.curNode)
                this.drawLines(this.json[nodeName], "black");
            else
                this.drawLines(this.json[nodeName], "gray");
        }
    }

    changeNodePhoto() {
        let firstCoverSrc = (this.curNode) ? this.curNode.cover : "NavigationNodesUI/assets/nonodeselected.png";
        document.getElementById("firstNodePhoto").src = firstCoverSrc;

        let secondCoverSrc = (this.secondNode) ? this.secondNode.cover : "NavigationNodesUI/assets/nonodeselected.png";
        document.getElementById("secondNodePhoto").src = secondCoverSrc;


        if (this.secondNode)
            document.getElementById("secondNodePhoto").src = this.secondNode.cover;
    }

    // Updates the JSON in /project
    saveJSON() {
        let justPoints = {};
        for (let nodeName in this.json) {
            let node = this.json[nodeName];
            if (node.x === node.initX && node.y === node.initY) {
                // No change
            } else {
                justPoints[nodeName] = {
                    node_id: node.node_id,
                    x: node.x,
                    y: node.y
                }
            }
        }
        justPoints = JSON.stringify(justPoints);
        let type = (justPoints.length) > 512 ? "POST" : "GET";
        ajax_general("moveNodesOnMap",
                {nodePlacements: justPoints, mapName: btoa(mapName)},
                {done: function () {
                        console.log("done");
                    }
                }, type);
        let mapZoom = this.inputs.nodeCanvas.zoom;
        let mapOffset = this.inputs.nodeCanvas.offset;
        this.cookies.set('edit_map-zoom', mapZoom, 1);
        this.cookies.set('edit_map-offset', mapOffset, 1);
    }

    // Events to be called back with class NavigationNodes scope.
    // ALL events using 
    //     arg1: relative mouse loc {x, y}
    //     arg12: element where event was generated
    getFirstNodeUnderneathMouseLoc(loc) {
        let hoveredNodes = [];
        for (let bn in this.json) {
            let node = this.json[bn];
            let poly = [
                [node.x, node.y],
                [node.x + node.width, node.y],
                [node.x + node.width, node.y + node.height],
                [node.x, node.y + node.height],
            ]
            if (inside([loc.x, loc.y], poly)) {
                hoveredNodes.push(node);
            }
        }
        // TODO: Order hoveredNodes by layer, skim first from top (nodes could overlap)
        return hoveredNodes[0]; // either a node, or undefined (which is falsy)
    }

    eventMouseUpCanvas(loc, e, elem)
    {
        //TODO snap to grid

        this.isPanning = false;

        if (this.curMovingNode) {
            this.curMovingNode.x = round(this.curMovingNode.x, 40);
            this.curMovingNode.y = round(this.curMovingNode.y, 40);
        }

        this.curMovingNode = false;

        this.clearCanvas();
        this.determinePaths();
        this.drawAllNodes();
        this.drawNodeRect("red", this.curNode);
        this.drawNodeRect("green", this.secondNode);

        this.changeNodePhoto();



        this.theTimer = window.setTimeout(function () {
            this.saveJSON();
            let currDate = new Date();
            let timeString = "Last saved: " + currDate.toLocaleTimeString();

            $("#savePrompt").css({"opacity": 1});
            $("#savePrompt").html(timeString);

            window.clearTimeout(this.fadeTimeout);
            this.fadeTimeout = window.setTimeout(function () {
                $("#savePrompt").animate({"opacity": 0}, 1000);
            }, 2000);


        }.bind(this), 5000);

    }

    eventMouseDownCanvas(loc, e, elem) {
        console.log(loc.x + this.inputs.nodeCanvas.offset[0] + " " + e.x);

        window.clearTimeout(this.theTimer);

        let clickedNode = this.getFirstNodeUnderneathMouseLoc(loc);
        let clickedLine = this.play_getLines(loc.x, loc.y);

        if (this.curNode && this.secondNode) {
            this.generateNodeConnectionArrowPoints(this.curNode, this.secondNode);
        }

        if (clickedNode && !e.shiftKey) {
            if (clickedNode == this.secondNode) {
                this.secondNode = undefined;
            }
            let id = clickedNode.node_id;
            $("#file_upload_form").attr("action", "php/ajax/uploadNodeCover.php?nodeID=" + id);
            this.curNode = clickedNode;
            this.curMovingNode = clickedNode;
            this.inputs.dropDown.populateDropdown(this.curNode);
            if (this.inputs.dropDown.populateDropdown(this.curNode) == 0) {
                this.inputs.pathButton.disableEvent("click");
                this.inputs.allPathButton.disableEvent("click");
            } else {
                //Re-enable relevant buttons
                this.inputs.pathButton.enableEvent("click");
                this.inputs.allPathButton.enableEvent("click");
                this.inputs.viewAt.enableEvent("click");
            }

            this.changeNodePhoto();
            this.drawNodesRectanglesAndLines();
        } else if (clickedNode && e.shiftKey) {
            this.secondNode = clickedNode;
            this.curMovingNode = clickedNode;

            if (this.curNode) {
                if (this.curNode.name == this.secondNode.name) {
                    this.curNode = undefined;
                }
            }

            this.drawNodesRectanglesAndLines();

            this.inputs.dropDown.setSecondNodeTitle(this.secondNode);
            this.changeNodePhoto();
        } else if (clickedLine) {
            this.curNode = this.play_getNodeInfoByFancyName(clickedLine.fromNode);
            this.secondNode = this.play_getNodeInfoByFancyName(clickedLine.toNode);

            this.inputs.dropDown.populateDropdown(this.curNode);
            this.inputs.dropDown.setDropdownSelection(clickedLine.pathName);
            this.inputs.dropDown.setSecondNodeTitle(this.secondNode);

            this.clearCanvas();
            this.determinePaths();
            this.drawAllNodes();
            this.drawNodeRect("red", this.curNode);
            this.drawNodeRect("green", this.secondNode);

            this.changeNodePhoto();
        } else {
            // Clicking empty canvas space
            this.curNode = undefined;
            this.secondNode = undefined;
            this.clearCanvas();
            this.determinePaths();
            this.drawAllNodes();
            this.changeNodePhoto();
            this.inputs.dropDown.makeDropdownEmpty();

            // disable relevant buttons here:
            this.inputs.pathButton.disableEvent("click");
            this.inputs.allPathButton.disableEvent("click");
            this.inputs.viewAt.disableEvent("click");

            this.curMovingNode = false;
            this.isPanning = true;

            this.initialX = e.offsetX;
            this.initialY = e.offsetY;
        }
    }
    eventMouseMoveCanvas(loc, e, elem) {
        // playing around with ideas.
        let hoveringOnALine = this.play_getLines(loc.x, loc.y);


        if (this.curMovingNode && !e.shiftKey) {
            this.curNode = this.curMovingNode;
            this.curMovingNode.x = loc.x - this.curMovingNode.width / 2, 20;
            this.curMovingNode.y = loc.y - this.curMovingNode.height / 2, 20;

            this.drawNodesRectanglesAndLines();
        } else if (this.curMovingNode && e.shiftKey) {
            // some stuff
            this.secondNode = this.curMovingNode;
            this.curMovingNode.x = loc.x - this.curMovingNode.width / 2;
            this.curMovingNode.y = loc.y - this.curMovingNode.height / 2;

            this.drawNodesRectanglesAndLines();

        } else {
            let hoverNode = this.getFirstNodeUnderneathMouseLoc(loc);

            this.drawNodesRectanglesAndLines();

            if (hoverNode) {
                this.inputs.nodeCanvas.changeCursor("pointer");
                if (hoverNode != this.curNode && hoverNode != this.secondNode) {
                    this.drawNodeRect('white', hoverNode);
                }
            } else {
                this.inputs.nodeCanvas.changeCursor();
            }

            if (hoveringOnALine) {
                this.inputs.nodeCanvas.changeCursor("pointer");
            }

        }
        if (this.isPanning) {
            this.inputs.nodeCanvas.offset[0] += (this.initialX - e.offsetX) / -this.inputs.nodeCanvas.zoom;
            this.inputs.nodeCanvas.offset[1] += (this.initialY - e.offsetY) / -this.inputs.nodeCanvas.zoom;

            this.initialX = e.offsetX;
            this.initialY = e.offsetY;

            this.clearCanvas();
            this.determinePaths();
            this.drawAllNodes();

            this.drawNodeRect("red", this.curNode);
            this.drawNodeRect("green", this.secondNode);
        }
    }

    eventMouseWheelCanvas(loc, e, elem) {
        if (e.deltaY < 0) {
            this.eventClickZoomIn(loc, e, elem);
        } else
            this.eventClickZoomOut(loc, e, elem);

        console.log(this.inputs.nodeCanvas.zoom);
        console.log(this.inputs.nodeCanvas.offset);
    }

    eventClickZoomIn(loc, e, elem) {
        let factor = 0.1;

        this.inputs.nodeCanvas.zoom += factor;

        this.clearCanvas();
        this.determinePaths();
        this.drawAllNodes();
    }
    eventClickZoomOut(loc, e, elem) {
        let factor = 0.1;
        this.inputs.nodeCanvas.zoom -= factor;

        this.clearCanvas();
        this.determinePaths();
        this.drawAllNodes();
    }
    eventClickSave(loc, e, elem) {
        // TODO: Please wait, disable everything, callback, enable buttons
        this.inputs.save.disableEvent("click");
        this.saveJSON();
        this.inputs.save.enableEvent("click");
    }

    eventClickPath(loc, e, elem) {
        let selPath = this.inputs.dropDown.getDropdownSelection();
        this.attachOne(selPath);
        this.drawNodesRectanglesAndLines();
    }

    attachOne(which) {
        if (this.curNode && this.secondNode) {

            for (let l in this.curNode.paths) {
                if (which == this.curNode.paths[l].map_node_path_id) {
                    this.curNode.paths[l].url = this.secondNode.name;
                }
            }

            let fromPathId = which;

            ajax_general("addNodeConnectionToMap", {
                mapID: window.mapID,
                fromPathID: fromPathId,
                toNodeID: this.secondNode.node_id,
            }, {done: function () {
                    console.log("done");
                }
            }, "get");
        }
    }

    attachAllPaths() {
        for (let path in this.curNode.paths) {
            this.attachOne(this.curNode.paths[path].map_node_path_id);
        }
    }

    eventClickEntry(loc, e, elem) {
        for (let nodeName in this.json) {
            this.json[nodeName].isEntryNode = false;
        }
        this.curNode.isEntryNode = true;
        this.drawNodesRectanglesAndLines();
        ajax_general("setNodeToEntryPoint", {
            nodeID: this.curNode.node_id,
        }, {done: function () {
                console.log("done");
            }}, "get");
    }

    eventClickDelete(loc, e, elem) {
        if (this.curNode) {
            ajax_general("deleteNodeFromMap", {
                nodeID: this.curNode.node_id,
            }, {done: function () {
                    console.log("done");
                    window.location.href = window.location.href;
                }}, "get");
        }
    }
    eventClickViewAt(loc, e, elem) {
        if (this.curNode) {
            window.open("read.php?engineCode=new&t=m&mn=" + window.mapName + "&nn=" + this.curNode.name);
        }
    }

    eventClickUpdate(loc, e, elem) {
        $("#modalBlack").removeClass("hidden");
        $("#modalWhite").removeClass("hidden");

        ajax_general("updateAllNodesOnMap",
                {
                    mapID: window.mapID,
                },
                {
                    done: function () {
                        // TODO: Change to a soft refresh
                        window.location.href = window.location.href;
                        $("#modalBlack").addClass("hidden");
                        $("#modalWhite").addClass("hidden");
                    },
                }, "get");



    }

    eventClickAllPath(loc, e, elem) {
        this.attachAllPaths();
    }

    attachEvents() {
        // Bind attaches the first arg to the function call... essentially cutting out the _This solution or the scope apply callbacks (ES6)
        // https://stackoverflow.com/questions/2236747/use-of-the-javascript-bind-method
        this.inputs.nodeCanvas.attachEvent("mouseup", this.eventMouseUpCanvas.bind(this));
        this.inputs.nodeCanvas.attachEvent("mousedown", this.eventMouseDownCanvas.bind(this));
        this.inputs.nodeCanvas.attachEvent("mousemove", this.eventMouseMoveCanvas.bind(this));
        this.inputs.nodeCanvas.attachEvent("mouseout", this.eventMouseUpCanvas.bind(this));
        this.inputs.nodeCanvas.attachEvent("mousewheel", this.eventMouseWheelCanvas.bind(this));

        this.inputs.zoomIn.attachEvent("click", this.eventClickZoomIn.bind(this));
        this.inputs.zoomOut.attachEvent("click", this.eventClickZoomOut.bind(this));

        this.inputs.save.attachEvent("click", this.eventClickSave.bind(this));

        this.inputs.pathButton.attachEvent("click", this.eventClickPath.bind(this));

        this.inputs.entryNodeButton.attachEvent("click", this.eventClickEntry.bind(this));
        this.inputs.deleteNode.attachEvent("click", this.eventClickDelete.bind(this));
        this.inputs.viewAt.attachEvent("click", this.eventClickViewAt.bind(this));
        this.inputs.updateButton.attachEvent("click", this.eventClickUpdate.bind(this));

        this.inputs.allPathButton.attachEvent("click", this.eventClickAllPath.bind(this));

        let that = this;
        $(this.inputElements.fromNode).click(function () {
            if ($("#file_upload_form").attr("action")) {
                $("#file_upload").click();
            }
        });
        $("#file_upload").change(function () {
            $("#file_upload_form").submit();
        });
        $(window).resize(this.resizeCanvas.bind(this));
        this.resizeCanvas();
    }
    resizeCanvas() {
        let width = window.innerWidth - $("#webixContainer").width() - $("#buttonContainer").width() - 20;
        let height = window.innerHeight - $("#mapUI").height() - $("#webixHeader").height() - 50;
        this.inputs.nodeCanvas.elem.height = height;
        this.inputs.nodeCanvas.elem.width = width;
        if ($$("mapNodePopulater")) {
            $("#importMapNodesButtonContainer").css("height", height + $("#mapUI").height());
            $$("mapNodePopulater").resize();
        }
        this.drawAllNodes();
    }

    constructor(mapName, json, inputElements, debugInfo) {
        // We've added more classes, and need more "selves". 
        // As such, use _ClassName to signify the scope lock 
        // trick.
        this.mapName = mapName;
        const _NavigationNodes = this;
        this.json = json;
        this.inputElements = inputElements;

        // Debuggin!
        this.debugInfo = Object.assign({fakeProjectVirgin: false}, debugInfo);

        // Default properties for class itself
        this.isDraggable = false;
        this.isPanning = false;
        this.ifPlaced = false;
        this.curNode;
        this.secondNode;
        this.hoverNode;
        this.cleanSlate;
        this.initialX;
        this.initialY;
        this.zoomFactor = 1;
        this.isPanning;
        this.listOfPaths = [];
        this.entryNode;
        // Each input to the NavigationNodes main class
        this.inputs = {};

        this.cookies = new Cookie();
        let mapZoom = this.cookies.get('edit_map-zoom');
        let mapOffset = this.cookies.get('edit_map-offset');
        if (!mapZoom) {
            mapZoom = 0.5;
            this.cookies.set('edit_map-zoom', mapZoom, 1);
        } else {
            mapZoom *= 1;
        }

        if (!mapOffset) {
            mapOffset = [0, 0];
            this.cookies.set('edit_map-offset', mapOffset, 1);
        } else {
            mapOffset = mapOffset.split(",");
            mapOffset[0] *= 1;
            mapOffset[1] *= 1;
        }


        try {
            // Will tell you if something goes bad with your inputs
            this.inputs.nodeCanvas = new NavigationNodes_Canvas(inputElements.canvas, {
                defaultZoom: mapZoom,
                defaultOffset: mapOffset});
            // Seperate canvas for just the connecting arrows? Cut down on redraw time.
            // this.inputs.connectionsCanvas = new NavigationNodes_Canvas(inputElements.canvas);
            this.inputs.save = new NavigationNodes_Save(inputElements.saveButton);
            this.inputs.zoomIn = new NavigationNodes_Zoom(inputElements.zoomInButton);
            this.inputs.zoomOut = new NavigationNodes_Zoom(inputElements.zoomOutButton);
            this.inputs.dropDown = new NavigationNodes_Dropdown(inputElements.pathDropdown)
            this.inputs.pathButton = new NavigationNodes_Path(inputElements.pathButton);
            this.inputs.entryNodeButton = new NavigationNodes_Entry(inputElements.entryNodeButton);
            this.inputs.deleteNode = new NavigationNodes_Save(inputElements.deleteNode);
            this.inputs.viewAt = new NavigationNodes_Save(inputElements.viewAt);
            this.inputs.allPathButton = new NavigationNodes_Path(inputElements.allPathButton);
            this.inputs.updateButton = new NavigationNodes_Save(inputElements.updateButton);

        } catch (e) {
            console.error("Error with NavigationNodes init.");
            console.error(e);
            console.error("Please ensure all required input elements have been passed in correctly to NavigationNode constructor");
        }

        // force height of 200

        // Attach events to each input elements created above
        this.attachEvents();
        this.inputs.pathButton.disableEvent("click");
        this.inputs.allPathButton.disableEvent("click");
        this.inputs.viewAt.disableEvent("click");

        this.loadAssets(afterLoad.bind(_NavigationNodes));
        function afterLoad() {

            if (this.checkIfProjectVirgin() ||
                    this.debugInfo.fakeProjectVirgin) {
                this.placeVirginProjectNodes.call(_NavigationNodes);
                this.saveJSON.call(_NavigationNodes);
            }
            // Force height 200 and width of ratio of whatever that comes to
            for (let nodeName in this.json) {
                let node = this.json[nodeName];
                let ratio = node.img.width / node.img.height;
                node.height = 200;
                node.width = 200 * ratio;
                node.initX = node.x;
                node.initY = node.y;
            }
            this.determinePaths.call(_NavigationNodes);
            this.drawAllNodes.call(_NavigationNodes);
        }
    }
}

