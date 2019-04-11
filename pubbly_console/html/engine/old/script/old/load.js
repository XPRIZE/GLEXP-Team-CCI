window.testing = false;
window.showsequence = false;
window.drawRects = false;
window.redrawAfterActionCheck = false;

if (window.testing) {
  window.setTimeout(function () {
    console.clear();
  }, 300);
}

// Globals
var maxDim = [0, 0], book = [], resMult = 1, bufArr = {length: 0}, curPage = 1, assetArr = {}, bufObjArr = [], bookOffsets, pUnit, bookC, navC, mDown = false, deviceTopBar = 0, pageNumberingStr = false, isChrome = navigator.userAgent.toLowerCase().indexOf("chrome") > -1, isFirefox = !(window.mozInnerScreenX == null);
// For each object, check to see if the object name matches this array. If it does, the img src is in the presets folder.
var presetImages = ["Keypad"];

// Single, SingleSpread,BlockSpread.
var pDisplay;
var missingXML = false;
var isPad = (navigator.userAgent.match(/iPad/i) != null || navigator.userAgent.match(/android/i) != null), isAndroid = navigator.userAgent.match(/android/i) != null, viewportScale = false, exitPage, isMac = navigator.platform.indexOf('Mac') >= 0;
isPad = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
if (false && isPad) {
  window.onerror = function (msg, url, line) {
    console.error("Error! " + msg);
    console.error("script " + url.split("/")[url.split("/").length - 1] + " line " + line);
  }
}
if (typeof window.assetsLoc == "undefined") {
  window.assetsLoc = "";
}
if (typeof window.gifInfo == "undefined") {
  window.gifInfo = {};
}
var saveStates = [];

// Add random number to end of image ext, to break the cache
function noCacheExt() {
  return "?" + Math.round(Math.random() * 100000);
}

function fatalError(mesg) {
  $("#mainC").css("display", "none");
  window.setTimeout(function () {
    $("#main").css({"height": "304", "width": "433", "margin-top": "50"});
    $("#mainC").css({"height": "286", "width": "420", "display": "block"});
    $("#bookC").css({"height": "200", "width": "400"});
    $("#shade").css({"display": "none"});
    $("#bookC").append("<div id=errorMesgCont></div>");
    $("#errorMesgCont").append("<h2>An error has occured!</h2>");
    window.mesgHTML = mesg;
    mesgHTML = mesgHTML.replace(/>/g, "&gt;");
    mesgHTML = mesgHTML.replace(/</g, "&lt;");
    mesgHTML = mesgHTML.replace(/\n\n/g, "<hr>");
    mesgHTML = mesgHTML.replace(/\n/g, "</br>");
    $("#errorMesgCont").append(mesgHTML);
  }, 500);
}
// XML IS READ. 
// All function have been loaded, jQuery is up, book is ready to be build
//
// Very first function will get xml, whether it be from a local .js included file, or from a server side .xml file.
// EITHER WAY, the xml will be passed off, parsed and all, to xmlLoaded();
$(document).ready(function () {
  var test = document.createElement('div');
  test.setAttribute('id', 'screen-middle');
  document.body.appendChild(test);
  var xmlParsed = "";
  if (typeof (xml) === "undefined") {
    if (!window.xmlLoc) {
      xmlLoc = window.assetsLoc + "MainXML.xml";
    }
    window.xmlLoc = window.xmlLoc + noCacheExt();
    $.ajax({
      type: "GET",
      url: xmlLoc,
      dataType: "xml",
      timeout: 5000,
      cache: false,
      success: xmlLoaded,
      error: function (xhr, ajaxOptions, thrownError) {
        console.error("ERROR - " + thrownError);
        missingXML = true;
        var id = window.location.pathname.split("/")[3];
        var author = window.location.pathname.split("/")[2];
        document.body.innerHTML = "<div class=fatalError>" +
          "<h2>Fatal error</h2>" +
          "<p>This book is missing the XML. Try reuploading.</p>" +
          "<p>If the problem persists, try reuploading, " +
          "<a href=http://" + window.location.hostname + "/phpscripts/Optimize.php?id=" + id + "&username=" + author + ">reoptimizing</a>" +
          " or contact support.</p>" +
          "</div>";
      }
    });
  } else {
    xml = $.parseXML(xml);
    xmlLoaded(xml);
  }
});
// At this point, I do not have to worry about whether this is a local view or a serverside view. ALL EVENTS are handled the same from here on out.
//
// Unlike before, I will be parsing the xml DIRECTLY to objects and array as needed. This is the ONLY SPOT where xml is interpreted.
// After the xml is interpreted, I am clear the xml global var to insure I dont rely on it later.
//
// BOOK STRUCTURE...
//
// GlOBALS
// var curPage = 1, book = [object, object], bufferArr = [buffer(src), buffer(src), createMouseEvents()]
function rgb2hex(rgb) {
  if (rgb) {
    rgb = rgb.split(",");
    function hex(x) {
      return ("0" + parseInt(x).toString(16)).slice(-2);
    }

    return "#" + hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
  } else {
    return false;
  }
}
function ticksToMili(tics) {
  return (tics / 60) * 1000;
}

// Get current line number
function thisLineNumber() {
  var e = new Error();
  if (!e.stack) try {
    // IE requires the Error to actually be throw or else the Error's 'stack'
    // property is undefined.
    throw e;
  } catch (e) {
    if (!e.stack) {
      return 0; // IE < 10, likely
    }
  }
  var stack = e.stack.toString().split(/\r\n|\n/);
  // We want our caller's frame. It's index into |stack| depends on the
  // browser and browser version, so we need to search for the second frame:
  var frameRE = /:(\d+):(?:\d+)[^\d]*$/;
  do {
    var frame = stack.shift();
  } while (!frameRE.exec(frame) && stack.length);
  return frameRE.exec(stack.shift())[1];
}

function capitaliseFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
function xmlLoaded(curXML) {
  if (typeof(spriteKey) == "undefined") {
    spriteKey = false;
  }

  var curInfo, curPages;

  book.bugs = new BugHandler();

  if (isPad) {
    screenWidth = window.screen.width;
    screenHeight = window.screen.height;
    deviceTopBar = 97;
  }
  function baseXML() {
    curInfo = curXML.getElementsByTagName("Info")[0];
    curPages = curXML.getElementsByTagName("Pages")[0].getElementsByTagName("Page");
    pageNumberingStr = false;


    pageNumberingStr = getValue(curInfo, "PageNumbering", true);

    if (pageNumberingStr) {
      pageNumberingStr = pageNumberingStr.split(",")
    }
    for (key in pageNumberingStr) {
      pageNumberingStr[key] = pageNumberingStr[key].toUpperCase();
    }

    //pageNumberingStr = false;
  }

  baseXML();


  function presetImages() {
    book.presetImages = {};
    book.presetImages.radio_active = new Image();
    book.presetImages.radio_active.src = dependenciesLoc + 'presets/icons/radio_active.png';
    book.presetImages.radio_inactive = new Image();
    book.presetImages.radio_inactive.src = dependenciesLoc + 'presets/icons/radio_inactive.png';
    book.presetImages.radio_hover = new Image();
    book.presetImages.radio_hover.src = dependenciesLoc + 'presets/icons/radio_hover.png';
    book.presetImages.checkbox_active = new Image();
    book.presetImages.checkbox_active.src = dependenciesLoc + 'presets/icons/checkbox_active.png';
    book.presetImages.checkbox_inactive = new Image();
    book.presetImages.checkbox_inactive.src = dependenciesLoc + 'presets/icons/checkbox_inactive.png';
    book.presetImages.checkbox_hover = new Image();
    book.presetImages.checkbox_hover.src = dependenciesLoc + 'presets/icons/checkbox_hover.png';

    // Chalkboard pattern
    book.presetImages.chalkBoard = new Image();
    book.presetImages.chalkBoard.src = dependenciesLoc + 'presets/blackBoardBG.png';
  }

  presetImages();

  function addElem(parent, typeChild, attributeArr, inner) {
    // UTILITY class. Adds HTML elements with one or multiple attributes
    var newElem = document.createElement(typeChild);
    for (i = 0; i < attributeArr.length; i++) {
      newElem.setAttribute(attributeArr[i][0], attributeArr[i][1]);
    }
    parent.appendChild(newElem);
    if (inner != undefined) {
      newElem.innerHTML = inner;
    }
    var retElem = document.getElementById(attributeArr[0][1]);
    return retElem;
  }

  function elements1() {
    body = document.body;
    addElem(body, "div", [["id", "background"], ["class", "bgCenter"]]);
    addElem(document.getElementById("background"), "div", [["id", "backgroundImg"]]);
    addElem(body, "div", [["id", "main"], ["class", "bgCenter"]]);
    var main = addElem(document.getElementById("main"), "div", [["id", "mainC"]]);
    addElem(main, "div", [["id", "titleC"], ["class", "noSelect"]]);
    addElem(document.getElementById("titleC"), "div", [["id", "bullet"]]);
    addElem(document.getElementById("titleC"), "div", [["id", "textC"]], "<p id='textAct'></p>");
    addElem(main, "div", [["id", "navC"], ["class", "noSelect"]]);
    bookC = addElem(main, "div", [["id", "bookC"], ["class", "center"]]);
    addElem(main, "div", [["id", "audioDiv"], ["class", "noSelect"]]);
    addElem(main, "div", [["id", "logoCont"], ['touchstart', 'event.preventDefault()']]);
    addElem(document.getElementById("logoCont"), "img", [["id", "logo"], ["class", "noSelect bgCenter"], ["src", dependenciesLoc + "presets/logos/poweredbypubbly2016.svg"]]);

    addElem(main, "div", [["id", "leftSideNav"], ["class", "sideNav"]], "<div class='VCmiddle'><div class='VCcenter' id='gutterPrev'></div>");
    addElem(main, "div", [["id", "rightSideNav"], ["class", "sideNav"]], "<div class='VCmiddle'><div class='VCcenter' id='gutterNext'></div>");

    var shade = addElem(bookC, "div", [["id", "shade"]]);
    shade.innerHTML = '<div id=tapPromptCentered><img id=tapPromptAct src=' + dependenciesLoc + '/presets/ipadIcons/tap-prompt.png></img></div>';
    navC = document.getElementById("navC");
  }

  elements1();

  function drawingTools() {
    book.drawingTools = {};
    book.drawingTools.lastPos = false;
    book.drawingTools.curWorkspace = false;
    book.drawingTools.chalk = {};
    book.drawingTools.chalk.diameter = 7;

    book.drawingTools.selector = addElem(mainC, "div", [["id", "drawingToolSelectorCont"]]);
    book.drawingTools.toolToggle = ["chalk", "eraser"];
    book.drawingTools.at = 0;
    book.drawingTools.cur = book.drawingTools.toolToggle[book.drawingTools.at];
    book.drawingTools.curColor = [255, 255, 255]; // default white
    book.drawingTools.update = function () {
      $(book.drawingTools.selector).css({"background-image": "url('" + dependenciesLoc + "presets/icons/" + book.drawingTools.cur + "-cursor.png')"});
    };
    book.drawingTools.toggleTool = function () {
      if (book.drawingTools.at >= book.drawingTools.toolToggle.length - 1) {
        book.drawingTools.at = 0;
      } else {
        book.drawingTools.at++;
      }
      book.drawingTools.cur = book.drawingTools.toolToggle[book.drawingTools.at];
      book.drawingTools.update();
    }
    book.drawingTools.setTool = function (tool, color) {
      if (tool == "eraser") {

      } else if (tool == "pencil") {

      } else if (tool == "chalk") {

      }
    }
    book.drawingTools.update();

    /*
     // drawing tools
     var nukeWarning = addElem(bookC, "div", [["id", "nukeWarning"], ["class", ".noSelect"]]);
     var plateCont = addElem(body, "div", [["id", "plateCont"]]);
     var plateMin = addElem(plateCont, "div", [["id", "plateMin"]]);
     var arrowStickCont = addElem(plateMin, "div", [["id", "arrowStickCont"]]);
     addElem(arrowStickCont, "div", [["id", "arrowStickLeft"], ["class", "arrowStick"]]);
     addElem(arrowStickCont, "div", [["id", "arrowStickRight"], ["class", "arrowStick"]]);
     var plateMax = addElem(plateCont, "div", [["id", "plateMax"]]);
     var subChoices = addElem(plateMax, "div", [["id", "subChoices"]]);
     var subCol1 = addElem(subChoices, "div", [["id", "subCol1"], ["class", "subCol"]]);
     var subCol2 = addElem(subChoices, "div", [["id", "subCol2"], ["class", "subCol"]]);

     // pushed to production, drawing tools removed.
     //$("#plateCont").css({"display":"none","pointer-events":"none"});


     plateHeight = 'close';
     function togglePlate() {
     if (plateHeight == 'close') {
     animPlate('half');
     } else {
     animPlate('close');
     }
     }

     plateMin.addEventListener('mouseup', togglePlate);

     book.drawingTools = {};
     book.drawingTools.status = false;
     book.drawingTools.cur = false;
     function tool(name, displayName, choices, subValues) {
     var THIS = this;
     this.name = name;
     this.displayName = displayName || name;
     this.choices = choices;
     this.subValues = subValues;

     this.elem = addElem(plateMax, 'div', [['id', this.name], ['class', 'plateChoice']]);
     this.icon = addElem(this.elem, 'img', [['id', this.name + '-icon'], ['class', 'plateChoiceIcon'], ['src', dependenciesLoc + 'presets/icons/' + this.name + '.png']]);
     this.title = addElem(this.elem, 'p', [['id', this.name + '-title'], ['class', 'plateChoiceName']], this.displayName);
     this.underline = addElem(this.elem, 'div', [['id', this.name + '-underline'], ['class', 'plateChoiceUnderline']]);
     this.hoverEnter = function () {
     if (book.drawingTools.cur != this.name) {
     $(this.underline).clearQueue();
     $(this.underline).animate({"width": 60, "backgroundColor": "#00AA", "color": "#0A0"}, 100);
     }
     };
     this.hoverLeave = function () {
     if (book.drawingTools.cur != this.name) {
     $(this.underline).clearQueue();
     $(this.underline).animate({"width": 40, "backgroundColor": "#000000", "color": "#000"}, 100);
     }
     };
     this.select = function () {
     var prevName = book.drawingTools.cur;
     var prevTool = book.drawingTools[prevName];
     if (prevName == 'nuke') {
     $("#clearInputLeft").trigger("click");
     }

     if (this.name == 'navigation' || this.name == 'nav') {
     book.drawingTools.cur = false;
     animPlate('close');
     } else {
     book.drawingTools.cur = this.name;
     }

     if (prevTool) {
     prevTool.hoverLeave();
     }
     $(this.underline).clearQueue();
     $(this.underline).animate({"width": 80, "backgroundColor": "#00FF00", "color": "#0F0"}, 100);
     if (this.choices) {
     if (plateHeight == 'half') {
     animPlate('full');
     }
     $("#subChoices #color").css({"display": "none"});
     $("#subChoices #thickness").css({"display": "none"});
     $("#subChoices #opacity").css({"display": "none"});
     $("#subChoices #shape").css({"display": "none"});
     $("#subChoices #clear").css({"display": "none"});

     var choice = this.choices;
     if (choice.left.length == 1) {
     $("#subCol1 > #" + choice.left[0]).css({"display": "inline-block"});
     }
     if (choices.right.length == 1) {
     var cur = $("#subCol2 > #" + choice.right[0]);
     var totHeight = 130;
     totHeight -= parseFloat(cur.css("height"));
     $(cur).css({"display": "inline-block", "margin": totHeight / 2 + " 10"});
     document.getElementById(choice.right[0] + 'Slider').value = subValues[choice.right[0]];
     } else if (choices.right.length == 2) {
     var first = $("#subCol2 > #" + choice.right[0]);
     var second = $("#subCol2 > #" + choice.right[1]);
     var totHeight = 130;
     totHeight -= parseFloat($(first).css("height")) + parseFloat($(second).css("height"));
     $(first).css({"display": "inline-block", "margin": totHeight / 2 + " 10 0 10"});
     $(second).css({"display": "inline-block", "margin": totHeight / 2 + " 10 0 10"});
     }
     var shapeValue;
     if (subValues.shape == 'square') {
     $(".shapeAct")[1].click();
     shapeValue = '0%';
     } else {
     $(".shapeAct")[0].click();
     shapeValue = '50%';
     }

     $('.colorSquare')[subValues.color].click();
     document.getElementById('thicknessSlider').value = subValues.thickness;
     document.getElementById('opacitySlider').value = subValues.opacity * 100;
     var thicknessMargins = (90 - subValues.thickness) / 2;
     $("#choiceDisplay").css({
     "height": subValues.thickness,
     "width": subValues.thickness,
     "margin": thicknessMargins,
     "opacity": subValues.opacity,
     "border-radius": shapeValue
     });
     } else {
     animPlate('close');
     }
     book[window.curPage - 1].redraw();
     book[window.curPage].redraw();
     };
     this.vals = {};
     if (choices.left) {
     var totChoices = choices.left.concat(choices.right);
     for (var c = 0; c < totChoices.length; c++) {
     var cur = totChoices[c];
     this.vals[cur] = false;
     }
     }
     $(this.elem).mouseenter(function () {
     THIS.hoverEnter()
     });
     $(this.elem).mouseleave(function () {
     THIS.hoverLeave()
     });
     $(this.elem).mouseup(function () {
     THIS.select()
     });
     }

     drawingTools = {
     pencil: {
     name: 'pencil',
     display: 'pencil',
     choices: {
     left: [
     'color',
     ],
     right: [
     'thickness',
     'opacity',
     ],
     },
     subValues: {
     color: 4,
     thickness: 40,
     opacity: 1,
     shape: 'circle',
     }

     },
     pen: {
     name: 'pen',
     display: 'pen',
     choices: {
     left: [
     'color',
     ],
     right: [
     'thickness',
     ],
     },
     subValues: {
     color: 0,
     thickness: 20,
     opacity: 1,
     shape: 'circle',
     }
     },
     marker: {
     name: 'marker',
     display: 'marker',
     choices: {
     left: [
     'color',
     ],
     right: [
     'thickness',
     'opacity',
     ],
     },
     subValues: {
     color: 2,
     thickness: 40,
     opacity: 0.8,
     shape: 'square',
     }
     },
     eraser: {
     name: 'eraser',
     display: 'eraser',
     choices: {
     left: [
     'shape',
     ],
     right: [
     'thickness',
     'clear'
     ],
     },
     subValues: {
     color: 0,
     thickness: 80,
     opacity: 1,
     shape: 'circle',
     }
     },
     navigation: {
     name: 'navigation',
     display: 'nav',
     choices: false,
     },
     };
     drawingToolsSubs = {
     color: {
     position: 'left',
     name: 'color',
     html: '',
     height: 120,
     width: 120,
     },
     shape: {
     position: 'left',
     name: 'shape',
     html: '',
     },
     thickness: {
     position: 'right',
     name: 'thickness',
     html: '',
     },
     opacity: {
     position: 'right',
     name: 'opacity',
     html: '',
     },
     clear: {
     position: 'right',
     name: 'clear',
     html: '',
     }
     };

     // inner html for sub choices
     // --COLOR
     var colorHTML = '';
     var firstHTML = "<div class='colorSquare' chosen='false' slot='";
     var secondHTML = "' style='background-color:RGB(";
     var closeHTML = ")'></div>";
     var colorArr = ['0,0,0', '137,103,172', '59,77,129', '228,100,37', '255,255,255', '179,38,42', '90,173,197', '145,190,74'];
     for (var c = 0; c < colorArr.length; c++) {
     colorHTML += firstHTML + c + secondHTML + colorArr[c] + closeHTML;
     }
     drawingToolsSubs.color.html = colorHTML;

     // --THICKNESS
     drawingToolsSubs.thickness.html = '<div id=thicknessInputLeft class=thicknessTable><input type=range id=thicknessSlider min=3 max=80></input><p id=thicknessLabel>Thickness<p></div>';

     // --CLEAR
     drawingToolsSubs.clear.html = '<input id=clearInputLeft type=button value="Clear Drawing" ></input>';

     // --OPACITY
     drawingToolsSubs.opacity.html = '<div id=opacityInputLeft class=opacityTable><input type=range id=opacitySlider min=10 max=100></input><p id=opacityLabel>Opacity<p></div>';

     // --SHAPE
     drawingToolsSubs.shape.html = '<div class=shapeAct id=circle-shape chosen=false></div><div class=shapeAct id=square-shape chosen=false></div><p id=shapeLabel>Shape</p>';


     for (var t in drawingTools) {
     var curTool = drawingTools[t];
     var curName = curTool.name;
     book.drawingTools[curName] = new tool(curName, curTool.display, curTool.choices, curTool.subValues);
     }
     for (var t in drawingToolsSubs) {
     var curSub = drawingToolsSubs[t];
     if (curSub.position == 'left') {
     addElem(subCol1, "div", [["id", curSub.name], ["class", "subChoice"], ["val", false]], curSub.html);
     } else {
     addElem(subCol2, "div", [["id", curSub.name], ["class", "subChoice"], ["val", false]], curSub.html);
     }
     }

     // --DISPLAY
     var subCol3 = addElem(subChoices, "div", [["id", "subCol3"], ["class", "subCol"]]);
     var choiceDisplay = addElem(subCol3, "div", [["id", "choiceDisplay"]]);

     $(".colorSquare").mouseleave(function () {
     if (this.getAttribute('chosen') == 'false') {
     $(this).clearQueue();
     $(this).animate({"borderColor": "transparent"}, 150);
     }
     });
     $(".colorSquare").mouseenter(function () {
     if (this.getAttribute('chosen') == 'false') {
     $(this).clearQueue();
     $(this).animate({"borderColor": "#4C4C4C"}, 150);
     }
     });
     $(".shapeAct").mouseenter(function () {
     if (this.getAttribute('chosen') == 'false') {
     $(this).clearQueue();
     $(this).animate({"background-color": "green", "opacity": 0.3}, 200);
     }
     });
     $(".shapeAct").mouseleave(function () {
     if (this.getAttribute('chosen') == 'false') {
     $(this).clearQueue();
     $(this).animate({"background-color": "white", "opacity": 1}, 200);
     }
     });


     $(".colorSquare").click(function () {
     var colorSlot = this.getAttribute('slot');
     var colorCho = this.style.backgroundColor;
     var colors = document.getElementsByClassName('colorSquare');
     for (var c = 0; c < colors.length; c++) {
     if (c != colorSlot) {
     var cur = colors[c];
     cur.setAttribute('chosen', 'false');
     $(cur).css({"borderColor": "transparent"});
     }
     }

     $(this).animate({"borderColor": "#303030"}, 400);
     this.parentNode.setAttribute('val', colorCho);
     this.setAttribute('chosen', 'true');
     $(choiceDisplay).css({"background-color": colorCho});

     // set new value
     book.drawingTools[book.drawingTools.cur].subValues.color = colorSlot;
     });
     document.getElementById("thicknessSlider").addEventListener('change', function (e) {
     var thickVal = this.value;
     $(choiceDisplay).css({"height": thickVal, "width": thickVal, 'margin': (90 - this.value) / 2});

     // set new value
     book.drawingTools[book.drawingTools.cur].subValues.thickness = thickVal;
     }, false);
     document.getElementById("opacitySlider").addEventListener('change', function (e) {

     var opVal = this.value / 100;
     $(choiceDisplay).css({"opacity": opVal});

     // set new value
     book.drawingTools[book.drawingTools.cur].subValues.opacity = opVal;
     }, false);
     $(".shapeAct").click(function () {
     var shapes = document.getElementsByClassName('shapeAct');
     for (var s = 0; s < shapes.length; s++) {
     var shape = shapes[s];
     shape.setAttribute('chosen', 'false');
     $(shape).css({"background-color": "white", "opacity": 1});
     }
     this.setAttribute('chosen', 'true');
     $(this).css({"background-color": "green", "opacity": 0.3});
     $(this).animate({"background-color": "green", "opacity": 1}, 250);
     var shapeCho = this.id.split('-')[0];
     if (shapeCho == 'circle') {
     $(choiceDisplay).css({"border-radius": '50%'});
     } else if (shapeCho == 'square') {
     $(choiceDisplay).css({"border-radius": '0%'});
     }

     // set new value
     book.drawingTools[book.drawingTools.cur].subValues.shape = shapeCho;
     });
     $("#clearInputLeft").click(function () {
     var curVal = book.drawingTools.cur;
     if (curVal == 'nuke') {
     $(this).css({"font-size": 12, "font-weight": 500});
     $(this).css("background-color", "RGBA(0,200,0,0.5)");
     book.drawingTools.cur = 'eraser';
     this.value = 'Clear Drawings';
     } else if (curVal == 'eraser') {
     $(this).css({"font-size": 20, "font-weight": 900});
     $(this).css("background-color", "RGBA(255,0,0,1)");
     book.drawingTools.cur = 'nuke';
     this.value = 'Cancel';
     }
     });
     drawingToolsDefault = getValue(curInfo, "ShowDrawingTools", true) || false;
     drwaingToolsDims = [300, 300];
     */
  }

  drawingTools();

  function singleAudChannel() {
    // NOTE: This is only applicable for books without the audio sprite. Instead of playing each aud on its own channel, load each aud individually (for immediate playback), but play them through the same channel (to prevent duplicate events or any other such nastiness (enforce blocking auds))
    book.audChannel = new Audio();
  }
  singleAudChannel();

  function elements2() {
    //	LEVEL 2 ELEMENTS. [nav(Prev,Goto,Next),bookC(pages),audioDiv(controls)]
    addElem(navC, "div", [["id", "prev"], ["class", "bgCenter"]]);
    addElem(navC, "div", [["id", "goto"]], '<p id=gotoCover>1</p><select id=gotoAct name=goto style="background-color:white;" onchange=gotoChange(this);><option></option></select>');
    addElem(navC, "div", [["id", "next"], ["class", "bgCenter"]]);


    if (isFirefox || isPad) {
      document.getElementById('gotoCover').style.top = '-4';
    }
    document.getElementById("audioDiv").innerHTML = "<audio controls id='audioController'></audio>";
    myAudio = document.getElementsByTagName('audio')[0];
    //myAudio.addEventListener('canplaythrough', canplay, false);
    //myAudio.addEventListener('ended', audioEnded);
    addElem(bookC, "div", [["id", "dialogC"]]);
    book.dialog = {};
    book.dialog.container = document.getElementById('dialogC');
    book.dialog.container.style.visibility = 'hidden';
    book.dialog.open = false;

    book.textEntryHidden = addElem(bookC, "textarea", [["id", "textEntryHidden"], ["type", "text"], ["autocorrect", "off"], ["autocomplete", "off"], ["autocapitalize", "off"]]);
    book.curField = {};
    book.curField.name = false;
    book.curField.page = false;
    book.curField.insertionPoint = false;
    book.curField.insertionPointAlpha = 1;

  }

  elements2();

  function info() {
    // INFO
    // set webpage title
    var prjTitle = getValue(curInfo, "PrjName");
    document.title = prjTitle;
    document.getElementById("textAct").innerHTML = getValue(curInfo, "PrjNameLong");
    // set bullet color
    //$("#bullet").css("background-color", getValue(curInfo, "BulletColor"));
    $("#bullet").css("background-color", "white");
    // set the body background
    $(document.body).css("background-color", rgb2hex(getValue(curInfo, "BrowserBackgroundColor", true)));
    pDisplay = getValue(curInfo, "PageDisplay", true);
    if (pDisplay) {
      pDisplay = pDisplay.toLowerCase();
      if (pDisplay == 'single') {
        pDisplay = 'Single';
      } else if (pDisplay == 'composite') {
        pDisplay = 'BlockSpread';
      } else if (pDisplay == 'double') {
        pDisplay = 'SingleSpread';
      }
    } else {
      pDisplay = getValue(curInfo, "DoublePageDisplay");
      if (pDisplay) {
        pDisplay = 'SingleSpread';
      } else {
        pDisplay = 'Single';
      }
    }
    // Always double wide, added 1/20/16
    book.alwaysDoubleWide = getValue(curInfo, "AlwaysDoubleWide", true);
    book.pageNavigationDisabled = (getValue(curInfo, "DisallowPageNavigation", true) == "true") ? true : false;

    // bpage background color
    pageColor = rgb2hex(getValue(curInfo, "BookBackgroundColor", true));
    book.highlightLinkColor = "RGBA(" + (getValue(curInfo, "HighlightLinkColor", true) || "128,255,255");
    book.highlightLinkColor += "," + ((getValue(curInfo, "HighlightLinkTransparency", true) / 100) || 1) + ")";
    book.minLinkHighlightTime = ticksToMili(getValue(curInfo, "AutoHighlightLinksTime", true)) || 1000;
    book.highlighterWaitAtEnd = ticksToMili(getValue(curInfo, "WaitAfterHighlighterSeries", true) || 0);
    book.lastPageDouble = false;
    book.resetRandomRemovals = (getValue(curInfo, "ResetRandomRemovals", true) == "true") ? true : false;
    book.interruptTime = getValue(curInfo, "TimeToInterrupt", true);
    book.useSaveStates = (getValue(curInfo, "ReturnPageToPreviousStateOnInterruptions", true) == "true") ? true : false;
    book.snapDropToLoc = (getValue(curInfo, "SnapDroppedImagesIntoLocation", true) == "false") ? false : true;
    if (book.interruptTime) {
      book.interruptTime /= 60;
      book.interruptTime *= 1000;
    }


    if (maxDim[0] == 0 && maxDim[1] == 0) {
      maxDim[0] = parseInt(getValue(curInfo, "SinglePageHeight", true));
      maxDim[1] = parseInt(getValue(curInfo, "SinglePageWidth", true));
      if (!maxDim[0]) {
        maxDim[0] = parseInt(getValue(curPages[0], "PageHeight"));
      }
      if (!maxDim[1]) {
        maxDim[1] = parseInt(getValue(curPages[0], "PageWidth"));
      }
      if (book.alwaysDoubleWide && pDisplay == "Single") {
        // Another ray problem. Single Page Width is double for a single page display book after alwaysDoubleWide update
        maxDim[1] *= 2;
      }
      if (!maxDim[0] || !maxDim[1]) {
        throw new fatalError("Missing XML. \n\n If this is a new Unit and you have not yet added pages, please do so.");
      }
    }

    if (pDisplay == 'BlockSpread') {
      maxDim[1] *= 2;
      var last_bg_left = getValue(curPages[curPages.length - 1], "LeftBackground");
      var last_bg_right = getValue(curPages[curPages.length - 1], "RightBackground");
      if (last_bg_left != '' && last_bg_right != '') {
        book.lastPageDouble = true;
      } else {
        book.lastPageDouble = false;
        if ((getValue(curInfo, "CreatedWithVersion", false) || 0) > 3.21) {
          if (pageNumberingStr[pageNumberingStr.length - 1].split("-").length > 1) {
            book.lastPageDouble = true;
            book.bugs.log("Temporary fix for lastPageDouble, check load.js line " + thisLineNumber() + " for info.");
            // No leftBG or rightBG image, so my old way of determine lastPageDouble is off
            // I've put it a temporary fix that checks pageNumberingString (ver 3.22 and up) for a '-', but this won't work for custom page numbering.
            // Ask Ray to fix this on his end and remove this messy fix.
          }
        }
      }
    }
  }

  info();

  for (var key = 0; key < curPages.length; key++) {
    bufArr[key] = [];
    bufArr[key + "load"] = false;
    bufArr[key + 'at'] = 0;
    bufArr.length++;

    var curPage = curPages[key];

    book[key] = new Page(key, curPages[key]);


    var xmlObjArr = curPage.getElementsByTagName("Objects")[0].getElementsByTagName("Object");
    for (objKey = 0; objKey < xmlObjArr.length; objKey++) {
      // initial local var setup, dumping from curXmlObj to tmpReturn
      var curXmlObj = xmlObjArr[objKey];
      var objType = getValue(curXmlObj, "ObjType", true);
      if (objType == 'dialog') {
        var tmpObj = new Dialog(curXmlObj, key);
      } else {
        var tmpObj = new PObject(curXmlObj, key);
      }
    }
    var xmlLnkArr = curPage.getElementsByTagName("Links")[0].getElementsByTagName("Link");
    for (lnkKey = 0; lnkKey < xmlLnkArr.length; lnkKey++) {
      // Same as objects above. Dumping from curXmlLnk to local tmpReturn
      var curXmlLnk = xmlLnkArr[lnkKey];
      // Setting up points for point in poly format.
      var tmpTriggers = curXmlLnk.getElementsByTagName("Trigger");


      for (var t = 0; t < tmpTriggers.length; t++) {
        var triggers = tmpTriggers[t];
        var linkType = getValue(curXmlLnk, "LinkType", true) || "graphic";

        if (linkType == 'graphic' || linkType == 'conditional' || linkType == 'page') {
          var tmpLnk = new Graphic(curXmlLnk, triggers, key);
        } else if (linkType == 'button') {
          var tmpLnk = new Button(curXmlLnk, triggers, key);
        } else {
          book.bugs.log('unknown link type <b>' + linkType + '</b>');
        }
      }
      // Pushing all audio files into buffer arr
      //   NOTE do animation thing first.
    }
  }

  function elementSize() {
    $(".pDiv").css("background-color", rgb2hex((getValue(curInfo, "BookBackgroundColor", true) || '255,255,255')));
    $(".dup").css("background-color", rgb2hex((getValue(curInfo, "BookBackgroundColor", true) || '255,255,255')));


    // globals are faster than object properties
    bookLength = book.length;


    // set bookC height and width to display two pages at once.
    //

    maxDim[0] = parseFloat(maxDim[0]);
    maxDim[1] = parseFloat(maxDim[1]);
    halfWidth = maxDim[1] / 2;
    halfHeight = maxDim[0] / 2;
    bookMarginLeft = 10;
    shadowOffset = 10;


    if (pDisplay != 'SingleSpread') {
      maxDim[1] /= 2;
    }


    var tmpNavWidth = parseFloat($("#navC").css("width"));
    var tmpNavHoriMargins = parseFloat($("#navC").css("margin-right")) * 2;
    var tmpNavHeight = parseFloat($("#navC").css("height"));
    var tmpNavTopMargin = parseFloat($("#navC").css("margin-top"));
    var tmpNavBottomMargin = parseFloat($("#navC").css("margin-bottom"));
    var tmpBulletWidth = parseFloat($("#bullet").css("width"));
    var tmpBulletRightMargin = parseFloat($("#bullet").css("margin-right"));
    var tmpTitleHeight = parseFloat($("#titleC").css("height"));
    var tmpTitleLeftMargin = parseFloat($("#titleC").css("margin-left"));
    var tmpTitleVertMargins = parseFloat($("#titleC").css("height"));
    var tmpLogoHeight = parseFloat($("#logo").css("height"));
    var tmpLogoTopMargin = parseFloat($("#logo").css("margin-top"));
    var tmpLogoBottomMargin = parseFloat($("#logo").css("margin-bottom"));

    var tmpNavTotWidth = tmpNavWidth + tmpNavHoriMargins;
    var tmpTitleTotWidth = maxDim[1] * 2 - tmpNavTotWidth;
    var tmpBulletTotWidth = tmpBulletWidth + tmpBulletRightMargin;
    var tmpNavVertMargins = tmpNavTopMargin + tmpNavBottomMargin;
    var tmpNavTotHeight = tmpNavHeight + tmpNavVertMargins;
    var tmpTextCTotWidth = tmpTitleTotWidth - tmpBulletTotWidth;
    var tmpLogoTotMargin = tmpLogoTopMargin + tmpLogoBottomMargin;
    var tmpLogoTotHeight = tmpLogoHeight + tmpLogoTotMargin;
    var tmpMainCTotHeight = tmpNavTotHeight + tmpLogoTotHeight + maxDim[0];
    var tmpMainCTotWidth = (bookMarginLeft * 2) + (maxDim[1] * 2);

    var spriteStartFontSize = (maxDim[1] * 2) / 4;
    var spriteStartMargins = (maxDim[0] * 0.85) - spriteStartFontSize;
    if (spriteStartMargins < 0) {
      spriteStartFontSize = maxDim[0] * 0.85;
      spriteStartMargins = 0;
    } else {
      spriteStartMargins /= 2;
    }

    bookHeight = tmpMainCTotHeight;
    bookWidth = tmpMainCTotWidth;

    $("#main").css({"height": tmpMainCTotHeight + (15), "width": tmpMainCTotWidth + (20)});
    $("#mainC").css({"height": tmpMainCTotHeight, "width": tmpMainCTotWidth, "left": 10});
    $("#bookC").css({"height": maxDim[0], "width": maxDim[1] * 2});
    $("#spriteStart").css({"font-size": spriteStartFontSize, "margin-top": spriteStartMargins});
    $("#titleC").css({"width": tmpTitleTotWidth});
    $("#textC").css({"width": tmpTextCTotWidth});

    if (pDisplay == 'Single') {
      maxDim[1] *= 2;
    }

    pUnit = maxDim[1];
    bookOffsets = $('#bookC').offset();

    if (isPad) {

      addElem(body, "div", [["id", "ipadViewportFix"], ["class", "bgCenter"]]);
      var vpf = document.getElementById("ipadViewportFix");
      vpf.style.position = 'fixed';
      vpf.style.top = 0;
      vpf.style.left = 0;
      vpf.style.height = tmpMainCTotHeight + 15;
      vpf.style.width = tmpMainCTotWidth + 10 + 150;
      vpf.style.zIndex = '-1';


      $("#logoCont").css({'position': 'relative', 'float': 'right'});
      $("#navC").css({'position': 'relative', 'float': 'right', 'left': '0', 'margin-right': '9px'});
      addElem(body, "div", [["id", "leftGutter"], ["class", "gutter"]], '<div style="position:fixed;top:50%"><img src="presets/gutterLeft.png" height=55 width=55 id=leftGutterImage class=gutterImage></img></div>');
      addElem(body, "div", [["id", "rightGutter"], ["class", "gutter"]], '<div style="position:fixed;top:50%"><img src="presets/gutterRight.png" height=55 width=55 id=leftGutterImage style="left:15;" class=gutterImage></img></div>');
      $(".gutter").css({
        'position': 'fixed',
        'top': '0',
        'height': '100%',
        'width': '85px',
        'opacity': 0,
        'background-color': 'rgba(17,17,17,0.5)'
      });
      $("#leftGutter").css({'left': 0});
      $("#rightGutter").css({'right': 0});
      $(".gutterImage").css({'position': 'relative', 'top': '-27', 'left': '10', 'display': 'none'});


      if (document.head.firstChild.name != 'viewport') {
        var viewport = document.createElement('meta');
        viewport.name = 'viewport';
        viewport.content = 'width=device-width,initital-scale=1,user=-scalable=no';
        document.head.insertBefore(viewport, document.head.firstChild);
      }
      window.addEventListener('orientationchange', rescale);
      rescale();
    }
    if (!isPad) {
      vertCenterBook(window.innerHeight);
    }
    loadAssets();
  }

  elementSize();

  //tester();
}
function Dialog(curXmlObj, key) {
  var scope = this;
  this.name = getValue(curXmlObj, 'ObjName');
  this.ident = 'page ' + (key + 1) + ' - ' + this.name;
  this.background = getValue(curXmlObj, 'ObjBackgroundImage');
  this.height = parseInt(getValue(curXmlObj, 'Height'));
  this.width = parseInt(getValue(curXmlObj, 'Width'));


  this.dialogWin = document.createElement('div');
  this.dialogWin.setAttribute('id', this.ident + ' - win');
  this.dialogWin.setAttribute('class', 'dialogWindow');
  book.dialog.container.appendChild(this.dialogWin);

  this.dialogTop = document.createElement('div');
  this.dialogTop.setAttribute('id', this.ident + ' - top');
  this.dialogTop.setAttribute('class', 'dialogTop');
  this.dialogWin.appendChild(this.dialogTop);

  this.elem = document.createElement('div');
  this.elem.setAttribute('id', this.ident);
  this.elem.setAttribute('class', 'dialog');
  this.dialogWin.appendChild(this.elem);


  this.buttonsXML = curXmlObj.getElementsByTagName("Button");
  this.buttons = [];
  for (var b = 0; b < this.buttonsXML.length; b++) {
    var bXML = this.buttonsXML[b];
    this.buttons.push(new DialogButton(bXML));
  }
  function DialogButton(bXML) {
    var button = this;
    this.name = getValue(bXML, 'ButtonName');
    this.associatedLink = getValue(bXML, 'SendClickTo', true);
    this.rect = splitAndFloat(getValue(bXML, 'ButtonRect'), ',');
    this.left = this.rect[0];
    this.top = this.rect[1];
    this.right = this.rect[2];
    this.bottom = this.rect[3];
    this.height = this.bottom - this.top;
    this.width = this.right - this.left;
    this.closeOnClick = getValue(bXML, 'CloseOnClick');

    this.elem = document.createElement('div');
    this.elem.setAttribute('id', scope.ident + ' - button ' + this.name);
    this.elem.setAttribute('class', 'dialogButton');
    this.elem.setAttribute('ident', this.name);
    scope.elem.appendChild(this.elem);

    $(this.elem).css({
      'position': 'absolute',
      'top': this.top,
      'left': this.left,
      'height': this.height,
      'width': this.width,
    });
    if (this.closeOnClick) {
      $(this.elem).click(function () {
        if (button.associatedLink) {
          var lnkName = button.associatedLink;
          var loc = book[key].linkKey[lnkName];
          var lnk = book[key][loc.type][loc.pos];
          curSequence = new sequence(lnk.targets, book[key], lnkName);
          curSequence.start();
        }
        scope.close();
      });
    }
  }


  $(this.dialogTop).mousedown(function (e) {
    var windowLoc = $(".dialogWindow").offset();
    book.dialog.dragOffsets = [e.clientX - windowLoc.left, e.clientY - windowLoc.top];
    book.dialog.dragging = scope;
  });


  // left is not accounting for pDisplay
  $(this.dialogWin).css({
    'height': this.height,
    'width': this.width,
    'top': (maxDim[0] / 2) - (this.height / 2),
    'left': (maxDim[1] - ((maxDim[1] / 2) * (1))) - (this.width / 2),
    'position': 'absolute',
    'z-index': 101,
    'border': '8px solid white',
    'border-top': '32px solid white',
  });

  $(this.elem).css({
    'background-image': 'url(images/' + this.background + ')',
    'background-size': '100% 100%',
    'height': this.height,
    'width': this.width,
    'position': 'absolute',
    'top': 0,
    'left': 0,
    'z-index': 102,
  });


  this.open = function () {
    $('#dialogC .dialogWindow').css({
      'visibility': 'hidden',
    });
    $(this.dialogWin).css({
      'visibility': 'visible',
    });
    book.dialog.container.style.visibility = 'visible';
    book.dialog.open = true;
  };
  this.close = function () {
    $('#dialogC .dialogWindow').css({
      'visibility': 'hidden',
    });
    book.dialog.container.style.visibility = 'hidden';
    book.dialog.open = false;
  };

  book[key].dialogKey[this.name] = book[key].dialogs.length;
  book[key].dialogs.push(this);
}
function Button(curXmlLnk, triggers, key) {
  this.name = getValue(curXmlLnk, "Name").toString();
  this.type = getValue(curXmlLnk, "ButtonStyle").toString();
  if (this.type == 'radiobutton') {
    this.parentName = getValue(curXmlLnk, "ParentButton");
  } else {
    this.parentName = this.name;
  }
  this.isParent = false;
  this.parentObj = false;
  if (this.name == this.parentName) {
    this.isParent = true;
    this.parentObj = this;
    this.childFlash = false;
  } else {
    this.parentObj = book[key].buttons[book[key].buttonKey[this.parentName]];
  }
  this.linkType = 'button';
  this.rect = splitAndInt(getValue(curXmlLnk, "ButtonRect"), ',');
  this.top = this.rect[0];
  this.left = this.rect[1];
  this.right = this.rect[2];
  this.bottom = this.rect[3];
  this.height = this.bottom - this.top;
  this.width = this.right - this.left;
  this.inner = this.name;

  this.width = Math.max(this.width, 22);
  this.height = Math.max(this.height, 22);

  this.pts = [];
  this.pts.push({x: this.rect[1], y: this.rect[0]});
  this.pts.push({x: this.rect[1] + 22, y: this.rect[0]});
  this.pts.push({x: this.rect[1] + 22, y: this.rect[0] + 22});
  this.pts.push({x: this.rect[1], y: this.rect[0] + 22});
  this.origPts = this.pts;

  this.pinnedTo = '';
  this.lineDraw = 'none';

  var b = {};
  b.height = b.width = 22;
  b.img = new Image();

  this.bubble = b;


  if (triggers) {
    // Types of links (click drop)
    this.action = getValue(triggers, "TriggerType");
    var splitReturn = this.action.split(",");
    if (!splitReturn[1]) {
      splitReturn[1] = "any"
    }
    console.log(splitReturn);
    this.requires = splitReturn[1].toString();
    // Can't default drop to lower case, cause it could be a case sensitive object name.
    if (this.requires == "Any") {
      this.requires = "any";
    }
  }
  var xmlTargs = triggers.getElementsByTagName("Target");
  var targReturn = [];

  if (xmlTargs && xmlTargs[0] && xmlTargs[0].childNodes && xmlTargs[0].childNodes[0] != undefined) {
    for (targ in xmlTargs) {
      var curTarg = xmlTargs[targ];
      if (typeof curTarg == "object") {
        var targType = getValue(curTarg, "Type");
        var targAction = getValue(curTarg, "Action");
        var targDest = getValue(curTarg, "Destination");
        var returnArr = [];
        returnArr.push(targType);
        returnArr.push(targAction);
        returnArr.push(targDest);
        if (targType == "Audio") {
          if (!spriteKey) {
            if (targDest.isFunction) {
              for (var a = 0; a < targDest.args.length; a++) {
                bufArr[key].push(targDest.args[a] + ".audio");
              }
            } else {
              bufArr[key].push(targDest + ".audio");
            }
          }
          if (targType == "Audio") {
            if (!spriteKey) {
              if (targDest.isFunction) {
                for (var a = 0; a < targDest.args.length; a++) {
                  bufArr[key].push(targDest.args[a] + ".audio");
                }
              } else {
                bufArr[key].push(targDest + ".audio");
              }
            }
            if (targDest.isFunction) {
              for (var a = 0; a < targDest.args.length; a++) {
                book[key].auds[targDest.args[a]] = {};
              }
            } else {
              book[key].auds[targDest] = {};
            }
          }
        }

        targReturn.push(returnArr);
      }
    }
  }
  if (targReturn.length != 0) {
    this.targets = targReturn;
  }

  this.flash = false;
  this.font = {};
  this.font.name = getValue(curXmlLnk, "ButtonTextFont");
  this.font.size = getValue(curXmlLnk, "ButtonTextSize");
  this.font.style = getValue(curXmlLnk, "ButtonTextStyle");
  this.font.color = rgb2hex(getValue(curXmlLnk, "ButtonTextColor"));
  this.initialHighlight = (getValue(curXmlLnk, "InitialHighlight") == 'true');
  this.autoHighlight = false;
  this.enabled = (getValue(curXmlLnk, "InitialStatus") == 'enabled');

  this.on = function () {
    var button = this;
    var flashTime = 75;
    if (this.state == 'on') {
      this.parentObj.childFlash = true;

      f = 4;
      for (var i = 0; i < f; i++) {
        if (i % 2) {
          window.setTimeout(function () {
            button.state = 'on';
            book[key].redraw();
          }, flashTime * i);
        } else {
          window.setTimeout(function () {
            button.state = 'off';
            book[key].redraw();
          }, flashTime * i);
        }
      }
      window.setTimeout(function () {
        button.parentObj.childFlash = false;
      }, f * flashTime);
    } else {
      //book[key].toggleButtons(this.parentName);
      this.state = 'on';
      book[key].redraw();
    }
  };
  this.hover = function () {
    if (this.state == 'hover') {
    } else {
      this.state = 'hover';
      buttonHoverName = this.name;
      book[key].redraw();
    }
  };
  this.off = function () {
    if (this.state == 'off') {
    } else {
      this.state = 'off';
      book[key].redraw();
    }
  };
  this.state = 'on';
  this.off();


  book[key].buttonKey[this.name] = book[key].buttons.length;
  book[key].buttons.push(this);
}
function Graphic(curXmlLnk, triggers, key) {
  this.name = getValue(curXmlLnk, "Name").toString();
  this.linkType = 'graphic';
  // Points into PointInPoly format
  var tmpPts = getValue(curXmlLnk, "Points", true);
  if (tmpPts) {
    tmpPts = tmpPts.split(".");
    this.pts = [];
    for (pt in tmpPts) {
      this.pts.push({});
      var ptX = parseFloat(tmpPts[pt].split(",")[0]);
      var ptY = parseFloat(tmpPts[pt].split(",")[1]);
      this.pts[pt].x = ptX;
      this.pts[pt].y = ptY;
    }
    this.origPts = jQuery.extend(true, {}, this.pts);
    this.origPts.length = this.pts.length;
  } else {
    this.pts = false;
  }

  if (triggers) {
    // Types of links (click drop)
    this.action = getValue(triggers, "TriggerType");
    var splitReturn = this.action.split(",");
    if (!splitReturn[1]) {
      splitReturn[1] = "any"
    }
    splitReturn[0] = splitReturn[0].toLowerCase();
    this.requires = splitReturn[1].toString();
    // Can't default drop to lower case, cause it could be a case sensitive object name.
    if (this.requires == "Any") {
      this.requires = "any";
    }
  }


  var xmlTargs = triggers.getElementsByTagName("Target");
  var targReturn = [];

  this.lineDraw = getValue(curXmlLnk, "LineDrawing", true).toLowerCase();
  if (this.lineDraw && this.lineDraw != "none") {
    splitReturn[0] = 'startLine';
    splitReturn[1] = this.lineDraw;
    this.action = 'mouseDown';
  }
  if (xmlTargs && xmlTargs[0] && xmlTargs[0].childNodes && xmlTargs[0].childNodes[0] != undefined) {
    for (targ in xmlTargs) {
      var curTarg = xmlTargs[targ];
      if (typeof curTarg == "object") {
        var targType = getValue(curTarg, "Type");
        var targAction = getValue(curTarg, "Action");
        var targDest = getValue(curTarg, "Destination");
        // if (targDest.charAt(0) == "?" && targDest.charAt(targDest.length - 1) == "?" && targDest.charAt(targDest.length - 2) == ")") {
        if (targDest && targDest.split("?").length - 1 == 2) {

          var func = stringBetween(targDest, "?", "(");
          var args = stringBetween(targDest, "(", ")");
          if (args.substring(0, 1) == "'" || args.substring(0, 1) == '"') {
            args = args.substring(1, args.length - 1);
          }
          args = args.split(",");
          if (targType.toLowerCase() == "object" && targAction.toLowerCase() == "play") {
            var refObj = targDest.split("|")[0];
          }
          targDest = {};
          targDest.isFunction = true;
          targDest.functionType = func;
          targDest.args = args.slice(0);
          targDest.initArgs = args.slice(0);
          if (refObj) {
            targDest.referenceObject = refObj
          }
        }
        var returnArr = [];
        returnArr.push(targType);
        returnArr.push(targAction);
        returnArr.push(targDest);
        if (targType == "Audio") {
          if (!spriteKey) {
            if (targDest.isFunction) {
              for (var a = 0; a < targDest.args.length; a++) {
                bufArr[key].push(targDest.args[a] + ".audio");
              }
            } else {
              bufArr[key].push(targDest + ".audio");
            }
          }
          if (targDest.isFunction) {
            for (var a = 0; a < targDest.args.length; a++) {
              book[key].auds[targDest.args[a]] = {};
            }
          } else {
            book[key].auds[targDest] = {};
          }
        }
        targReturn.push(returnArr);
      }
    }
  }
  if (targReturn.length != 0) {
    this.targets = targReturn;
  }
  //   NOTE redo this when you get to animation. Consider each target as a function,

  // finding which action array to push links into
  var linkArrayName = false;
  splitReturn[0] = splitReturn[0].toLowerCase();
  if (splitReturn[0] == "click") {
    linkArrayName = "clicks";
  } else if (splitReturn[0] == "drop") {
    linkArrayName = "drops";
  } else if (splitReturn[0] == "startline") {
    linkArrayName = "lineStarts";
  } else if (splitReturn[0] == "endline") {
    linkArrayName = "lineEnds";
  } else if (splitReturn[0] == "open page" || splitReturn[0] == "open page first time") {
    if (book[key].pageOpens)
      var firsttime = false;
    var everytime = false;
    for (var pl = 0; pl < book[key].pageOpens.length; pl++) {
      if (book[key].pageOpens[pl].action == "open page first time") {
        firsttime = true;
      } else if (book[key].pageOpens[pl].action == "open page") {
        everytime = true;
      }
    }
    if (splitReturn[0] == "open page" && everytime) {
      console.error('multiple Open Page links, only the first in XML will work');
      linkArrayName = 'dumped';
    } else if (splitReturn[0] == "open page first time" && firsttime) {
      console.error('multiple Open Page First Time links, only the first in XML will work');
      linkArrayName = 'dumped';
    } else {
      linkArrayName = "pageOpens";
    }
  } else if (splitReturn[0].split("=")[0] == "page points ") {
    linkArrayName = "logics";
  } else if (splitReturn[0] == "countdown finished" || splitReturn[0] == "countdown finish") {
    linkArrayName = "countdowns";
  } else if (splitReturn[0] == "math right" || splitReturn[0] == "math wrong") {
    linkArrayName = "maths";
  } else {
    book.bugs.log("ERROR - unknown TriggerType (page " + key + ")  -- " + splitReturn[0]);
  }
  // getting the length of said array
  var idInActionArr = 'unknown';
  if (linkArrayName) {
    idInActionArr = book[key][linkArrayName].length;
  }
  // Pinning
  this.pinnedTo = getValue(curXmlLnk, "PinnedTo", true);
  if (this.pinnedTo) {
    this.pinnedTo = this.pinnedTo.toString();
  }
  this.autoHighlight = (getValue(curXmlLnk, "AutoHighlightLink", true) == "true") ? true : false;
  var initStatus = getValue(curXmlLnk, "InitialStatus", true) || 'enabled';
  if (initStatus == 'enabled') {
    this.enabled = true;
  } else {
    this.enabled = false;
  }
  if (this.pinnedTo) {
    var objIfExists = book[key].objs[this.pinnedTo];
    if (objIfExists) {
      book[key].objs[this.pinnedTo].carryLink = idInActionArr;
      book[key].objs[this.pinnedTo].carryType = linkArrayName;
    } else {
      console.error("Link " + this.name + " cannot be pinned to object " + this.pinnedTo + "... Object does not exist -- Error on page " + key);
    }
  }


  if (linkArrayName) {
    // Adding link to linkKey object, for easy lookup later
    book[key].linkKey[this.name] = {};
    var keyForLink = book[key].linkKey[this.name];
    keyForLink.pos = book[key][linkArrayName].length;
    keyForLink.type = linkArrayName;

    // Adding link to action array
    book[key][linkArrayName].push(this);
  }
}
window.setTimeout(function() {
  console.clear();
},1000)
function Page(key, curXmlPage) {
  var divElem = document.createElement("div");
  var canElem = document.createElement("canvas");
  var bufElem = document.createElement("canvas");
  var drawingElem = document.createElement("canvas");
  var loadCont = document.createElement("div");

  // Canvas (draw and buf) elements
  divElem.setAttribute("id", "div" + key);
  divElem.setAttribute("class", "pDiv");
  canElem.setAttribute("height", maxDim[0] * resMult);
  canElem.setAttribute("width", maxDim[1] * resMult);
  canElem.setAttribute("id", "can" + key);
  canElem.setAttribute("class", "can");
  bufElem.setAttribute("height", maxDim[0] * resMult);
  bufElem.setAttribute("width", maxDim[1] * resMult);
  bufElem.setAttribute("id", "buf" + key);
  bufElem.setAttribute("class", "buf");

  drawingElem.setAttribute("height", maxDim[0] * resMult);
  drawingElem.setAttribute("width", maxDim[1] * resMult);
  drawingElem.setAttribute("class", "drawCan");

  bookC.appendChild(divElem);
  divElem.appendChild(canElem);
  canElem.style.height = maxDim[0];
  canElem.style.width = maxDim[1];
  divElem.appendChild(bufElem);
  divElem.appendChild(drawingElem);

  loadCont.setAttribute("id", "loadC" + key);
  loadCont.setAttribute("class", "loadC");
  divElem.appendChild(loadCont);


  if (pDisplay == 'BlockSpread' && key !== 0) {
    dupDiv = document.createElement("div");
    dupDiv.setAttribute("id", "dup" + key);
    dupDiv.setAttribute("class", "dupDiv");
    bookC.appendChild(dupDiv);
    var dupElem = document.createElement("canvas");
    dupElem.setAttribute("height", maxDim[0] * resMult);
    dupElem.setAttribute("width", maxDim[1] * resMult);
    dupElem.setAttribute("id", "dup" + key);
    dupElem.setAttribute("class", "dup");
    dupDiv.appendChild(dupElem);
    dupElem.style.height = maxDim[0];
    dupElem.style.width = maxDim[1];
    this.DUP = dupDiv;
    this.DUPCAN = dupElem;
    $(this.DUP).css({"height": maxDim[0], "width": maxDim[1]});
    $(this.DUPCAN).css({"left": -maxDim[1] / 2, "position": "absolute"});
  }

  this.DIV = divElem;
  $(this.DIV).css({"height": maxDim[0], "width": maxDim[1]});
  this.CAN = canElem;
  this.BUF = bufElem;
  this.DRAW = drawingElem;
  this.change = false;
  this.activeClones = 0;

  this.reload = function () {
    // page reloaded
    for (var obj = 0; obj < this.objKey.length; obj++) {
      curObj = this.objs[this.objKey[obj]];
      if (curObj.type == 'video') {
        curObj.vis = curObj.initVis;
        curObj.elem.style.visibility = curObj.vis;
      } else {
        if (curObj.cloneID) {
          // delete clone from objs
          delete this.objs[this.objKey[obj]];
          // delete clone name from objKey
          this.objKey.splice(obj, 1);
          // array is now one item shorter, -- loop var to compensate
          obj--;
          // One less clone
          this.activeClones--;
        } else {
          if (curObj.anim) {
            curObj.anim.AT = false;
          }
          curObj.vis = curObj.initVis;
          curObj.top = curObj.initTop;
          curObj.left = curObj.initLeft;
          curObj.width = curObj.initWidth;
          curObj.height = curObj.initHeight;
        }
      }
    }
    for (lnk in this.clicks) {
      this.clicks[lnk].pts = this.clicks[lnk].origPts;
    }
    for (lnk in this.drops) {
      this.drops[lnk].pts = this.drops[lnk].origPts;
    }
    for (lnk in this.lineEnds) {
      this.lineEnds[lnk].pts = this.lineEnds[lnk].origPts;
    }
    this.redraw();
  };
  this.redraw = function () {
    var pageElem = this;
    // Clear the buffer canvase
    this.BUF.width = this.BUF.width;
    var btx = this.BUF.getContext('2d');
    var resetTop = 0;
    var resetLeft = 0;
    var toDraw = [];
    for (obj in this.objKey) {
      var curObj = this.objs[this.objKey[obj]];
      if (curObj.type == 'video') {
        if (isPad) {
          curObj.elem.controls = true;
        } else {
          curObj.elem.controls = false;
        }

        $("#" + curObj.name).css({
          "top": curObj.top,
          "left": curObj.left,
          "height": curObj.height,
          "width": curObj.width,
          "visibility": curObj.vis
        });

      } else if (curObj.type == 'highlighter' && curObj.vis == 'show') {
        drawHighlighter(curObj);
      } else if (curObj.type == "drawing" && curObj.drawn == true) {
        toDraw.push(curObj);
      } else if (curObj.type == "field") {
        drawText(curObj);
      } else {
        // Redraw / Move each object
        drawObj(curObj);

        // if object has been moved
        var leftDif = curObj.initLeft - curObj.left;
        var topDif = curObj.initTop - curObj.top;
        if (curObj.anim && curObj.anim.active && curObj.anim.AT) {
          var anim = curObj.anim.active;
          var at = curObj.anim.AT;
          leftDif = curObj.initLeft - curObj.anim[anim].data[at].left;
          topDif = curObj.initTop - curObj.anim[anim].data[at].top;
        }
        leftDif /= resMult;
        topDif /= resMult;
        if (leftDif != 0 || topDif != 0) {
          // Carry pinned links
          var curCarry = curObj.carryLink;
          var curType = curObj.carryType;
          if (curType) {
            var curPts = this[curType][curCarry].origPts;
            for (var p = 0; p < curPts.length; p++) {
              var curX = parseInt(curPts[p].x);
              var curY = parseInt(curPts[p].y);
              this[curType][curCarry].pts[p].x = curX - leftDif;
              this[curType][curCarry].pts[p].y = curY - topDif;
            }
          }
        }
      }
    }
    for (line in this.linesOnPage) {
      for (var l = 0; l < this.linesOnPage[line].length; l++) {
        drawLine(this.linesOnPage[line][l]);
      }
    }
    for (wksp in this.workspaceKey) {
      btx.restore();
      var curSpace = this.workspaces[this.workspaceKey[wksp]];
      if (curSpace.bgOn) {
        var pattern = btx.createPattern(book.presetImages.chalkBoard, 'repeat');
        btx.rect(curSpace.left, curSpace.top, curSpace.width, curSpace.height);
        btx.fillStyle = pattern;
        btx.fill();
      }
    }

    if (this.objs.Keypad && this.objs.Keypad.hover !== false) {
      var cur = this.objs.Keypad.hover;
      btx.fillStyle = "rgba(0,0,0,0.2)";
      var left = (this.objs.Keypad.dimMod.width * cur.left) + this.objs.Keypad.left;
      var top = (this.objs.Keypad.dimMod.height * cur.top) + this.objs.Keypad.top;
      var height = this.objs.Keypad.dimMod.height * cur.height;
      var width = this.objs.Keypad.dimMod.width * cur.width;
      console.log(left, top, height, width);
      btx.fillRect(left, top, width, height);
    }

    if (this.highlightedLink) {
      var defaultHighlightColor = 'RGBA(128,255,255,0.5)';
      btx.fillStyle = (book.highlightLinkColor || defaultHighlightColor);
      var pts = this.highlightedLink;
      btx.moveTo(pts[0].x * resMult, pts[0].y * resMult);
      for (var p = 1; p < pts.length; p++) {
        btx.lineTo(pts[p].x * resMult, pts[p].y * resMult);
      }
      btx.closePath();
      btx.fill();
    }
    for (button in this.buttons) {
      var button = this.buttons[button];
      var state = button.state;
      var stateName = false;
      var img = false;
      if (state == 'on') {
        stateName = 'active';
      } else if (state == 'off') {
        stateName = 'inactive';
      } else if (state == 'hover') {
        stateName = 'hover';
      }
      var typeName = false;
      if (button.type == 'radiobutton') {
        typeName = 'radio';
      } else if (button.type == 'checkbox') {
        typeName = 'checkbox';
      }
      var fileName = typeName + '_' + stateName;
      img = book.presetImages[fileName];
      btx.drawImage(img, button.left, button.top, 22, 22);

      var text = ' ' + button.inner;
      var font = button.font;
      btx.font = font.size + 'pt ' + font.name;
      var pos = [button.left + 22, (button.top + 22) - ((font.size * 1.3333) / 4)];
      btx.fillText(text, pos[0], pos[1]);
    }
    function moveLink(curLink) {

    }

    function drawHighlighter(hi) {
      btx.fillStyle = hi.color;
      btx.fillRect(hi.left, hi.top, hi.width, hi.height);
    }

    function drawLine(curLine) {
      btx.beginPath();
      btx.moveTo(curLine.start[0], curLine.start[1]);
      btx.lineTo(curLine.finish[0], curLine.finish[1]);
      btx.stroke();
    }

    function drawObj(curObj) {
      var curElem = curObj.elem;
      btx.translate(-resetLeft, -resetTop);
      resetLeft = 0;
      resetTop = 0;
      if ((curObj.extension == "gif" || curObj.isSequence) && curObj.frames) {
        curElem = curObj.frames[curObj.currentFrame];
        // console.log(curObj.currentFrame);
      }
      if (curObj.vis == "show" && curElem) {
        // object has animation and object IS animating
        if (curObj.anim && curObj.anim.AT) {
          var curData = curObj.anim[curObj.anim.active].data[curObj.anim.AT];
          btx.restore();
          // log(curObj);
          if (curData) {
            btx.globalAlpha = curData.opacity;
            resetLeft += curData.left;
            resetLeft += curData.width / 2;
            resetTop += curData.top;
            resetTop += curData.height / 2;

            btx.translate(resetLeft, resetTop);
            btx.rotate(curData.rot);
            curObj.height = curData.height;
            curObj.width = curData.width;

            try {
              btx.drawImage(
                curElem,
                -1 * (curData.width / 2),
                -1 * (curData.height / 2),
                curData.width,
                curData.height
              );
            }
            catch (e) {
            }
            btx.rotate(-1 * curData.rot);
          } else {
            console.error(curObj);
            console.error(curObj + "'s animation data is undefined");
          }
        } else {
          var offsets = [0, 0];
          if (curObj.movement) {
            var curMove = curObj.movement;
            var pos = absPos;
            var midway = [maxDim[1] / 2, maxDim[0] / 2];
            var sway = [(pos[0] - midway[0]) / midway[0], (pos[1] - midway[1]) / midway[1]];
            if (curMove.cause == 'mouse') {
              offsets[0] = curMove.hori * sway[0];
              offsets[1] = curMove.vert * sway[1];
              if (curMove.inverted) {
                offsets[0] *= -1;
                offsets[1] *= -1;
              }
            }
          }

          btx.restore();
          if (typeof curObj.opacity == "undefined") {
            btx.globalAlpha = 1;
          } else {
            btx.globalAlpha = curObj.opacity;
          }
          // HERE"s the problem and here's the fix.
          var height = curObj.height;
          var width = curObj.width;
          var left = curObj.left;
          var top = curObj.top;
          if (curObj.swapHeight && curObj.swapWidth) {
            height = curObj.newHeight;
            width = curObj.newWidth;
            left = curObj.left + curObj.leftOffset;
            top = curObj.top + curObj.topOffset;
          }

          if (curObj.rot) {
            resetLeft += curObj.left;
            resetLeft += curObj.width / 2;
            resetTop += curObj.top;
            resetTop += curObj.height / 2;

            btx.translate(resetLeft, resetTop);
            btx.rotate(curObj.rot);

            try {
              btx.drawImage(
                curElem,
                (-1 * (curObj.width / 2)),
                (-1 * (curObj.height / 2)),
                width,
                height);
            }
            catch (e) {
            }

            btx.rotate(-1 * curObj.rot);
          } else {
            try {
              btx.drawImage(
                curElem,
                left,
                top,
                width,
                height);
            }
            catch (e) {
            }
          }

          /*
           Animations were getting stuck at the last leg. Thought that was a bug, it was a workaround for "saving animations in their last state".
           Had to get rid of that, so I set the anim.AT to false in the sequence, now you can drag animated objects.

           BUT WAIT!!

           What about animations that finish with an opacity, and need to keep it?

           Well, now when an animation ends, the animation data is copied over to the actual data, problem solved.

           BUT WAIT, regular objects don't have opacity!!

           Added opacity to regular objects.

           TODO: Didn't get opacity for all regular objects. Don't want to screw with it today, so put an undefined default of 1 check up top. This will probably cause problems in the future, but who cares about future Jason, that guys lame!

           PROBLEM SOLVED MOTHERS!!!
           */
        }
      }
    }

    function getRowsFromMaxDims(rows, fontName, maxWidth, maxHeight) {
      // THIS DOESN"T FUCKING WORK.
      // Fuck text and fuck font. This is a bunch of nonsense. It's sort of kind of working and Im hungry and I have shit to do so fuck this whole god damn thing.
      if (rows) {
        var ret = [];
        var fontSize = 1;
        for (var r = 0; r < rows.length; r++) {
          var row = rows[r];
          var maxRowFontSizeWidth = false;
          var maxRowFontSizeHeight = false;
          var underlineMod = maxHeight / rows.length / rows.length / 3; // Half of a p or a q will be under the maxHeight/rows.length. This takes care of it (about 10 lines below here)
          for (var f = 0; f < 1000; f++) {
            btx.font = f + "px " + fontName;
            var curWidth = btx.measureText(row).width;
            if (curWidth > maxWidth && !maxRowFontSizeWidth) {
              maxRowFontSizeWidth = f - 1;
            }
            // 3 is the vertical line spacing.
            if (f + 3 > (maxHeight / rows.length) - underlineMod && !maxRowFontSizeHeight) {
              maxRowFontSizeHeight = f - 1;
            }
            if (maxRowFontSizeWidth && maxRowFontSizeHeight) {
              f = 1001;
            }
          }
          maxRowFontSizeWidth = Math.max(1, maxRowFontSizeWidth);
          maxRowFontSizeHeight = Math.max(1, maxRowFontSizeHeight);
          ret.push({content: row, maxWidth: maxRowFontSizeWidth, maxHeight: maxRowFontSizeHeight});
        }
        var size = 1000;
        var which = false;
        for (var r = 0; r < ret.length; r++) {
          var row = ret[r];
          if (row.maxHeight < size) {
            size = row.maxHeight;
            which = "height";
          }
          if (row.maxWidth < size) {
            size = row.maxWidth;
            which = "width";
          }
        }
        for (var r = 0; r < ret.length; r++) {
          delete ret[r].maxHeight;
          delete ret[r].maxWidth;
          ret[r].size = size;
          ret[r].which = which;

          btx.font = size + "px " + fontName;
          var curWidth = btx.measureText(ret[r].content).width;
          ret[r].horiOffset = (maxWidth - curWidth) / 2;

          if (which == "width") {
            ret[r].vertOffset = (maxHeight - (ret.length * size)) / (ret.length + 1);
          } else {
            ret[r].vertOffset = 0;
          }
        }
        return ret;
      } else {
        return "";
      }
    }

    function drawText(curText) {
      btx.restore();
      btx.globalAlpha = 1;
      if (curText.vis == "show") {
        var contents = curText.contents;
        // Draw bg
        if (curText.bg) {
          btx.fillStyle = "rgb(" + curText.bg.join(",") + ")";
          btx.fillRect(curText.left, curText.top, curText.width, curText.height);
        }
        btx.fillStyle = "black";
        if (contents) {
          contents = contents.toString().split(/\r\n|\r|\n/g);
        }
        if (curText.editable) {
          var maxWidth = curText.width;
          var lineHeight = curText.size;
          var x = curText.left;
          var y = curText.top + curText.size;
          btx.font = curText.size + "px arial, sans-serif";
          var paragraphs = curText.contents.split(/\r\n|\r|\n/g);
          var insertionLoc = [];
          for (var p = 0; p < paragraphs.length; p++) {
            //TODO: Fix this. Word wrap can fuck up and chug if you type a bunch of "a", because it's running canvas.measureText the length of the string times!!
            var words = paragraphs[p].split(' ');
            words[0] = "    " + words[0]; // 4 spaces to a tab at the beginning of each paragraph.
            var line = "";
            var test, metrics;
            var maxY = curText.top + curText.height;
            for (var i = 0; i < words.length; i++) {
              test = words[i];
              metrics = btx.measureText(test);
              while (metrics.width > maxWidth) {
                // Determine how much of the word will fit
                test = test.substring(0, test.length - 1);
                metrics = btx.measureText(test);
              }
              if (words[i] != test) {
                words.splice(i + 1, 0, words[i].substr(test.length))
                words[i] = test;
              }

              test = line + words[i] + ' ';
              metrics = btx.measureText(test);
              if (metrics.width > maxWidth && i > 0) {
                if (y < maxY) {
                  btx.fillText(line, x, y);
                }
                line = words[i] + ' ';
                y += lineHeight;
              }
              else {
                line = test;
              }
            }
            if (y < maxY) {
              btx.fillText(line, x, y);
            }
            y += lineHeight;
          }

          if (book.curField.name == curText.name && book.curField.insertionPointAlpha && y - lineHeight < maxY) {
            // moveTo()
            var insertionLoc = {};
            insertionLoc.x = x + btx.measureText(line.substring(0, line.length - 1)).width;
            insertionLoc.y = y - lineHeight;
            btx.moveTo(insertionLoc.x + 2, insertionLoc.y - curText.size + 2);
            btx.lineTo(insertionLoc.x + 2, insertionLoc.y + 2);
            btx.stroke();
          }

        } else {
          if (curText.display == "points") {
            contents = [pageElem.points + ""];
          } else if (curText.display == "countdown") {
            contents = [pageElem.countdown + ""];
          }
          if (curText.size == "auto") {
            rows = getRowsFromMaxDims(contents, "Arial", curText.initWidth, curText.initHeight);
            for (var r = 0; r < rows.length; r++) {
              var row = rows[r];
              btx.font = row.size + "px Arial";
              var textLeft = curText.left;
              var textTop = curText.top + row.size + 4;
              if (row.which == "width") {
                textTop += (r * (row.size + 4)) + ((r + 1) * row.vertOffset);
                textLeft += row.horiOffset;
              } else {
                textTop += (r * (row.size + 4));
                textLeft += row.horiOffset;
              }
              btx.fillStyle = curText.color;
              try {
                // text,x,y,maxWidth
                btx.fillText(row.content, textLeft, textTop);
              }
              catch (e) {
              }
            }
          } else {
            for (var c = 0; c < contents.length; c++) {
              btx.font = curText.size + "px Arial";
              var textLeft = curText.left;
              var textTop = curText.top + 4 + (curText.size * (c + 1));
              var leftOffset = (curText.width - btx.measureText(contents[c]).width) / 2;
              var topOffset = 0;
              btx.fillStyle = curText.color;
              try {
                // text,x,y,maxWidth
                btx.fillText(contents[c], textLeft + leftOffset, textTop - topOffset);
              }
              catch (e) {
              }
            }
          }
        }

        // Draw border
        if (drawRects) {
          btx.strokeRect(curText.left, curText.top, curText.width, curText.height);
        }
      }
    }

    // Clear shown canvas
    this.CAN.width = this.CAN.width;
    var ctx = this.CAN.getContext('2d');
    ctx.drawImage(this.BUF, 0, 0);
    ctx.drawImage(this.DRAW, 0, 0);
    if (this.DUPCAN) {
      this.DUP.width = this.DUP.width;
      var dtx = this.DUPCAN.getContext('2d');
      dtx.drawImage(this.BUF, 0, 0);
    }
    // Draw drawing objects AFTER the canvas has been cleared and reloaded from bufcan
    for (var d = 0; d < toDraw.length; d++) {
      var curObj = toDraw[d];
      curObj.draw(true);
    }
  };
  this.toggleButtons = function (parentName, except) {
    for (var b = 0; b < this.buttons.length; b++) {
      var cur = this.buttons[b];
      if (cur.parentName == parentName) {
        if (cur.name != except) {
          cur.off();
        }
      }
    }
  };

  this.loadCont = loadCont;
  this.loaded = false;
  this.progressgraph = false;

  this.dialogs = [];
  this.dialogKey = {};
  this.objs = {};
  this.objKey = [];
  this.buttons = [];
  this.buttonKey = {};
  this.workspaces = [];
  this.workspaceKey = {};
  this.auds = {};
  this.highlightedLink = false;
  this.clicks = [];
  this.drops = [];
  this.lineStarts = [];
  this.lineEnds = [];
  this.pageOpens = [];
  this.logics = [];
  this.maths = [];
  this.countdowns = [];
  this.linesOnPage = {};
  this.drawingsOnPage = [];
  this.linkKey = {};
  this.ident = key + 1;

  this.leftBackgroundImage = getValue(curXmlPage, "LeftBackground", true);
  this.rightBackgroundImage = getValue(curXmlPage, "RightBackground", true);
  this.allowNegativePoints = (getValue(curXmlPage, "AllowPointsToGoNegative", true) == "true") ? true : false;
  this.resetWhenLeaving = (getValue(curXmlPage, "ResetWhenLeaving", true) == "true") ? true : false;


  this.points = 0;
  this.countdown = 0;
  this.countdownInt = false;
  if (book.pageNavigationDisabled) {
    this.pageNavigationEnabled = false;
  } else {
    this.pageNavigationEnabled = (getValue(curXmlPage, "DisallowPageNavigation", true) == "true") ? false : true;
  }

  this.infinitelyLoopingGifs = {};

  this.dumped = [];

  this.objMovement = false;
}
function PObject(curXmlObj, key) {
  var tmpReturn = {};
  var tmpPos = getValue(curXmlObj, "ObjInitTopLeft", true);
  // this will act as holding cell for all page objects.
  this.name = getValue(curXmlObj, "ObjName");

  if (typeof badImages != 'undefined' && badImages[this.name]) {
    console.error("Object " + this.name + " not found, skipping");
  } else {
    tmpFileName = getValue(curXmlObj, "ObjFileName", true) || this.name;
    this.type = getValue(curXmlObj, "ObjType", true) || 'image';
    this.extension = getValue(curXmlObj, "ObjExt", true) || false;
    if (this.extension) {
      // this.extension = this.extension.toLowerCase();
    }

    this.locInKey = objKey;
    this.fileName = tmpFileName;

    var tmpRect = getValue(curXmlObj, "ObjInitRect", true);
    if (tmpRect) {
      var rectSplit = splitAndFloat(tmpRect, ',');
      this.left = rectSplit[0];
      this.top = rectSplit[1];
      this.right = rectSplit[2];
      this.bottom = rectSplit[3];
      this.height = this.bottom - this.top;
      this.width = this.right - this.left;
      // NOTE if we want to add obj init opacity, reset it here
      this.opacity = 1; // so we can set it after animations have finished.
    } else if (tmpPos) {
      this.height = Number(getValue(curXmlObj, "ObjInitHeight") * resMult);
      this.width = Number(getValue(curXmlObj, "ObjInitWidth") * resMult);
      var posSplit;
      if (tmpPos) {
        posSplit = tmpPos.split(',');
      }
      this.top = Number(posSplit[0] || 0) * resMult;
      this.left = Number(posSplit[1] || 0) * resMult;
    } else {
      if (this.type == "drawing") {
        // Drawings do not have nor do they need a rect or pos. The points are abs positioned.
      } else {
        console.error('cannot read object position or initial rect');
      }
    }
    this.top = parseFloat(this.top);
    this.left = parseFloat(this.left);
    this.height = parseFloat(this.height);
    this.width = parseFloat(this.width);

    this.swapWidth = getValue(curXmlObj, "swapWidth", true);
    this.swapHeight = getValue(curXmlObj, "swapHeight", true);
    this.swapSizeOrLoc = getValue(curXmlObj, "swapSizeOrLoc", true);
    if (this.swapSizeOrLoc == false) {
      this.swapSizeOrLoc = "size";
    }
    if (this.swapWidth && this.swapHeight) {
      this.swapWidth = Number(this.swapWidth);
      this.swapHeight = Number(this.swapHeight);
      var newHeight, newWidth;
      var sizeDown = this.swapHeight / this.height;
      if (this.swapWidth / sizeDown > this.width) {
        sizeDown = this.swapWidth / this.width;
        newHeight = this.swapHeight / sizeDown;
        newWidth = this.width;
      } else {
        newHeight = this.height;
        newWidth = this.swapWidth / sizeDown;
      }
      if (this.swapSizeOrLoc == "size") {
        this.leftOffset = (this.width - newWidth) / 2;
        this.topOffset = (this.height - newHeight) / 2;
        this.newWidth = newWidth;
        this.newHeight = newHeight;
      } else if (this.swapSizeOrLoc == "loc") {
        this.leftOffset = (this.width - this.swapWidth) / 2;
        this.topOffset = (this.height - this.swapHeight) / 2;
        this.height = this.swapHeight;
        this.newHeight = this.swapHeight;
        this.width = this.swapWidth;
        this.newWidth = this.swapWidth;
      }
    } else {
      this.newWidth = this.width;
      this.newHeight = this.height;
      this.leftOffset = false;
      this.topOffset = false;
    }

    this.layer = Number(getValue(curXmlObj, "ObjLayer"));
    this.initVis = getValue(curXmlObj, "ObjInitVis", true) || 'hide';
    // Ray isn't sending me "show" for math fields. He's sending nothing. So this is a quick fix.
    if (this.initVis == true) {
      this.initVis = "show";
    }
    if (this.name == "Math O1" || this.name == "Math N1" || this.name == "Math N2" || this.name == "Math A1") {
      this.initVis = "show";
    }
    this.carryLink = false;
    this.carryType = false;

    this.initHeight = this.height;
    this.initWidth = this.width;
    this.initTop = this.top;
    this.initLeft = this.left;
    this.rot = 0;
    this.initOpacity = this.opacity;

    this.pageInBook = key;

    var curMob = getValue(curXmlObj, "ObjMobility", true);
    if (curMob) {
      if (curMob == "static") {
        this.mobility = false;
      } else {
        if (curMob == "draggable" || curMob == "dragable") {
          this.mobility = 'drag';
        } else if (curMob == "cloneable" || curMob == "clonable") {
          this.mobility = 'clone';
        }
        this.animating = false;
      }
    }
    this.vis = this.initVis || this.enabled;


    // Movement handled here
    this.movement = getValue(curXmlObj, "ObjMovement", true);
    if (this.movement) {
      book[key].objMovement = true;
      this.movement = {};
      var curXmlMove = curXmlObj.getElementsByTagName("ObjMovement")[0];
      var curMove = this.movement;
      curMove.hori = Number(getValue(curXmlMove, "Hori"));
      curMove.vert = Number(getValue(curXmlMove, "Vert"));
      curMove.cause = getValue(curXmlMove, "Cause");
      curMove.interval = Number(getValue(curXmlMove, "Interval"));
      if (isNaN(curMove.interval)) {
        curMove.interval = false;
      }
      curMove.inverted = Boolean(getValue(curXmlMove, "Inverted"));
      curMove.type = getValue(curXmlMove, "Type");
      curMove.form = curMove.type[0];
      curMove.speed = curMove.type[1];
    }

    // Animation handled here
    var animParent = curXmlObj.getElementsByTagName("ObjAnimations");
    if (animParent[0]) {
      var animObjs = 0;
      if (animParent[0]) {
        animObjs = animParent[0].getElementsByTagName("ObjAnimation");
        this.anim = {};
      }
      for (k = 0; k < animObjs.length; k++) {
        var animObj = animObjs[k];
        var xmlAnimData = getValue(animObj, "AnimationData", true);
        if (xmlAnimData != "") {
          var xmlAnimName = getValue(animObj, "AnimationName", true);
          this.anim[xmlAnimName] = {};
          var curAnim = this.anim[xmlAnimName];
          var tmpAnimShape = getValue(animObj, "AnimationShape", true);
          if (tmpAnimShape) {
            if (tmpAnimShape == 'image' || tmpAnimShape == 'polygon' || tmpAnimShape == 'circle' || tmpAnimShape == 'square') {
              // Image specific object
              curAnim.endUp = Boolean(getValue(animObj, "FinishUnrotated"));
              curAnim.type = "image";
            } else if (tmpAnimShape == "graphic") {
              // Graphic specific object
              curAnim.width = getValue(animObj, "ObjLineWidth");
              curAnim.color = rgb2hex(getValue(animObj, "ObjLineColor"));
              curAnim.type = "graphic";
            }
          } else {
            // No longer trapping for animation shape
          }
          // Global anim objs for both images and graphics
          curAnim.data = [];
          var xmlLineSplit;
          if (xmlAnimData) {
            xmlLineSplit = xmlAnimData.split(":");
            if (xmlLineSplit.length == 1 && xmlAnimData.split(";").length > 1) {
              xmlLineSplit = xmlAnimData.split(";");
            }
          } else {
            break;
          }
          var returnLines = [];
          // Parsing out the xml animation legs given
          for (line = 0; line < xmlLineSplit.length; line++) {
            var xmlElemSplit = xmlLineSplit[line].split("|");
            if (xmlElemSplit[5]) {
              var xmlElemPrev = false;
              if (xmlLineSplit[line - 1]) {
                xmlElemPrev = xmlLineSplit[line - 1].split("|")
              }
              var returnObj = {};
              returnObj.top = parseInt(xmlElemSplit[0].split(",")[0]);
              returnObj.left = parseInt(xmlElemSplit[0].split(",")[1]);
              // Switched 12/3/15 -- Watch for backward compatibility problems.
              returnObj.height = xmlElemSplit[2];
              if (returnObj.height.slice(-1) == "%") {
                returnObj.height = (parseFloat(returnObj.height) / 100) * this.newHeight;
              }
              returnObj.width = xmlElemSplit[1];
              if (returnObj.width.slice(-1) == "%") {
                returnObj.width = (parseFloat(returnObj.width) / 100) * this.newWidth;
              }
              // These two lines change the TOP and LEFT to center center. This is what Ray is giving me, but I doubt he knows.
              returnObj.top -= parseInt(returnObj.height / (2 * resMult));
              returnObj.left -= parseInt(returnObj.width / (2 * resMult));

              returnObj.top *= resMult;
              returnObj.left *= resMult;
              returnObj.opacity = xmlElemSplit[3];
              if (returnObj.opacity.slice(-1) == "%") {
                returnObj.opacity = (parseFloat(returnObj.opacity) / 100);
              }
              if (xmlElemPrev) {
                returnObj.time = xmlElemPrev[5]
              }
              returnObj.rot = 0;
              if (xmlElemPrev) {
                returnObj.rot = parseFloat(xmlElemPrev[4]);
              }
              returnLines.push(returnObj);
            }
          }
          // Adding all the inbetween frames from what is parsed
          // NOTE if we add animation smoothing, it should be done here
          var returnLinesFull = [];
          var timeWatch = 0;
          for (line in returnLines) {
            var playTime = returnLines[line].time;
            if (playTime) {
              var frameRate = 40;
              var start = returnLines[line - 1];
              var end = returnLines[line];
              var difTop = end.top - start.top;
              var difLeft = end.left - start.left;
              var difHeight = end.height - start.height;
              var difWidth = end.width - start.width;
              var difOpacity = Math.round(100 * (end.opacity - start.opacity)) / 100;
              start.top = parseInt(start.top);
              start.left = parseInt(start.left);
              start.height = parseInt(start.height);
              start.width = parseInt(start.width);
              start.rot = parseFloat(end.rot);
              var subCount = Math.floor(playTime * 1000 / frameRate);

              for (i = 1; i <= subCount; i++) {
                var step = i / subCount;
                var returnObj = {};
                returnObj.top = Math.round(start.top + (difTop * step));
                returnObj.left = Math.round(start.left + (difLeft * step));
                returnObj.width = Math.round(start.width + (difWidth * step));
                returnObj.height = Math.round(start.height + (difHeight * step));
                returnObj.opacity = start.opacity + (difOpacity * step);
                returnObj.rot = Math.PI / 180 * (360 * Math.round(start.rot * (step) * 100) / 100);
                returnLinesFull.push(returnObj);
              }
            }
          }
          curAnim.data = returnLinesFull;
          this.anim.AT = false;
          this.anim.active = false;
          if (curAnim.data[0]) {
            curAnim.data[0].rot = 0;
          } else {
            book.bugs.log("Problem with animation data on object <b>" + this.name + "</b>. Check console for details");
            console.warn("Problem with animation data on object " + this.name + ".");
            console.warn(this);
          }
        }
      }
    }


    // construction
    if (this.type == 'image') {
      this.isSequence = (getValue(curXmlObj, "ObjIsImageSequence") == "true") ? true : false;
      if ((this.extension && this.extension.toLowerCase() == "gif" && (gifInfo[this.fileName] && parseInt(gifInfo[this.fileName].length))) || this.isSequence) {
        this.src = "images/gifFrames/" + this.fileName + "_frame_0." + this.extension;
        this.currentFrame = 0;
        this.frames = [];
        if (this.isSequence) {
          this.sequenceFolderName = getValue(curXmlObj, "ObjImageSequenceFolder");
          this.frameNames = [];
          var xmlFramesOrderMessy = curXmlObj.getElementsByTagName("ObjImageSequenceOrder")[0].innerHTML;
          var xmlFramesTotMessy = curXmlObj.getElementsByTagName("ObjImageSequenceFrames")[0].childNodes;
          var xmlFramesTot = [];

          // Gets each ordered frame name out of the xml node and into a js arr.
          for (var f = 0; f < xmlFramesTotMessy.length; f++) {
            var frame = xmlFramesTotMessy[f].innerHTML;
            xmlFramesTot.push(frame);
          }
          // Switch from a pipe delimited list to a js arr
          var xmlFramesOrder = (xmlFramesOrderMessy ? xmlFramesOrderMessy.split("|") : false);

          // xmlFramesOrder is a js arr of the frames specifically chosen by user
          // AND
          // xmlFramesTot is a js arr of the left over frames.

          // This loop then adds all the xml frames in order to the this.frames arr, while deleting any duplicates in the totArr
          for (var f = 0; f < xmlFramesOrder.length; f++) {
            var curFrameName = xmlFramesOrder[f];
            this.frameNames.push(curFrameName);
            for (var fTot = 0; fTot < xmlFramesTot.length; fTot++) {
              if (xmlFramesTot[fTot] == curFrameName) {
                xmlFramesTot.splice(fTot, 1);
              }
            }
          }
          // Lastly, anything left in the totArr gets added to the very end of the this.frames arr, and we're done with this stupid freaking nonsense.
          for (var f = 0; f < xmlFramesTot.length; f++) {
            this.frameNames.push(xmlFramesTot[f]);
          }
          this.length = this.frameNames.length;
        } else {
          this.length = parseInt(gifInfo[this.fileName].length);
        }
        var THIS = this;
        this.normallyPlaying = (getValue(curXmlObj, "ObjNormallyPlaying", true) == "true") ? true : false;
        this.defaultSpeed = 24;
        if (this.normallyPlaying) {
          this.loopInfinite = true;
        } else {
          this.loopInfinite = false;
        }
        this.initLoopInfinite = this.loopInfinite;
        this.isLastLoop = false;
        this.loopInterval = false;
        this.isPlaying = false;
      } else {
        if (tmpFileName == "Keypad") {
          this.src = dependenciesLoc + "presets/" + tmpFileName + ".png";
          this.enabled = this.vis == "show";
          this.hover = false;
          this.pts = [];
          this.pts.push({y: this.initTop, x: this.initLeft});
          this.pts.push({y: this.initTop + this.initHeight, x: this.initLeft});
          this.pts.push({y: this.initTop + this.initHeight, x: this.initLeft + this.initWidth});
          this.pts.push({y: this.initTop, x: this.initLeft + this.initWidth});

          var keys = [];
          keys.push({val: 1, left: 15, top: 19, width: 37, height: 36});
          keys.push({val: 2, left: 53, top: 19, width: 37, height: 36});
          keys.push({val: 3, left: 91, top: 19, width: 35, height: 36});

          keys.push({val: 4, left: 15, top: 56, width: 37, height: 33});
          keys.push({val: 5, left: 53, top: 56, width: 37, height: 33});
          keys.push({val: 6, left: 91, top: 56, width: 35, height: 33});

          keys.push({val: 7, left: 15, top: 90, width: 37, height: 33});
          keys.push({val: 8, left: 53, top: 90, width: 37, height: 33});
          keys.push({val: 9, left: 91, top: 90, width: 35, height: 33});

          keys.push({val: ".", left: 15, top: 124, width: 37, height: 33});
          keys.push({val: 0, left: 53, top: 124, width: 37, height: 33});
          keys.push({val: "-", left: 91, top: 124, width: 35, height: 33});

          keys.push({val: "back", left: 15, top: 158, width: 37, height: 33});
          keys.push({val: "submit", left: 91, top: 158, width: 35, height: 33});
          this.keys = keys;
          this.dimMod = {};
          this.dimMod.height = this.height / 216;
          this.dimMod.width = this.width / 147;
          this.initVis = "show";
          this.vis = "show";
        } else {
          this.src = "images/" + tmpFileName + "." + this.extension;
        }
      }
    } else if (this.type == 'video') {
      this.src = "videos/" + tmpFileName + "." + getValue(curXmlObj, "ObjExt");
      this.controller = getValue(curXmlObj, "ObjShowController");
      if (this.initVis == 'hide') {
        this.initVis = 'hidden';
        this.vis = 'hidden'
      } else if (this.vis && this.vis == 'show') {
        this.initVis = 'visible';
        this.vis = 'visible';
      }
      this.top /= resMult;
      this.left /= resMult;
      this.height /= resMult;
      this.width /= resMult;
    } else if (this.type == 'highlighter') {
      this.highlightStyle = getValue(curXmlObj, "HighlighterStyle", true);
      if (this.highlightStyle == false) {
        this.highlightStyle = getValue(curXmlObj, "LeaveHighlightersOnScreen", true);
      }
      if (this.highlightStyle == false) {
        this.highlightStyle = "Line by Line";
      }
      this.highlightStyle = this.highlightStyle.toLowerCase();
      this.audio = getValue(curXmlObj, "AudioFile", true) || false;
      this.waitAtEnd = getValue(curXmlObj, "WaitAtEnd");
      if (this.waitAtEnd) {
        this.waitAtEnd *= 1000;
      }
      var marks = splitAndFloat(getValue(curXmlObj, "Markers"), ',');
      marks.push(this.initWidth);
      var times = splitAndFloat(getValue(curXmlObj, "Timers"), ',');
      times.push(0);

      this.markers = [];
      this.timers = [];
      var lastTime = 0;
      for (var m = 0; m < Math.max(marks.length, times.length); m++) {
        var curMark = marks[m];
        var curTime = times[m];
        if (typeof curMark != "undefined") {
          this.markers.push(curMark);
        }
        if (curTime) {
          this.timers.push(curTime - lastTime);
        }
        lastTime = curTime;
      }
      this.color = "RGBA(" + getValue(curXmlObj, "Color") + ",";
      var transparency = (getValue(curXmlObj, "Transparency"));
      transparency = Math.round(Math.abs(transparency - 100)) / 100;
      this.pageInBook = key;
      this.color += transparency + ")";
      this.curMark = 0;
      this.timeout = false;
      this.clear = false;
      this.parentHighlighter = getValue(curXmlObj, "ParentHighlighter") || this.name;
      this.topHighlighter = false;
      if (this.name == this.parentHighlighter) {
        this.topHighlighter = true;
        this.markers.unshift(0);
        this.parentMarker = 0;
        this.waitForAudio = getValue(curXmlObj, "WaitForAudio", true);
        if (this.waitForAudio == 'false') {
          this.waitForAudio = false;
        } else {
          this.waitForAudio = true;
        }
        this.childLength = 1;
        this.childArr = [this];
        this.currentChild = 1;
        this.sequenceBlocking = getValue(curXmlObj, 'HighlighterExecution', true).toLowerCase();
        if (this.sequenceBlocking == 'blocking') {
          this.sequenceBlocking = true;
        } else if (this.sequenceBlocking == 'passive') {
          this.sequenceBlocking = false;
        }
        this.parentObj = this;
      } else {
        this.parentObj = book[key].objs[this.parentHighlighter];
        this.sequenceBlocking = this.parentObj.sequenceBlocking;
        this.parentObj.childLength++;
        this.parentObj.childArr.push(this);
      }


      this.next = function () {
        var startMark = 0;
        var objThis = this;
        if (this.curMark < this.markers.length + startMark) {
          var lastWidth = this.curWidth || 0;
          var mark = this.markers[this.curMark];
          actWait = objThis.parentObj.timers[objThis.parentObj.parentMarker] || 0;
          this.curWidth = mark;
          this.curMark++;
          objThis.parentObj.parentMarker++;
          var bookSpot = this.pageInBook;
          if (this.highlightStyle == "line by line" || this.highlightStyle == "entire highlighter") {
            this.width = mark;
          } else if (this.highlightStyle == "section by section") {
            var actWidth = this.curWidth - lastWidth;
            this.width = actWidth;
            this.left = this.initLeft + lastWidth;
          }
          this.width *= resMult;
          book[bookSpot].redraw();
          this.nextTimeout = window.setTimeout(function () {
            if (!objThis.clear) {
              objThis.next();
            }
          }, actWait);
        } else {
          if (objThis.parentObj.highlightStyle == "entire highlighter") {
          } else {
            objThis.vis = objThis.initVis;
          }
          if (objThis.parentObj.currentChild >= objThis.parentObj.childLength) {
            // end of all child highlighters, continue with sequence if blocking.
            curSequence.openHighlight = false;
            this.waitAtEndTimeout = window.setTimeout(function () {
              // Reset highlighter visibility (hide at end)
              for (var c = 0; c < objThis.parentObj.childArr.length; c++) {
                var curChild = objThis.parentObj.childArr[c];
                curChild.vis = "hide";
              }
              book[objThis.pageInBook].redraw();

              if (!objThis.clear && objThis.sequenceBlocking) {
                curSequence.next();
              }
            }, objThis.waitAtEnd);
          } else {
            // more child highlighters
            objThis.parentObj.currentChild++;
            var childAct = objThis.parentObj.childArr[objThis.parentObj.currentChild - 1];
            childAct.start();
          }
        }
      };
      this.start = function (start) {
        if (!start) {
          start = 0;
        }
        var obj = this;
        obj.vis = 'show';
        obj.left = obj.initLeft * resMult;
        obj.top = obj.initTop * resMult;
        obj.height = obj.initHeight * resMult;
        obj.width = obj.initWidth * resMult;
        obj.curMark = 0;
        obj.curWait = 0;
        obj.curWidth = 0;
        obj.clear = false;
        curSequence.openHighlight = obj;
        if (obj.curwait) {
          window.cleartimeout(obj.curwait);
        }
        obj.next(start);
      }
    } else if (this.type == "field") {

      this.editable = getValue(curXmlObj, "AllowEditing", true) == "true" ? true : false;
      this.bg = getValue(curXmlObj, "FldTransparent", true) == "true" ? true : false;
      if (this.bg) {
        this.bg = getValue(curXmlObj, "BackgroundColor", true).split(",");
        this.bg[0] = Number(this.bg[0]);
        this.bg[1] = Number(this.bg[1]);
        this.bg[2] = Number(this.bg[2]);
      }
      // this.bg is rgba
      if (this.editable) {
        this.font = getValue(curXmlObj, "TextFont");
        this.size = Number(getValue(curXmlObj, "TextSize"));
        // this.contents = atob(getValue(curXmlObj, "FldContentsEncoded"));
        this.contents = ""; // No default text for editable fields
        this.display = "text";

        this.enabled = true;
        this.pts = [];
        this.pts.push({x: this.initLeft, y: this.initTop});
        this.pts.push({x: this.initLeft, y: this.initTop + this.initHeight});
        this.pts.push({x: this.initLeft + this.initWidth, y: this.initTop + this.initHeight});
        this.pts.push({x: this.initLeft + this.initWidth, y: this.initTop});
      } else {
        this.font = getValue(curXmlObj, "TextFont");
        this.display = getValue(curXmlObj, "FieldDisplay");
        this.color = rgb2hex(getValue(curXmlObj, "TextColor"));
        this.size = getValue(curXmlObj, "TextSize");
        if (this.size !== "auto") {
          this.size = Number(this.size);
        }
        if (this.display.toLowerCase() == "page points" || this.display.toLowerCase() == "points") {
          this.contents = book[key].points;
          this.display = "points";
        } else if (this.display.toLowerCase() == "countdown") {
          this.display = "countdown";
        } else {
          this.contents = atob(getValue(curXmlObj, "FldContentsEncoded"));
          this.display = "text";
        }
      }
      if (this.name == "Math A1") {
        this.contents = "0";
      }
    }
    else if (this.type == 'workspace') {
      var origPts = getValue(curXmlObj, "Points").split('.');
      this.pts = [];
      for (var p = 0; p < origPts.length; p++) {
        var temp = origPts[p].split(',');
        this.pts.push({});
        this.pts[p].x = Number(temp[0]);
        this.pts[p].y = Number(temp[1]);

      }
      // this.left = Math.max(this.pts[0][0],this.pts[1][0],this.pts[2][0],this.pts[3][0]);
      // this.right = Math.max(this.pts[0][0],this.pts[1][0],this.pts[2][0],this.pts[3][0]);
      this.left = Math.min(this.pts[0].x, this.pts[1].x, this.pts[2].x, this.pts[3].x);
      this.right = Math.max(this.pts[0].x, this.pts[1].x, this.pts[2].x, this.pts[3].x);
      this.top = Math.min(this.pts[0].y, this.pts[1].y, this.pts[2].y, this.pts[3].y);
      this.bottom = Math.max(this.pts[0].y, this.pts[1].y, this.pts[2].y, this.pts[3].y);
      this.width = this.right - this.left;
      this.height = this.bottom - this.top;
      this.initWidth = this.width;
      this.initHeight = this.height;
      this.bgOn = getValue(curXmlObj, "BackgroundTransparency") == "false";
      this.enabled = getValue(curXmlObj, "ObjInitStatus") == "enabled" ? true : false;

    } else if (this.type == 'drawing') {
      this.color = rgb2hex(getValue(curXmlObj, "Color"));
      var solid_or_dashed = getValue(curXmlObj, "SolidOrDashes");
      if (solid_or_dashed == "dashes") {
        this.solid = false;
      } else {
        this.solid = true;
      }
      this.lineWidth = getValue(curXmlObj, "LineWidth");
      this.origLoc = getValue(curXmlObj, "OrigLoc");
      this.tool = getValue(curXmlObj, "DrawnWith");
      var drawingPts = getValue(curXmlObj, "Points");
      this.pts = [];

      drawingPts = drawingPts.replace('  ', ' |');
      drawingPts = drawingPts.split(' ');
      var drawingTime = getValue(curXmlObj, "Times").split(' ');

      for (var p = 0; p < drawingPts.length; p++) {
        if (drawingPts[p] == "") {
          drawingPts.splice(p, 1);
          p--;
        }
      }
      // points are now good

      if (drawingPts.length != drawingTime.length) {
        if (drawingTime.length = drawingPts.length + 1) {
          console.info("Drawing times and points off by one... So I'll just pop that last time...");
          drawingTime.pop();
        } else {
          console.error('Something off with the drawings... points and times wont match.');
          console.error("THIS IS FATAL!!");
        }
      }

      var lasttime = drawingTime[0];
      for (var p = 0; p < drawingTime.length; p++) {
        this.pts[p] = {};
        if (drawingPts[p] == "|") {
          this.pts[p].x = "wait";
          this.pts[p].y = "wait";
        } else {
          var pts = drawingPts[p].split(',');
          this.pts[p].x = Number(pts[0]);
          this.pts[p].y = Number(pts[1]);
        }
        this.pts[p].t = Number(drawingTime[p] - lasttime);
        lasttime = drawingTime[p];
      }
      this.drawn = (this.vis == "show") ? true : false;
      this.timeout = false;
      this.draw = function (instant) {
        if (this.drawn) {
          this.drawn = false;
          book[key].redraw();
        }
        this.drawn = true;
        var can = book[key].CAN;
        var ctx = can.getContext('2d');
        ctx.strokeStyle = this.color;
        ctx.lineJoin = "round";
        ctx.lineWidth = this.lineWidth;
        ctx.moveTo(this.pts[0].x, this.pts[0].y);
        ctx.beginPath();

        var p = 0;
        var THIS = this;
        this.next = function () {
          p++;
          var pts = this.pts[p];
          if (pts) {
            if (pts.x == "wait") {
              if (this.pts[p + 1]) {
                ctx.moveTo(this.pts[p + 1].x, this.pts[p + 1].y);
              }
            } else {
              if (this.solid) {
                ctx.lineTo(pts.x, pts.y);
              } else {
                if (this.pts[p - 1]) {
                  var startX = this.pts[p - 1].x;
                  var endX = this.pts[p].x;
                  var startY = this.pts[p - 1].y;
                  var endY = this.pts[p].y;
                  var difX = endX - startX;
                  var difY = endY - startY;
                  var secondX = startX + (difX / 3);
                  var thirdX = startX + ((2 * difX) / 3);
                  var secondY = startY + (difY / 3);
                  var thirdY = startY + ((2 * difY) / 3);
                  endX = endX;
                  endY = endY;

                  ctx.moveTo(startX, startY);
                  ctx.lineTo(secondX, secondY);
                  ctx.moveTo(thirdX, thirdY);
                  ctx.lineTo(endX, endY);

                } else {
                  ctx.lineTo(pts.x, pts.y);
                }
              }
              ctx.stroke();
            }
            this.timeout = window.setTimeout(function () {
              THIS.next();
            }, pts.t);
          } else {
            this.drawn = true;
            if (curSequence) {
              if (curSequence.openDrawing && curSequence.openDrawing.name == THIS.name) {
                curSequence.openDrawing = false;
              }
              THIS.draw(true);
              curSequence.next();
              THIS.drawn = true;
            }
          }
        };
        this.all = function () {
          for (var p = 0; p < this.pts.length; p++) {
            /*
             if (this.pts[p].x == "wait") {
             ctx.moveTo(this.pts[p + 1].x, this.pts[p + 1].y);
             } else {
             ctx.lineTo(this.pts[p].x, this.pts[p].y);
             ctx.stroke();
             }
             */
            var pts = this.pts[p];
            if (pts) {
              if (pts.x == "wait") {
                if (this.pts[p + 1]) {
                  ctx.moveTo(this.pts[p + 1].x, this.pts[p + 1].y);
                }
              } else {
                if (this.solid) {
                  ctx.lineTo(pts.x, pts.y);
                } else {
                  if (this.pts[p - 1]) {
                    var startX = this.pts[p - 1].x;
                    var endX = this.pts[p].x;
                    var startY = this.pts[p - 1].y;
                    var endY = this.pts[p].y;
                    var difX = endX - startX;
                    var difY = endY - startY;
                    var secondX = startX + (difX / 3);
                    var thirdX = startX + ((2 * difX) / 3);
                    var secondY = startY + (difY / 3);
                    var thirdY = startY + ((2 * difY) / 3);
                    endX = endX;
                    endY = endY;

                    ctx.moveTo(startX, startY);
                    ctx.lineTo(secondX, secondY);
                    ctx.moveTo(thirdX, thirdY);
                    ctx.lineTo(endX, endY);

                  } else {
                    ctx.lineTo(pts.x, pts.y);
                  }
                }
                ctx.stroke();
              }
            }
          }
        };
        if (instant) {
          this.all();
        } else {
          this.next();
        }
        ctx.closePath();
      }

    }
    // assignment
    if (this.type == 'workspace') {
      // Pushing tmpReturn into book[current page][current object]
      book[key].workspaceKey[this.name] = book[key].workspaces.length;
      // Adding all image names to objKey arr, for later use.
      book[key].workspaces.push(this);
    } else {
      // Pushing tmpReturn into book[current page][current object]
      book[key].objs[this.name] = this;
      // Adding all image sources to buffer array.
      bufArr[key].push(this.name + "." + this.type);
      // Adding all image names to objKey arr, for later use.
      book[key].objKey.push(this.name);
    }
  }
}


function getValue(parent, nodeName, silentError) {
  var tmpReturn = false;
  if (parent && parent.textContent) {
    try {
      tmpReturn = parent.getElementsByTagName(nodeName)[0].textContent;
    }
    catch (e) {
      if (!silentError) {
        /*
         console.error("XML READ ERROR");
         console.error("Cannot get value ");
         console.error(nodeName);
         console.error(" from parent element ");
         console.error(parent);
         */
        console.error("XML READ ERROR. Cannot get value " + nodeName + " from parent element " + parent);
        console.error(parent);
      }
    }
  }
  return tmpReturn;
}


function rescale() {
  $("#main").css({"height": 0, "width": 0});
  document.head.firstChild.content = 'width=device-width, initial-scale=1';
  var middle = $('#screen-middle').offset().left;
  window.setTimeout(function () {
    $("#main").css({"height": bookHeight + (15), "width": bookWidth + (10), 'opacity': 0});
    $("#main").animate({'opacity': 1}, 300);
    var curBookHeight = bookHeight + 15;
    var curBookWidth = (bookWidth + 10) + 150;
    var curScreenHeight, curScreenWidth;
    window.orientation = 90;
    if (window.orientation == 180 || window.orientation == 0) {
      curScreenHeight = screenHeight;
      curScreenWidth = screenWidth;
    } else {
      curScreenHeight = screenWidth;
      curScreenWidth = screenHeight;
    }
    curScreenHeight -= deviceTopBar;
    curScreenHeight = $('#screen-middle').offset().top * 2;
    curScreenWidth = $('#screen-middle').offset().left * 2;
    viewportScale = Math.min(Math.min(curScreenHeight / curBookHeight, curScreenWidth / curBookWidth), 1);
    console.log('SCREEN WIDTH ' + curScreenWidth);
    console.log('BOOK WIDTH ' + curBookWidth);
    console.log('SCREEN HEIGHT ' + curScreenHeight);
    console.log('BOOK HEIGHT ' + curBookHeight);
    console.log(viewportScale);
    document.head.firstChild.content = 'width=device-width, initial-scale=' + viewportScale + ', maximum-scale=' + viewportScale + ', minimum-scale=' + viewportScale + ', user-scalable=no';
    vertCenterBook(curScreenHeight);
    /*
     $("#background").css({"height":0,"width":0});
     $("#background").css({"height":"100%","width":"100%"});
     */
  }, 500);
}


function swapExt(src, newExt) {
  var extSplt = src.split(".");
  var ext = extSplt.pop();
  var root = extSplt.join(".");
  var newSrc = root + "." + newExt;
  return newSrc;
}

function stringBetween(parentStr, start, end) {
  var retStr = parentStr.substring(parentStr.indexOf(start) + 1, parentStr.indexOf(end));
  return retStr;
}












