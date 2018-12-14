var mxVel = ["", "", "", "", "", ""];
var mxVelOverride = false;
var mxVelOverrideTimeout;
var viewVelocity = false;
var startX = 0;
var origX = 0;
var pageDir = false;
var pageAnimAt = false;
var pageAnimInt = false;
var curDrag = false;
var lastDragPos = [];
var lastDragPage = false;
var scrollOffsets = [0, 0];
var vertCenteredOffset = 0;
var mxStr, myStr;
var lineStartPos = [];
var lineFrom = false;
var lastLinePage = false;
var mMode = false;  // nav, down, line, draw-pencil, draw-pen, draw-high, draw-erase
var absPos = [0, 0];
var drawCTX = false;
var lineCTX = false;
var drawingPoints = [];
var startTime, firstMoveTime = false, lastMoveTime, endTime, prevStr, nextStr;
var clickInCont = false;
var buttonHoverName = false;

function animPlate(mod) {
  var animTime = 300;
  plateHeight = mod;
  var arrows = function (dir) {
    var mod = 0;
    if (dir == 'down') {
      mod = 90;
    }
    var step = 0;
    var stepInt = window.setInterval(function () {
      step++;
      if (step > 45) {
        window.clearInterval(stepInt);
      } else {
        var leftVal = "rotate(" + (mod + (45 + (2 * step))) + "deg)";
        var rightVal = "rotate(" + (mod + (-45 - (2 * step))) + "deg)";
        $("#arrowStickLeft").css({
          "transform": leftVal,
          "-webkit-transform": leftVal,
          "-moz-transform": leftVal,
          "-o-transform": leftVal
        });
        $("#arrowStickRight").css({
          "transform": rightVal,
          "-webkit-transform": rightVal,
          "-moz-transform": rightVal,
          "-o-transform": rightVal
        });
        if (dir == 'down') {
          $(".arrowStick").css({"background-color": "RGB(20," + (3 * step) + ",20)"});
        } else {
          $(".arrowStick").css({"background-color": "RGB(20," + (135 - (3 * step)) + ",20)"});
        }
      }
    }, animTime / 45);
  };
  if (mod == 'half' || mod == 'full') {
    $("#bookDisabled").css("width", "100%");
    $("#bookDisabled").animate({"opacity": 0.3}, animTime / 2);
    if (mod == 'half') {
      arrows('up');
      $(plateCont).animate({"height": 150}, animTime);
    } else if (mod == 'full') {
      $(plateCont).animate({"height": 300}, animTime);
    }
  } else if (mod == 'close') {
    arrows('down');
    $(plateCont).animate({"height": 50}, animTime);
    $("#bookDisabled").animate({"opacity": 0.3}, animTime);
    window.setTimeout(function () {
      $("#bookDisabled").css("width", "0");
    }, animTime);
  } else {
    book.bugs.log('Unknown mod of <b>' + mod + '</b> in animPlate function call');
  }
}

$(window).resize(function () {
  if (!isPad) {
    vertCenterBook();
  }
  bookOffsets = $("#bookC").offset();
});
function centerOfPoly(poly) {
  var containingRect = [maxDim[0], maxDim[1], 0, 0];
  if (pDisplay == 'BlockSpread') {
    containingRect[1] *= 2;
  }
  for (var i = 0; i < poly.length; i++) {
    var curX = (poly[i].x);
    var curY = (poly[i].y);
    if (curY < containingRect[0]) {
      containingRect[0] = curY;
    }
    if (curX < containingRect[1]) {
      containingRect[1] = curX;
    }
    if (curY > containingRect[2]) {
      containingRect[2] = curY;
    }
    if (curX > containingRect[3]) {
      containingRect[3] = curX;
    }
  }
  var centerY = (containingRect[2] - containingRect[0]) / 2 + containingRect[0];
  var centerX = (containingRect[3] - containingRect[1]) / 2 + containingRect[1];
  return [centerY, centerX];
}
function debug() {
  viewVelocity = true;
  return "Debugging!";
}

function lineCheck(page, pos) {
  var lineHit = false;
  var pt = {x: pos[0], y: pos[1]};
  for (var i = 0; i < page.lineStarts.length; i++) {
    var curLineStart = page.lineStarts[i];
    var poly = curLineStart.pts;
    if (pointInPoly(poly, pt)) {
      lineHit = curLineStart;
      i = page.lineStarts.length;
    }
  }
  return lineHit;
}
function workspaceCheck(page, pos) {
  var ret = false;
  var pt = {x: pos[0], y: pos[1]};
  var workspaces = page.workspaces;
  for (var w = 0; w < workspaces.length; w++) {
    var cur = workspaces[w];
    if (cur.enabled && pointInPoly(cur.pts, pt)) {
      ret = cur;
    }
  }
  return ret;
}
function addUserControl() {
  // ipad speeds

  // Check for tablet first, because it could be chrome on a pad
  if (isPad) {
    mxStr = "pageX";
    myStr = "pageY";
  } else if (isChrome) {
    mxStr = "x";
    myStr = "y";
  } else {
    mxStr = "clientX";
    myStr = "clientY";
  }
  var selectFnc = function (event) {
    if (event) {
      if (pDisplay == 'Single') {
        return book[curPage - 1];
      } else if (pDisplay == 'SingleSpread') {
        var mX = (event[mxStr] || event.changedTouches[0].pageX) + scrollOffsets[1] - bookOffsets.left;
        if (curPage == 1) {
          if (mX > pUnit / 2 && mX < (pUnit / 2) + pUnit) {
            return book[0];
          }
        } else if (curPage == book.length + 1) {
          if (mX > pUnit / 2 && mX < (pUnit / 2) + pUnit) {
            return book[book.length - 1];
          }
        } else {
          if (mX < pUnit) {
            // page on left
            return book[curPage - 2];
          } else {
            // page on right
            return book[curPage - 1];
          }
        }
      } else if (pDisplay == 'BlockSpread') {
        return book[curPage - 1];
      }
    } else {
      return false;
    }
  };
  // working on ipads
  window.downHoldingForInterruptTimeout = false;
  var downFnc = function (event) {
    if (mMode && !book.dialog.open) {
      var pos;
      if (isPad) {
        pos = [event.touches[0][mxStr], event.touches[0][myStr]];
      } else {
        pos = [event[mxStr] + scrollOffsets[1], event[myStr] + scrollOffsets[0] - vertCenteredOffset];
      }
      var page = selectFnc(event);
      event.preventDefault();
      var noDrop = false;
      window.downHoldingForInterruptTimeout = window.setTimeout(function () {
        if (curSequence) {
          curSequence.end();
        }
      }, book.interruptTime);
      if (mMode == "typing") {
        book.curField.page = false;
        book.curField.name = false;
        $("#textEntryHidden").blur();
        blinkInsertionPoint(false); // Get rid of insertion point
        window.clearInterval(book.curField.insertionPoint);
        book[curPage - 1].redraw();
      }
      if (page) {
        var absPos = offsetCalc(page, pos[0], pos[1]);
        var pts = {x: absPos[0], y: absPos[1]};
        var lineRet = lineCheck(page, absPos);
        var dragRet = dragCheck(page, pos[0], pos[1], true);
        var workspaceRet = workspaceCheck(page, absPos);
        if (dragRet) {
          hoverMouse('grabbing');
          mMode = "down";
        } else if (lineRet) {
          lineFrom = lineRet.name;
          if (lineRet.lineDraw.toLowerCase() == "single") {
            var dupLine = page.linesOnPage[lineFrom];
            if (dupLine) {
              delete page.linesOnPage[lineFrom];
              page.redraw();
            }
          }
          lastLinePage = page;
          mMode = 'line';
          lineCTX = page.CAN.getContext('2d');
          lineCTX.beginPath();
          lineStartPos = [relPos[0] * resMult, relPos[1] * resMult];
          hoverMouse("crosshair");
          mMode = "line";
        } else if (workspaceRet) {
          hoverMouse("drawingTool");
          book.drawingTools.curWorkspace = workspaceRet;
          workspaceDraw(workspaceRet, pts);
          mMode = 'draw';
        } else {
          // turning page
          startX = toBookPercent(event);
          origX = startX;
          if (mMode != "line") {
            mMode = "down";
          }
        }
      }
    }
  };
// working on ipads (slowly)
  var moveFnc = function (event) {
    if (mMode) {
      var pos;
      if (isPad) {
        pos = [event.touches[0][mxStr], event.touches[0][myStr]];
      } else {
        pos = [event[mxStr] + scrollOffsets[1], event[myStr] + scrollOffsets[0] - vertCenteredOffset];
      }
      event.preventDefault();
      var page = selectFnc(event);
      absPos = offsetCalc(page, pos[0], pos[1]);
      var pts = {x: absPos[0], y: absPos[1]};
      mxVelPop(pos[0]);
      if (!pageAnimInt) {
        if (mMode == "down") {
          if (!page) {
            leaveFnc();
          } else if (curDrag) {
            if (page == lastDragPage) {
              dragObj(curDrag[0], curDrag[1], offsetCalc(page, pos[0], pos[1]), page, curDrag[2]);
            } else {
              dragEnd();
            }
          } else if (bookLength != 1) {
            if (page.pageNavigationEnabled) {
              uDrag(toBookPercent(event));
            }
          }
        } else if (mMode == 'nav' || mMode == "typing") {
          if (book.dialog.open) {
            if (book.dialog.dragging) {
              var dragLoc = [pos[1] - 38 - book.dialog.dragOffsets[1], pos[0] - bookOffsets.left - book.dialog.dragOffsets[0] - scrollOffsets[1]];
              var leftBound = 0;
              var rightBound = (maxDim[1] * 2) - book.dialog.dragging.width - 16;
              var topBound = 0;
              var bottomBound = maxDim[0] - book.dialog.dragging.height - 40;
              if (dragLoc[1] > leftBound && dragLoc[1] < rightBound && dragLoc[0] > topBound && dragLoc[0] < bottomBound) {
                $(book.dialog.dragging.dialogWin).css({
                  'top': dragLoc[0],
                  'left': dragLoc[1],
                });
              } else {
                book.dialog.dragging = false;
              }
            }
          } else {
            // Check if mouse is above a drag area first
            if (lastDragPos[0]) {
              hoverMouse('grabbing');
            } else if (dragCheck(page, pos[0], pos[1], false)) {
              hoverMouse('grab');
            } else {
              // Check if mouse is above link second (all links below drags
              actionCheck(page, pos[0], pos[1], true);
            }
          }
        } else if (mMode == 'line') {
          if (lastLinePage == page) {
            drawLine(page, pos);
            actionCheck(page, pos[0], pos[1], true); // hover
          } else {
            lineDeny(false);
          }
        } else if (mMode == 'draw') {
          if (pointInPoly(book.drawingTools.curWorkspace.pts, pts)) {
            workspaceDraw(book.drawingTools.curWorkspace, pts);
          } else {
            book.drawingTools.lastPos = false;
            // Don't change mode, because you want the kid to be able to shade in the edges.
          }
        }
        if (page && page.objMovement) {
          page.redraw();
        }
      } else {
        leaveFnc();
      }
    }
  };
// working on ipads
  var upFnc = function (event) {
    window.clearTimeout(window.downHoldingForInterruptTimeout);
    // if user is turning the page
    if (pageDir) {
      if (!pageAnimInt && mMode == "down") {
        mMode = "nav";
        hoverMouse(false);
        var page = selectFnc(event);
        uDragStop();
      }
    } else {
      if (!pageAnimInt) {
        if (mMode != 'nav') {
          // page is not animating to an already dropped turn
          var page, posX, posY;
          if (isPad) {
            var page = selectFnc(event);
            var posX = event.changedTouches[0].pageX;
            var posY = event.changedTouches[0].pageY;
          } else {
            var page = selectFnc(event);
            var posX = event[mxStr];
            var posY = event[myStr];
          }
          if (page && !pageDir) {
            actionCheck(page, posX + scrollOffsets[1], posY + scrollOffsets[0] - vertCenteredOffset, false, curDrag);
          }
        } else {
          if (book.dialog.open) {
            book.dialog.dragging = false;
          }
        }
      }
    }
    if (mMode == 'down' || mMode == 'draw') {
      book.drawingTools.lastPos = false;
      mMode = "nav";
    }
    curDrag = false;
  };
  prevStr = function (fromSequence) {
    if (!pageAnimInt && !pageDir && curPage > 1 && !book.dialogUp) {
      if ((!book.noNav && book[curPage - 2].pageNavigationEnabled) || fromSequence) {
        if (curSequence) {
          curSequence.end();
        }
        pageDir = 'left';
        startX = 0;
        setPageAnimInt(0, 'left', 'right');
      }
    }
  };
  nextStr = function (fromSequence) {
    if (!pageAnimInt && !pageDir && curPage < bookLength && !book.dialogUp) {
      if ((!book.noNav && book[curPage].pageNavigationEnabled) || fromSequence) {
        if (curSequence) {
          curSequence.end();
        }
        pageDir = 'right';
        startX = 1;
        setPageAnimInt(1, 'right', 'left');
      }
    }
  };
  var closeGoto = function () {
  };
  $(window).blur(function () {
    if (curSequence) {
      curSequence.end();
    }
  });
  var prev = $("#prev");
  var next = $("#next");
  var gutterPrev = $("#gutterPrev");
  var gutterNext = $("#gutterNext");
  var fieldType = function (e) {
    var val = $(book.textEntryHidden).val();
    var badKeys = [33, 34, 35, 36, 37, 38, 39, 40, 45, 46];
    if (badKeys.indexOf(e.keyCode) !== -1 || val.length > 499) {
      e.preventDefault(); // NO MOVEMENT!
    } else {
      var page = book.curField.page;
      var name = book.curField.name;
      window.setTimeout(function () {
        // No timeout, and the val is missing the last letter. This is keydown, not keyup
        book[page - 1].objs[name].contents = $(book.textEntryHidden).val();
        window.clearInterval(book.curField.insertionPoint);
        blinkInsertionPoint(true);
        book.curField.insertionPoint = window.setInterval(blinkInsertionPoint, 500);
        book[page - 1].redraw();
      }, 1);
    }
  }
  window.setTimeout(function () {
    book.loader.kill();
    delete book.loader;
    $("#shade").css("height", "0");
    $(book.textEntryHidden).keydown(fieldType);
    if (isPad) {
      window.setTimeout(function () {
        /*
         $(".gutter").animate({'opacity':1},500);
         window.setTimeout(function() {$(".gutterImage").css({'display':'block'})},800);
         window.setTimeout(function() {$(".gutterImage").css({'display':'none'})},1200);
         window.setTimeout(function() {$(".gutterImage").css({'display':'block'})},1600);
         window.setTimeout(function() {$(".gutterImage").css({'display':'none'})},2000);
         window.setTimeout(function() {$(".gutter").animate({'opacity':0},500);},2000);
         */
      }, 200);
      window.setTimeout(function () {
        var leftGutter = $("#leftGutter");
        var rightGutter = $("#rightGutter");
        rightGutter[0].addEventListener("touchend", nextStr);
        leftGutter[0].addEventListener("touchend", prevStr);
        bookC.addEventListener("touchstart", downFnc);
        bookC.addEventListener("touchmove", moveFnc);
        bookC.addEventListener("touchend", upFnc);
        next[0].addEventListener("touchend", nextStr);
        prev[0].addEventListener("touchend", prevStr);
        // book.drawingTools.selector.addEventListener("touchend", book.drawingTools.toggleTool);
        gutterNext[0].addEventListener("touchend", nextStr);
        gutterPrev[0].addEventListener("touchend", prevStr);
      }, 250);
    } else {
      // clicking outside of login container will exit login container
      var exitLogin = function () {
        if (clickInCont) {
          clickInCont = false;
        }
      };
      var noExit = function () {
        clickInCont = true;
      };
      document.body.addEventListener('mousedown', exitLogin);
      // book.drawingTools.selector.addEventListener("mouseup", book.drawingTools.toggleTool);
      bookC.addEventListener("mousedown", downFnc);
      bookC.addEventListener("mousemove", moveFnc);
      $(bookC).mouseleave(function () {
        leaveFnc();
      });
      bookC.addEventListener("mouseup", upFnc);
      prev.mouseenter(function () {
        if (curPage > 1 && book[curPage - 2].pageNavigationEnabled) {
          hoverMouse("hand");
        }
      });
      prev.mouseleave(function () {
        hoverMouse(false)
      });
      next.mouseenter(function () {
        if (curPage < bookLength && book[curPage].pageNavigationEnabled) {
          hoverMouse("hand")
        }
      });
      next.mouseleave(function () {
        hoverMouse(false)
      });
      gutterPrev.mouseenter(function () {
        if (curPage > 1) {
          hoverMouse("hand");
          gutterPrev.addClass('VCcenteractive')
        }
      });
      gutterPrev.mouseleave(function () {
        hoverMouse(false);
        gutterPrev.removeClass('VCcenteractive')
      });
      gutterNext.mouseenter(function () {
        if (curPage < bookLength) {
          hoverMouse("hand");
          gutterNext.addClass('VCcenteractive')
        }
      });
      gutterNext.mouseleave(function () {
        hoverMouse(false);
        gutterNext.removeClass('VCcenteractive')
      });
      prev[0].addEventListener("mousedown", prevStr);
      next[0].addEventListener("mousedown", nextStr);
      gutterPrev[0].addEventListener("mousedown", prevStr);
      gutterNext[0].addEventListener("mousedown", nextStr);
      $(window).scroll(function () {
        scrollOffsets = [];
        scrollOffsets.push($(window).scrollTop());
        scrollOffsets.push($(window).scrollLeft());
      });
    }
    checkNormallyPlayingOnPage(curPage - 1);
    checkOpenPageLinks();
    mMode = 'nav';
  }, 1);
}
function checkNormallyPlayingOnPage(which) {
  for (var o = 0; o < book[which].objKey.length; o++) {
    var objName = book[which].objKey[o];
    var gif = book[which].objs[objName];
    if (gif.extension == "gif" && gif.normallyPlaying) {
      // Why not put function here? Because var gif will is in closure with the loop, so it will eventually be the
      // last loop set, not the one that meets the criteria. Passing it through a function cleans the closure
      startInfiniteLoop(gif, which);
    }
  }
}
function startInfiniteLoop(gif, page) {
  gif.isPlaying = true;
  gif.currentFrame = 0;
  book[page].infinitelyLoopingGifs[gif.name] = {};
  book[page].infinitelyLoopingGifs[gif.name].gifName = gif.name;
  book[page].infinitelyLoopingGifs[gif.name].pageLoc = page;
  book[page].infinitelyLoopingGifs[gif.name].interval = function () {
    var gif = book[this.pageLoc].objs[this.gifName];
    gif.currentFrame++;
    if (gif.currentFrame > gif.length - 1) {
      if (gif.loopInfinite && !gif.isLastLoop) {
        gif.currentFrame = 0;
      } else {
        gif.currentFrame = 0;
      }
    }
    book[gif.pageInBook].redraw();
  };
  // Small explanation here. The bind in the invocation assures that the function scope will be at the
  // book[0].infinitelyLoopingGifs level, not the window level. That way, we can continue to get the fresh gif object
  // every itteration, which solves the save state problem of a wipe and replace.
  window.setInterval(book[page].infinitelyLoopingGifs[gif.name].interval.bind(book[page].infinitelyLoopingGifs[gif.name]), 1000 / gif.defaultSpeed)
}
function dragThreshCheck(dragObj, pt) {
  var xDif = Math.abs(dragObj[1][0] - pt.x);
  var yDif = Math.abs(dragObj[1][1] - pt.y);
  if (xDif > 25 || yDif > 25) {
    return true;
  } else {
    return false;
  }
}
function actionCheck(page, mX, mY, isHover, isDrag) {
  if (page && page.loaded) {
    // turn off all buttons
    if (buttonHoverName) {
      var hoverButton = page.buttons[page.buttonKey[buttonHoverName]];
      hoverButton.off();
    }
    var pos = offsetCalc(page, mX, mY);
    //if (!isHover) {console.log(pos)}
    var pt = {};
    pt.x = pos[0];
    pt.y = pos[1];
    var hit = false;
    var actionArr = false;
    if (isDrag) {
      var dragThresh = 25;
      var dragThreshMet = dragThreshCheck(isDrag, pt);
      if (dragThreshMet) {
        actionArr = page.drops;
      } else {
        actionArr = page.clicks;
      }
    } else {
      if (mMode == "line") {
        actionArr = page.lineEnds;
      } else {
        actionArr = page.clicks;
        if (actionArr.length) {
          actionArr = actionArr.concat(page.buttons);
        } else {
          actionArr = page.buttons;
        }
        if (isHover) {
          if (actionArr.length) {
            actionArr = actionArr.concat(page.lineStarts);
          } else {
            actionArr = page.lineStarts;
          }
        }
      }
    }

    var textFields = [];
    for (var o = 0; o < page.objKey.length; o++) {
      var name = page.objKey[o];
      var obj = page.objs[name];
      if (obj.type == "field" && obj.editable) {
        textFields.push(obj);
      }
    }


    var orig = JSON.parse(JSON.stringify(actionArr));
    var textFields = JSON.parse(JSON.stringify(textFields));
    var workspaces = JSON.parse(JSON.stringify(page.workspaces));
    actionArr = workspaces.concat(textFields, orig);
    // Now we have [workspace 1, workspace 2, field 1, field 2, link 1, link 2, ]
    if (page.objs.Keypad) {
      actionArr.push(page.objs.Keypad);
    }
    // Now we have [workspace 1, workspace 2, field 1, field 2, link 1, link 2, Keypad, ]

    // Get rid of any disabled links in the actionArr
    for (var key = actionArr.length - 1; key >= 0; key--) {
      if (!actionArr[key].enabled) {
        actionArr.splice(key, 1);
      }
    }

    // looping as link, then field, then workspace.
    // Backwards loop because Ray layers link backwards, but everything else not backwards... don't ask.
    for (var key = actionArr.length - 1; key >= 0; key--) {
      var poly = actionArr[key].pts;
      if (pointInPoly(poly, pt)) {
        var acceptFrom = actionArr[key].requires || 'any';
        if (acceptFrom == 'any') {
          hit = key;
          key = -1;
        } else {
          if (isDrag) {
            var dragSplit = isDrag[0].name.split("_");
            var curName = isDrag[0].name;
            if (dragSplit.length == 3 && dragSplit[1] == 'clone') {
              curName = dragSplit[0];
            }
            if (curName.toString() == acceptFrom.toString()) {
              hit = key;
              key = -1;
            }
          } else if (mMode == 'line') {
            if (isHover) {
              hit = key;
              key = -1;
            } else {
              if (acceptFrom == lineFrom) {
                hit = key;
                key = -1;
              }
            }
          }
        }
      }
    }

    // if any click, and in sequence, clear sequence
    if (!isHover && curSequence) {
      // curSequence.end();
    }
    if (book.drawingTools.curWorkspace && !isHover) {
      book.drawingTools.curWorkspace = false;
      book.drawingTools.lastPos = false;
      mMode = "nav";
    }
    if (actionArr[hit]) {
      if (actionArr[hit].name !== "Keypad" && page.objs.Keypad) {
        page.objs.Keypad.hover = false;
      }
      var buttonFlash = false;
      if (actionArr[hit].parentObj) {
        buttonFlash = actionArr[hit].parentObj.childFlash;
      }
      if (isHover) {
        if (mMode == 'line') {
          hoverMouse("cell");
        } else if (actionArr[hit].type == "workspace") {
          hoverMouse("drawingTool");
        } else if (actionArr[hit].type == 'field') {
          hoverMouse("text");
        } else {
          if (actionArr[hit].lineDraw == "single" || actionArr[hit].lineDraw == "multiple") {
            hoverMouse("crosshair");
          } else {
            hoverMouse("hand");
            if (actionArr[hit].linkType == 'button' && actionArr[hit].state == 'off' && !buttonFlash) {
              buttonHoverName = actionArr[hit].name;
              actionArr[hit].hover();
            }
            if (actionArr[hit].name == "Keypad") {
              keypadEvent(pt.x - actionArr[hit].left, pt.y - actionArr[hit].top, actionArr[hit], page, "hover");
            }
          }
        }
      } else {
        // startFX(page,actionArr[hit].pts,pt)
        if (actionArr[hit]) {
          var targetsHit = actionArr[hit].targets;
          var linkName = actionArr[hit].name;
          if (mMode == 'line') {
            pos[0] *= resMult;
            pos[1] *= resMult;
            mMode = "nav";
            // linkName is the link accepting the line, NOT the link that started the line
            lineAccept(page, lineStartPos, pos, lineFrom);
          } else if (isDrag) {
            // It's a mouse up, it's a drag.
            if (!curSequence) {
              hoverMouse(false);
              if (actionArr[hit].autoHighlight) {
                page.highlightedLink = actionArr[hit].pts;
              }
              // Not needed. We only get here if the drag hasn't moved yet. Or something. Not sure. Whatever
              // dragEnd(isDrag);
              curSequence = new sequence(targetsHit, page, linkName, pos, "click");
            }
            var polyCenter = centerOfPoly(actionArr[hit].pts);
            if (book.snapDropToLoc) {
              isDrag[0].top = (polyCenter[0] * resMult) - (isDrag[0].height / 2);
              isDrag[0].left = (polyCenter[1] * resMult) - (isDrag[0].width / 2);
              page.redraw();
              hoverMouse(false);
            }
          } else if (actionArr[hit].type == 'workspace') {
            hoverMouse("drawingTool");
          } else if (actionArr[hit].type == 'field') {
            hoverMouse("text");
            mMode = "typing";
            var str = actionArr[hit].contents;
            $(book.textEntryHidden).attr("value", str);
            $(book.textEntryHidden).focus();
            $(book.textEntryHidden)[0].setSelectionRange(str.length, str.length);
            book.curField.name = actionArr[hit].name;
            book.curField.page = page.ident;
            blinkInsertionPoint(true);
            book.curField.insertionPoint = window.setInterval(blinkInsertionPoint, 500);
          } else {
            if (!curSequence) {
              hoverMouse(false);
              if (actionArr[hit].autoHighlight) {
                page.highlightedLink = actionArr[hit].pts;
              }
              var triggerType = (actionArr[hit].action) ? actionArr[hit].action.split(",") : false;
              if (actionArr[hit].linkType == "button") {
                triggerType = "button";
              } else if (triggerType.length > 1) {
                triggerType = triggerType[0];
              } else {
                triggerType = "clicks";
              }
              if (actionArr[hit].linkType == 'button') {
                buttonHoverName = false;
                if (!buttonFlash) {
                  if (actionArr[hit].state == 'on' && actionArr[hit].type == 'checkbox') {
                    actionArr[hit].off();
                  } else {
                    page.toggleButtons(actionArr[hit].parentName, actionArr[hit].name);
                    actionArr[hit].on();
                    if (targetsHit) {
                      curSequence = new sequence(targetsHit, page, linkName, pos, triggerType);
                    }
                  }
                }
              } else {
                if (actionArr[hit].name == "Keypad") {
                  keypadEvent(pt.x - actionArr[hit].left, pt.y - actionArr[hit].top, actionArr[hit], page, "press");
                } else {
                  curSequence = new sequence(targetsHit, page, linkName, pos, triggerType);
                }
              }

            }
          }
        }
      }
    } else {
      if (page.objs.Keypad) {
        page.objs.Keypad.hover = false;
      }
      if (isHover) {
        drawCTX = false;
        drawingPoints = [];
      }
      if (mMode == 'line') {
        lineDeny(isHover);
      } else {
        hoverMouse(false); // here
      }
      if (isDrag) {
        dragEnd(isDrag);
      }
    }
    lastDragPos = false;
  } else {
    return "no page element selected";
  }

  // WHY??
  // Because pinned links are reset after sequences end but before actionCheck. Click, sequence.clear(), page.redraw() (pinned link reset), actionCheck means the link is not in the actual position.
  // SO NOW, instead of redrawing from the sequence, trip this var, and redraw AFTER mouse checks. Links can ONLY be interrupted with a click, so any sequence clears will automatically get this check.
  // Brilliant. Actually, a fucking mess, but who cares.
  // Same prob/solution for loadStates after a sequence clear.
  if (window.loadStateAfterActionCheck) {
    loadState(page.ident - 1);
    window.loadStateAfterActionCheck = false;
  }
  if (window.redrawAfterActionCheck) {
    page.redraw();
    window.redrawAfterActionCheck = false;
  }

  // MOVED START TO HERE. Why? Because there may be a pending reload and loadState. This makes sure that everything is done beforehand.
  if (curSequence && !isHover) {
    curSequence.start();
  }
}

function keypadEvent(x, y, keypad, page, eventType) {
  var leftOffset = 15;
  var topOffset = 19;
  var hit = false;
  var dimMod = keypad.dimMod;
  for (var n in keypad.keys) {
    var cur = keypad.keys[n];
    var left = cur.left * dimMod.width;
    var top = cur.top * dimMod.height;
    var height = cur.height * dimMod.height;
    var width = cur.width * dimMod.width;
    if (x > left && x < left + width &&
      y > top && y < top + height) {
      hit = cur;
    }
  }

  if (eventType == "hover") {
    if (hit) {
      if (page.objs.Keypad.hover.val !== hit.val) {
        page.objs.Keypad.hover = hit;
        page.redraw();
      }
    } else {
      if (page.objs.Keypad.hover) {
        page.objs.Keypad.hover = false;
        page.redraw();
      }
    }
  } else if (eventType == "press") {
    if (hit) {
      page.objs.Keypad.press = hit;
      var curVal = page.objs["Math A1"].contents;
      if (hit.val == "submit") { // Check sequences
        var n1 = parseFloat(page.objs["Math N1"].contents);
        var n2 = parseFloat(page.objs["Math N2"].contents);
        var o = page.objs["Math O1"].contents;
        if (n1 !== "" && n2 !== "" && o !== "") {
          // There must be a question;
          var answer = false;
          if (o == "+") {
            answer = n1 + n2;
          } else if (o == "-") {
            answer = n1 - n2;
          } else if (o == "*") {
            answer = n1 * n2;
          } else if (o == "/") {
            answer = n1 / n2;
          } else {
            console.log("What the hell kind of question is this?");
          }
          // ugh
          var mathRight, mathWrong;
          for (var m = 0; m < page.maths.length; m++) {
            if (page.maths[m].action.toLowerCase() == "math right") {
              mathRight = page.maths[m];
            } else if (page.maths[m].action.toLowerCase() == "math wrong") {
              mathWrong = page.maths[m];
            }
          }
          if (answer !== false && answer == parseFloat(curVal)) {
            if (mathRight) {
              curSequence = new sequence(mathRight.targets, page, "Page", [maxDim[0] / 2, maxDim[1] / 2], "math right");
            } else {
              console.log("answer right, but no events!");
            }
          } else {
            if (mathWrong) {
              curSequence = new sequence(mathWrong.targets, page, "Page", [maxDim[0] / 2, maxDim[1] / 2], "math wrong");
            } else {
              console.log("answer wrong, but no events!");
            }
          }
          if (curSequence) {
            curSequence.start();
          }
        } else {
          console.log("Haven't asked the question yet");
        }
      } else if (hit.val == "back") { // Delete last number
        if (curVal == "-0") {
          // One exception, if you have -0 and delete, you expect 0. Not sure why, but why is for boys
          page.objs["Math A1"].contents = "0";
        } else {
          page.objs["Math A1"].contents = curVal.substring(0, curVal.length - 1);
        }
      } else if (hit.val == "-") { // Toggle negative and positive
        if (curVal.substring(0, 1) == "-") {
          page.objs["Math A1"].contents = curVal.substring(1, curVal.length);
        } else {
          page.objs["Math A1"].contents = "-" + curVal;
        }
      } else if (hit.val == ".") { // Add decimal (if there isn't one already)
        if (curVal.split(".").length > 1) {
          // maybe flash? Can't have two decimals.
        } else {
          page.objs["Math A1"].contents += "" + hit.val
        }
      } else { // Add number to string, or replace if number is 0
        if (curVal == "0") {
          page.objs["Math A1"].contents = "" + hit.val;
        } else if (curVal == "-0") {
          page.objs["Math A1"].contents = "-" + hit.val;
        } else {
          page.objs["Math A1"].contents += "" + hit.val;
        }
      }
      // Values cannot be blank or negative nothing. This insures they will be at least 0 or -0
      if (page.objs["Math A1"].contents == "") {
        page.objs["Math A1"].contents = "0";
      } else if (page.objs["Math A1"].contents == "-") {
        page.objs["Math A1"].contents = "-0";
      }
      page.redraw();
    }
  }
}
function blinkInsertionPoint(force) {
  if (typeof force !== "undefined") {
    book.curField.insertionPointAlpha = (force == true) ? 0 : 1;
  }
  book.curField.insertionPointAlpha = (book.curField.insertionPointAlpha == 1 ? 0 : 1);
  book[curPage - 1].redraw();
}


/*
 */


window.setTimeout(function () {
}, 500);

function workspaceDraw(which, where) {
  var tool = book.drawingTools.cur;
  if (!book.drawingTools.lastPos) {
    book.drawingTools.lastPos = where;
    where.x += 1;
    where.y += 1;

    // Tool init setup
    var ctx = book[which.pageInBook].DRAW.getContext('2d');
    if (tool == "chalk") {
      ctx.fillStyle = "rgba(" + book.drawingTools.curColor + ",0.5)";
      ctx.strokeStyle = 'rgba(' + book.drawingTools.curColor + ',' + (0.4 + Math.random() * 0.2) + ')';
      ctx.lineWidth = book.drawingTools.chalk.diameter;
      ctx.lineCap = 'round';
    } else if (tool == "pencil") {
      ctx.lineWidth = 5;
      ctx.fillStyle = "rgba(" + book.drawingTools.curColor + ",1)";
      ctx.strokeStyle = "rgba(" + book.drawingTools.curColor + ",1)";
      ctx.lineCap = 'round';
    }
  }
  if (tool == "chalk") {
    drawChalk(where.x, where.y, which.pageInBook);
  } else if (tool == "pencil") {
    drawPencil(where.x, where.y, which.pageInBook);
  } else if (tool == "eraser") {
    erase(where.x, where.y, which.pageInBook);
  }
}
function erase(x, y, page) {
  var eraserDims = [50, 40];
  var ctx = book[page].DRAW.getContext('2d');
  // This was supposed to take into account all the missed mouse move events on a fast swipe... but it never really worked.
  /*
   var startX = book.drawingTools.lastPos.x;
   var startY = book.drawingTools.lastPos.y;
   var endX = x - 0.5;
   var endY = y - 0.5;
   var rect = []; // [left, top, width, height] // I know, but it's what clearRect uses.
   if (endX > startX) {
   rect[0] = startX;
   rect[2] = Math.max((endX - startX) + eraserDims[1], eraserDims[1]);
   } else {
   rect[0] = endX;
   rect[2] = Math.max((startX - endX) + eraserDims[1], eraserDims[1]);
   }
   if (endY > startY) {
   rect[1] = startY;
   rect[3] = Math.max((endY - startY) + eraserDims[0], eraserDims[0]);
   } else {
   rect[1] = endY;
   rect[3] = Math.max((startY - endY) + eraserDims[0], eraserDims[0]);
   }
   console.log(rect);
   var path = [];
   var xRepsMissed = Math.ceil(rect[2] / eraserDims[1]);
   var yRepsMissed = Math.ceil(rect[3] / eraserDims[0]);
   var repCount = Math.max(xRepsMissed, yRepsMissed);
   var xInt = (rect[2] - rect[0]) / repCount;
   var yInt = (rect[3] - rect[1]) / repCount;
   for (var r = 0; r < repCount; r++) {
   path.push()
   }
   ctx.clearRect(rect[0], rect[1], rect[2], rect[3]);
   */
  ctx.clearRect(x + 5, y - 2, eraserDims[1] + 5, eraserDims[0] + 2);
  book[page].redraw();
}
function drawChalk(x, y, page) {
  var brushDiameter = book.drawingTools.chalk.diameter;
  var last = book.drawingTools.lastPos;
  var ctx = book[page].DRAW.getContext('2d');
  ctx.strokeStyle = 'rgba(' + book.drawingTools.curColor + ',' + (0.4 + Math.random() * 0.2) + ')';
  ctx.beginPath();
  ctx.moveTo(last.x, last.y);
  ctx.lineTo(x, y);
  ctx.stroke();

  // Chalk Effect
  var length = Math.round(Math.sqrt(Math.pow(x - last.x, 2) + Math.pow(y - last.y, 2)) / (5 / brushDiameter));
  var xUnit = (x - last.x) / length;
  var yUnit = (y - last.y) / length;
  for (var i = 0; i < length; i++) {
    var xCurrent = last.x + (i * xUnit);
    var yCurrent = last.y + (i * yUnit);
    var xRandom = xCurrent + (Math.random() - 0.5) * brushDiameter * 1.2;
    var yRandom = yCurrent + (Math.random() - 0.5) * brushDiameter * 1.2;
    ctx.clearRect(xRandom, yRandom, Math.random() * 2 + 2, Math.random() + 1);
  }
  book.drawingTools.lastPos = {x: x, y: y};
  book[page].redraw();
};
function drawPencil(x, y, page) {
  var brushDiameter = book.drawingTools.chalk.diameter;
  var last = book.drawingTools.lastPos;
  var ctx = book[page].DRAW.getContext('2d');
  ctx.strokeStyle = "rgba(" + book.drawingTools.curColor + ",1)";
  ctx.beginPath();
  ctx.moveTo(last.x, last.y);
  ctx.lineTo(x, y);
  ctx.stroke();
  book.drawingTools.lastPos = {x: x, y: y};
  book[page].redraw();
}

function checkOpenPageLinks() {
  var tPage = Math.max(curPage - 2, 0);
  if (pDisplay == 'BlockSpread' || pDisplay == 'Single') {
    tPage = curPage - 1;
  } else if (isEven(bookLength) && curPage == bookLength) {
    tPage++;
  }
  var noneHit = true;
  while (tPage < curPage && book[tPage] && noneHit) {
    for (var i = 0; i < book[tPage].pageOpens.length; i++) {
      if (noneHit) {
        var linkHit = book[tPage].pageOpens[i];
        if (linkHit.action == "Open Page First Time" || linkHit.action == "Open Page") {
          noneHit = false;
          if (linkHit.targets) {
            curSequence = new sequence(linkHit.targets, book[tPage], linkHit.name, [maxDim[0] / 2, maxDim[1] / 2], "openPage");
            curSequence.start();
          } else {
            book.bugs.log("Open page link has no targets.");
          }
          if (linkHit.action == "Open Page First Time") {
            book[tPage].pageOpens.splice(i, i + 1);
          }
        }
      }
    }
    tPage++;
  }
}
function checkLogicLinks() {
  var matchedArr = [];
  for (var l = 0; l < book[curPage - 1].logics.length; l++) {
    var cur = book[curPage - 1].logics[l];
    if (cur.action.indexOf(' = ') !== -1) {
      var action = cur.action.replace(" = ", "=");
      var p = action.split("=")[0].toString().toLowerCase();
      var q = action.split("=")[1];
      if (p == "page points") {
        q = Number(q);
        if (book[curPage - 1].points == q) {
          matchedArr.push(l);
        }
      } else {
        book.bugs.log("Unknown check of <b>" + action.split("=")[0].toString() + "</b>. For the time, only Page Points are supported");
      }
    } else {
      book.bugs.log("Unknown conditional of <b>" + action.split("=")[0] + "</b>. For the time, only '=' is supported");
    }
  }
  if (matchedArr.length > 1) {
    book.bugs.log("Number of conditions met are more than one. We haven't talked about this yet");
  } else if (matchedArr.length > 0) {
    var ref = book[curPage - 1].logics[matchedArr[0]];
    if (curSequence && curSequence.isRunning) {
      curSequence.end();
    }
    curSequence = new sequence(ref.targets, book[curPage - 1], "logic", [maxDim[0] / 2, maxDim[1] / 2], "logic");
    curSequence.start(true);
  }
}
function drawLine(page, pos) {
  var x = pos[0];
  var y = pos[1];
  var pageOffsets = $(page.DIV).offset();
  x -= pageOffsets.left;
  y -= pageOffsets.top;
  y += vertCenteredOffset;
  if (onASingle()) {
    x += pUnit / 2; // why? why /2??
  }
  x *= resMult;
  y *= resMult;

  page.redraw();
  lineCTX.beginPath();
  lineCTX.moveTo(lineStartPos[0], lineStartPos[1]);
  lineCTX.lineTo(x, y);
  lineCTX.stroke();
}
function onASingle() {
  if ((pDisplay == "BlockSpread") && (curPage == 1 || (curPage == bookLength && !book.lastPageDouble))) {
    return true;
  } else {
    return false;
  }
}
function lineAccept(pageElem, start, finish, name) {
  var curLine = pageElem.linesOnPage;
  var lineObj = {};
  lineObj.start = start;
  lineObj.finish = finish;
  if (!curLine[name] || !curLine[name].length) {
    curLine[name] = [];
  }
  curLine[name].push(lineObj)
}
function lineDeny(isHover) {
  if (isHover) {
    hoverMouse('crosshair');
  } else {
    lastLinePage.redraw();
    lastLinePage = false;
    mMode = 'nav';
    lineFrom = false;
    lineStartPos = [];
    lineCTX = false;
    drawingPoints = [];
    hoverMouse(false);
  }
}
function addResMult(pos) {
  var returnPos = [];
  returnPos[0] = pos[0] * resMult;
  returnPos[1] = pos[1] * resMult;
  return returnPos;
}
function dragCheck(page, mX, mY, create) {
  var tmpReturn = false;
  if (page) {
    var pos = addResMult(offsetCalc(page, mX, mY));
    var objectDragging = false;
    // if this isn't the first page and (isn't the last page with an odd number of pages) or if it is (the relative mouse location is within the boundries of the page)
    function clickInRect(obj, pos) {
      // top, left, bottom, right
      var rect = [];
      rect.push(obj.top);
      rect.push(obj.left);
      rect.push((obj.top + obj.height));
      rect.push((obj.left + obj.width));
      if (pos[1] > rect[0] && pos[1] < rect[2] && pos[0] > rect[1] && pos[0] < rect[3]) {
        return true;
      } else {
        return false;
      }
    }

    var rectInArr = [];
    for (var i = 0; i < page.objKey.length; i++) {
      var tmpObj = page.objs[page.objKey[i]];
      if (clickInRect(tmpObj, pos) && tmpObj.vis == 'show' && tmpObj.mobility && !tmpObj.animating) {
        rectInArr.push([tmpObj.page, tmpObj.layer, tmpObj.name, i]);
      }
    }
    // sort by layer
    rectInArr.sort(function (a, b) {
      return b[1] - a[1];
    });
    // remember what's visible and what's not
    var resetVisArr = [];
    for (obj in page.objKey) {
      resetVisArr.push(page.objs[page.objKey[obj]].vis);
    }
    function hideAll() {
      for (obj in page.objKey) {
        page.objs[page.objKey[obj]].vis = 'hide';
      }
    }

    if (dragDropRect) {
      objectDragging = rectInArr[0] || false;
    } else {
      // turn on each pageent at a time.
      for (var i = 0; i < rectInArr.length; i++) {
        hideAll();
        page.objs[rectInArr[i][2]].vis = "show";
        page.redraw();
        var ctx = page.CAN.getContext('2d');
        var imgData = ctx.getImageData(pos[0], pos[1], 1, 1);
        if (imgData.data[3] == 255) {
          objectDragging = rectInArr[i];
          i = rectInArr.length;
        }
      }
      // Set all visible back to normal
      for (var i = 0; i < resetVisArr.length; i++) {
        page.objs[page.objKey[i]].vis = resetVisArr[i];
      }
      // Draw it on canvas
      page.redraw();
    }
    // lets see if we caught anything
    if (objectDragging) {
      tmpReturn = true;
      // CREATE CLONE or START DRAG only if peram is passed, i.e., click not hover
      if (create) {
        var dragObj = page.objs[objectDragging[2]];
        dragObj.dragging = true;
        var dragOffset = ["", ""];
        dragOffset[1] = dragObj.top - pos[1] + (dragObj.height / 2);
        dragOffset[0] = dragObj.left - pos[0] + (dragObj.width / 2);
        var objName = dragObj.name;
        if (mMode == "nav" && dragObj.mobility == "clone" && dragObj.cloneID == undefined) {
          page.activeClones++;
          var cloneNum = page.activeClones;
          var tmpObj = {};
          for (prop in dragObj) {
            tmpObj[prop] = dragObj[prop];
          }
          var cloneName = objectDragging[2] + "_clone_" + cloneNum;
          objName = cloneName;
          page.objs[cloneName] = {};
          page.objs[cloneName] = tmpObj;
          page.objs[cloneName].cloneID = cloneNum;
          page.objs[cloneName].name = cloneName;
          page.objs[cloneName].mobility = "static";
          page.objs[cloneName].layer = dragObj.layer + 1 + page.activeClones;
          dragObj = page.objs[cloneName];
          page.objKey.splice(objectDragging[3], 0, cloneName);
        }
        page.objs[objName].dropped = function () {
          dragObj.dragging = false;
          curDrag = false;
          lastDragPage = false;
          mMode = 'nav';
          var objSelf = this;
          this.animating = true;
          var targTop = this.initTop;
          var targLeft = this.initLeft;
          var curTop = lastDragPos[0];
          var curLeft = lastDragPos[1];
          // interval repeat time;
          var animSpeed = 10;
          var animTopDif = curTop - targTop;
          var animLeftDif = curLeft - targLeft;
          // Time for animation to complete - interval time
          var animLegCount = 20;
          var animAt = 0;
          if (curTop && curLeft) {
            objSelf.dragAnim = window.setInterval(function () {
              if (animAt < animLegCount) {
                animAt++;
                var percentDone = Math.abs((animAt / animLegCount) - 1);
                objSelf.top = targTop + percentDone * animTopDif;
                objSelf.left = targLeft + percentDone * animLeftDif;
                page.redraw();
                hoverMouse(false);
              } else {
                window.clearInterval(objSelf.dragAnim);
                if (page.cloneID) {
                  // this is not working dont know why
                  delete page.objs[objSelf.name];
                  for (key in page.objKey) {
                    if (page.objKey[key] == objSelf.name) {
                      page.objKey.splice(key, 1);
                    }
                  }
                } else {
                  objSelf.animating = false;
                }
              }
            }, animSpeed);
          }
        };
        if (page.objs[objName].dragAnim) {
          window.clearInterval(page.objs[objName].dragAnim);
        }
        curDrag = [dragObj, pos, dragOffset];
        lastDragPage = page;
      }
    } else {
      curDrag = false;
    }
  } else {
    // console.log("Click not on page");
  }
  return tmpReturn;
}
function dragObj(obj, startPos, curPos, page, offset) {
  curPos = addResMult(curPos);
  obj.top = (curPos[1] - obj.height / 2) + offset[1];
  obj.left = (curPos[0] - obj.width / 2) + offset[0];
  lastDragPos = [obj.top, obj.left];
  hoverMouse("grabbing");
  page.redraw();
}
function dragEnd() {
  if (curDrag[0].initTop == curDrag[0].top && curDrag[0].initLeft == curDrag[0].left) {
  } else {
    curDrag[0].dropped();
    lastDragPos = false;
  }
}
function leaveFnc() {
  hoverMouse(false);
  if (book.drawingTools.cur) {
    mMode = 'nav';
  } else {
    if (mMode == 'down') {
      if (!pageAnimInt && book[curPage - 1].pageNavigationEnabled) {
        uDragStop();
      }
      if (curDrag) {
        dragEnd();
      }
      mMode = 'nav';
    } else if (mMode == 'line') {
      if (pDisplay == 'Single') {
      } else if (pDisplay == 'SingleSpread') {
        if (book[curPage]) {
          book[curPage].redraw();
        }
      } else if (pDisplay == 'BlockSpread') {
      }
      lineDeny();
    }
  }
  if (book[curPage - 1].objs.Keypad) {
    book[curPage - 1].objs.Keypad.hover = false;
    book[curPage - 1].redraw();
  }
}
function offsetCalc(page, mX, mY) {
  if (page) {
    var blueLeftOffset = ((window.innerWidth - parseInt(main.style.width)) / 2);
    if (blueLeftOffset < 0) {
      blueLeftOffset = 0
    }
    var pageLeftOffset = (bookMarginLeft + parseInt(page.DIV.style.left));
    if ((pDisplay == "BlockSpread") && (curPage == 1 || (curPage == bookLength && !book.lastPageDouble))) {
      pageLeftOffset -= pUnit / 2; // Ray's measuring click links from the left of the margin, NOT the left of the visible page.
    }
    var jQuerryOffsetSub = blueLeftOffset + pageLeftOffset;

    // extra 10 for black border offset
    returnX = mX - jQuerryOffsetSub - 10;
    //returnX = mX - parseInt($(page.DIV).offset().left);
    //returnY = mY - parseInt($(page.DIV).offset().top);
    //

    returnY = mY - 38;

    return [returnX, returnY];
  } else {
    return false;
  }
}
function mxVelPop(mX) {
  mxVel.unshift(mX);
  mxVel.pop();
  /*
   mxVelOverride = false;
   window.clearTimeout(mxVelOverrideTimeout);
   mxVelOverrideTimeout = window.setTimeout(function(){mxVelOverride = true;},100);
   */
}
function mxVelCalc() {
  var dif = 0;
  for (i = 1; i < mxVel.length; i++) {
    if (typeof (mxVel[i]) == "number" && typeof (mxVel[i - 1]) == "number") {
      dif += mxVel[i] - mxVel[i - 1];
    }
  }
  return dif;
}
function toBookPercent(event) {
  var returnX = false;
  if (event) {
    if (isPad) {
      returnX = event.touches[0][mxStr];
    } else {
      returnX = event[mxStr];
    }
  } else {
    returnX = mxVel[0];
  }
  returnX -= bookOffsets.left;
  returnX = Math.round(100 * (returnX / pUnit / 2)) / 100;
  if (pDisplay == 'Single') {
    returnX *= 2;
  }
  return returnX;
}
function uDrag(curX) {
  if (pageDir) {
    if ((pageDir == "left" && book[curPage].pageNavigationEnabled) || (pageDir == "right" && book[curPage - 2].pageNavigationEnabled)) {
      if (pDisplay == 'Single') {
        turnSingle(pageDir, curX);
      } else if (pDisplay == 'SingleSpread') {
        turnSingleSpread(pageDir, curX);
      } else if (pDisplay == 'BlockSpread') {
        turnBlockSpread(pageDir, curX);
      }
    }
  } else {
    if (origX > 0.5) {
      if (curX + 0.05 < origX && curPage <= (bookLength - 1)) {
        // avoid starting jolt
        startX -= 0.05;
        hoverMouse(false);
        if (pDisplay == 'Single') {
          turnSingle("left", curX);
        } else if (pDisplay == 'SingleSpread') {
          turnSingleSpread("left", curX);
        } else if (pDisplay == 'BlockSpread') {
          turnBlockSpread("left", curX);
        }
        pageDir = "left";
      }
    } else {
      if (curX - 0.05 > origX && curPage > 1) {
        startX += 0.05;
        hoverMouse(false);
        if (pDisplay == 'Single') {
          turnSingle("right", curX);
        } else if (pDisplay == 'SingleSpread') {
          turnSingleSpread("right", curX);
        } else if (pDisplay == 'BlockSpread') {
          turnBlockSpread("right", curX);
        }
        pageDir = "right";
      }
    }
  }
}
function uDragStop() {
  mMode = 'nav';
  lastX = toBookPercent();
  if (!pageAnimInt) {
    var vel = mxVelCalc();
    var turnVelocityThreshold = 50;
    /* dealing mostly with location of last drag, not direction of drag
     if (origX > 0.5) {
     // started from right
     if (lastX < 0.5 || vel > turnVelocityThreshold) {
     // IF there is a page to animate to.
     if (curPage < bookLength) {
     // ..turn left 90%, fast swipe right ending at 51% is a turn left, end RIGHT
     setPageAnimInt(lastX,"right","left");
     }	else if (!isEven(bookLength) && curPage == bookLength) {
     setPageAnimInt(lastX,"right","right",4);
     }
     }	else	{
     setPageAnimInt(lastX,"right","right");
     }
     }	else	{
     // started from left
     if (lastX > 0.5 ||  vel > turnVelocityThreshold) {
     // ended right
     if (curPage > 2) {
     setPageAnimInt(lastX,"left","right");
     }
     }	else	{
     // ended left
     setPageAnimInt(lastX,"left","left");
     }
     }
     */
    if (origX > 0.5) {
      // started from right
      if (book[curPage] && book[curPage].pageNavigationEnabled) {
        if (vel > 0) {
          // ended left
          if (curPage < bookLength) {
            setPageAnimInt(lastX, "right", "left");
          } else if (!isEven(bookLength) && curPage == bookLength) {
            setPageAnimInt(lastX, "right", "right", 4);
          }
        } else {
          // ended right
          setPageAnimInt(lastX, "right", "right");
        }
      }

    } else {
      if (book[curPage - 2] && book[curPage - 2].pageNavigationEnabled) {
        // started from left
        if (vel > 0) {
          // ended left
          setPageAnimInt(lastX, "left", "left");
        } else {
          // ended right
          setPageAnimInt(lastX, "left", "right");
        }
      }
    }
  }
}
function isEven(n) {
  return (n % 2 == 0);
}
function setPageAnimInt(lastX, start, end, speedNumMult) {
  if (!curDrag) {
    function clearAnim(pageManip) {

      window.clearInterval(pageAnimInt);
      if (pDisplay == 'SingleSpread') {
        pageManip *= 2
      }
      pageAnimInt = false;
      pageAnimAt = false;
      pageDir = false;
      if (book[curPage - 1].resetWhenLeaving) {
        book[curPage - 1].reload();
      }
      curPage += pageManip;
      if (curSequence) {
        curSequence.end();
      }
      var end = bookLength - 1;
      var i = 0;
      if (curPage == 1) {
        i = 2;
      } else if (curPage > bookLength) {
        end--;
      }
      while (i < end) {
        if (book[i].change) {
          book[i].change = false;
          book[i].redraw();
        }
        i++;
      }
      var page = Math.max(curPage - 5, 0);
      var endPage = Math.min(curPage + 5, bookLength);
      if (pDisplay != 'Single') {
        while (page < endPage) {
          if (page !== curPage - 1 && page !== curPage - 2) {
            $(book[page].DIV).css({"z-index": 1, "width": 0});
          }
          page++;
        }
      }
      if (pageManip != 0) {
        newBuffer();
        arrangePages();
        checkOpenPageLinks();
        if (pDisplay == 'Single' || pDisplay == 'BlockSpread') {
          gotoAct.selectedIndex = curPage - 1;
        } else if (pDisplay == 'SingleSpread') {
          gotoAct.selectedIndex = Math.ceil(curPage / 2) - 1;
        }
        setGotoCover();
      }
      mDown = false;
      mMode = 'nav';
      arrangePages();
    }

    var speedNum = 25;
    if (speedNumMult) {
      speedNum /= speedNumMult
    }
    var curRevert, curPageManip, pageAnimTarg;
    pageAnimAt = parseInt(lastX * speedNum);
    if (start == "right" && curPage < bookLength + 1) {
      if (end == "left") {
        pageAnimTarg = 0;
        pageAnimInt = window.setInterval(function () {
          if (pageAnimAt > pageAnimTarg) {
            pageAnimAt--;
            if (pDisplay == 'Single') {
              turnSingle("left", pageAnimAt / speedNum);
            } else if (pDisplay == 'SingleSpread') {
              turnSingleSpread("left", pageAnimAt / speedNum);
            } else if (pDisplay == 'BlockSpread') {
              turnBlockSpread('left', pageAnimAt / speedNum);
            }
          } else {
            clearAnim(1);
          }
        }, 15);
      } else if (end == "right") {
        pageAnimTarg = speedNum;
        pageAnimInt = window.setInterval(function () {
          if (pageAnimAt < pageAnimTarg) {
            pageAnimAt++;
            if (pDisplay == 'Single') {
              turnSingle("left", pageAnimAt / speedNum);
            } else if (pDisplay == 'SingleSpread') {
              turnSingleSpread("left", pageAnimAt / speedNum);
            } else if (pDisplay == 'BlockSpread') {
              turnBlockSpread('left', pageAnimAt / speedNum);
            }
          } else {
            clearAnim(0);
          }
        }, 15);
      }
    } else if (start == "left" && curPage > 1) {
      if (end == "left") {
        pageAnimTarg = 0;
        pageAnimInt = window.setInterval(function () {
          if (pageAnimAt > pageAnimTarg) {
            pageAnimAt--;
            if (pDisplay == 'Single') {
              turnSingle("right", pageAnimAt / speedNum);
            } else if (pDisplay == 'SingleSpread') {
              turnSingleSpread("right", pageAnimAt / speedNum);
            } else if (pDisplay == 'BlockSpread') {
              turnBlockSpread('right', pageAnimAt / speedNum);
            }
          } else {
            clearAnim(0);
          }
        }, 15);
      } else if (end == "right") {
        pageAnimTarg = speedNum;
        pageAnimInt = window.setInterval(function () {
          if (pageAnimAt < pageAnimTarg) {
            pageAnimAt++;
            if (pDisplay == 'Single') {
              turnSingle("right", pageAnimAt / speedNum);
            } else if (pDisplay == 'SingleSpread') {
              turnSingleSpread("right", pageAnimAt / speedNum);
            } else if (pDisplay == 'BlockSpread') {
              turnBlockSpread('right', pageAnimAt / speedNum);
            }
          } else {
            clearAnim(-1);
          }
        }, 15);
      }
    }
  }
}
function turnSingle(direction, percent) {
  if (direction == "left") {
    pageSelectMod = 0;
    percent /= startX;
  } else if (direction == "right") {
    pageSelectMod = -1;
    if (percent < 1) {
      percent -= startX;
      percent *= (1 + startX);
    }
  }
  if (percent > 1) {
    percent = 1;
  } else if (percent < 0) {
    percent = 0;
  }


  var pUnitPlus = pUnit + 10;
  $(book[curPage - 1 + pageSelectMod].DIV).css({"left": (pUnitPlus * percent) - pUnitPlus});
  $(book[curPage + pageSelectMod].DIV).css({"left": ((pUnitPlus * percent) - pUnitPlus) + pUnitPlus});
}
function turnSingleSpread(direction, percent) {
  // set percent relative to start of click, NOT position on page.
  var tmpLeft = [];
  var tmpWidth = [];
  var tmpIndex = [];
  var pageSelectMod;
  if (direction == "left") {
    pageSelectMod = -1;
    percent /= startX;
  } else if (direction == "right") {
    pageSelectMod = -3;
    if (percent < 1) {
      percent -= startX;
      percent *= (1 + startX);
    }
  }
  if (percent > 1) {
    percent = 1;
  } else if (percent < 0) {
    percent = 0;
  }
  if ((direction == "left" && curPage == 1) || (direction == "right" && curPage == 3)) {
    // first page turnning left OR last page turnning right
    tmpLeft[0] = ((1 - percent) * pUnit * 2) + (pUnit / 2);
    if (tmpLeft[0] > pUnit) {
      tmpLeft[0] = pUnit
    }
    tmpLeft[2] = tmpLeft[0];
    tmpIndex[0] = 4;
    tmpIndex[1] = 3;
    tmpIndex[2] = 2;
    tmpWidth[0] = maxDim[1];
    tmpWidth[2] = maxDim[1];
    if (percent > 0.75) {
      tmpLeft[1] = tmpLeft[0];
      tmpWidth[1] = 0;
    } else {
      var stretch = percent * 1.33;
      tmpLeft[1] = stretch * pUnit * 2;
      tmpWidth[0] = (stretch - 0.5) * 2 * pUnit;
      tmpWidth[1] = (1 - stretch) * pUnit;
    }
    for (i = 0; i < 3; i++) {
      $(book[i].DIV).css({"width": parseInt(tmpWidth[i]), "left": tmpLeft[i], "z-index": tmpIndex[i]});
    }
  } else if ((direction == "left" && curPage + 1 < bookLength) || (direction == "right" && curPage <= bookLength)) {
    // ANY other normal page turn.
    tmpLeft[-1] = 0;
    tmpLeft[0] = pUnit;
    tmpLeft[1] = (2 * pUnit) * percent;
    tmpLeft[2] = pUnit;
    tmpIndex[-1] = 2;
    tmpIndex[0] = 4;
    tmpIndex[1] = 5;
    tmpIndex[2] = 3;
    tmpWidth[-1] = pUnit;
    tmpWidth[0] = pUnit * percent;
    tmpWidth[1] = (1 - percent) * pUnit;
    tmpWidth[2] = pUnit;
    for (i = -1; i < 3; i++) {
      var tmpPage = curPage + i + pageSelectMod;
      $(book[tmpPage].DIV).css({"width": tmpWidth[i], "left": tmpLeft[i], "z-index": tmpIndex[i]});
    }
  } else if ((direction == "left" && curPage + 1 == bookLength) || (direction == "right" && curPage == bookLength + 1)) {
    // LAST page turn anim-wrapper book center
    var stretch = (percent * 1.33) - 0.33;
    tmpLeft[-1] = 0;
    tmpLeft[0] = pUnit;
    tmpIndex[-1] = 2;
    tmpIndex[0] = 3;
    tmpIndex[1] = 4;
    tmpWidth[-1] = pUnit;
    if (percent > 0.25) {
      // first three quarteres should close the book
      tmpLeft[1] = (2 * pUnit) * stretch;
      tmpWidth[0] = pUnit * stretch;
      tmpWidth[1] = (1 - stretch) * pUnit;
    } else {
      // last quarter should shift right
      stretch = (4 * ((1 - percent) - 0.75));
      tmpLeft[1] = stretch * pUnit / 2;
      tmpWidth[-1] = 0;
      tmpWidth[0] = 0;
      tmpWidth[1] = pUnit;
    }
    for (i = -1; i < 2; i++) {
      var tmpPage = curPage + i + pageSelectMod;
      $(book[tmpPage].DIV).css({"width": tmpWidth[i], "left": tmpLeft[i], "z-index": tmpIndex[i]});
    }
  } else if (direction == "left" && !isEven(bookLength) && curPage == bookLength) {
    // odd number of pages in book, last page is a double, communicate that it is the last page
    tmpLeft[0] = 0;
    // Will pull the page 1/8th the way left before snapping back.
    // add left offset on book[1].DIV CHILD CANVAS!!!
    var snapInt = (pUnit * (percent - 1) / -8);
    tmpLeft[1] = pUnit - snapInt;
    tmpIndex[0] = 2;
    tmpIndex[1] = 3;
    tmpWidth[0] = pUnit;
    tmpWidth[1] = pUnit;
    for (i = 0; i < 2; i++) {
      var tmpPage = bookLength - 2 + i;
      $(book[tmpPage].DIV).css({"width": tmpWidth[i], "left": tmpLeft[i], "z-index": tmpIndex[i]});
    }
  }
}
function turnBlockSpread(direction, percent) {
  // change to [first page modified , last page modified] inside conditional, loop through at end.
  pageSelectMod = 0;
  if (direction == 'left') {
    percent /= startX;
  } else if (direction == "right") {
    pageSelectMod = -1;
    if (percent < 1) {
      percent -= startX;
      percent *= (1 + startX);
    }
  }
  if (percent > 1) {
    percent = 1;
  } else if (percent < 0) {
    percent = 0;
  }
  if ((direction == 'left' && curPage == 1) || (direction == 'right' && curPage == 2)) {
    // first page turn
    var frontCover = book[0].DIV;
    var spreadLeft = book[1].DIV;
    var spreadRight = book[1].DUP;

    if (percent > 0.75) {
      var stretch = (percent - 0.75) * 4;
      var invert = Math.abs(stretch - 1);
      $(frontCover).css({
        'width': pUnit - (coverWhiteLineRoundingStrength * 2), // "White line" problem fix
        'left': pUnit / 2 + ((pUnit / 2) * invert),
        'z-index': 1,
      });
      $(spreadRight).css({
        'display': 'none'
      });
      $(spreadLeft).css({
        'display': 'none'
      });
    } else {
      var stretch = percent * 1.33;
      var invert = Math.abs(stretch - 1);
      var doubleTime = (stretch * 2) - 1;
      $(frontCover).css({
        'width': Math.min(pUnit * doubleTime, (pUnit) - (coverWhiteLineRoundingStrength * 2)), // "White line" problem fix
        'left': pUnit,
        'z-index': 3,
      });
      $(spreadLeft).css({
        'width': pUnit * invert,
        'left': pUnit * 2 * stretch,
        'z-index': 2,
        'display': 'block'
      });
      $(spreadRight).css({
        'width': pUnit,
        'left': pUnit,
        'z-index': 1,
        'display': 'block'
      });
    }
  } else if ((direction == "left" && (curPage + 1 < bookLength || book.lastPageDouble)) || (direction == "right" && (curPage < bookLength || book.lastPageDouble))) {
    // normal page turn
    var invert = Math.abs(percent - 1); // 0-1
    var currentPage = book[curPage - 1 + pageSelectMod].DIV;
    var nextPageLeft = book[curPage + pageSelectMod].DIV;
    var nextPageRight = book[curPage + pageSelectMod].DUP;
    $(currentPage).css({
      'width': pUnit * 2 * percent,
      'left': 0,
      'z-index': 2,
    });
    $(nextPageLeft).css({
      'width': pUnit * invert,
      'left': pUnit * 2 * percent,
      'z-index': 3,
    });
    $(nextPageRight).css({
      'width': pUnit,
      'left': pUnit,
      'z-index': 1,
      'display': 'block'
    });
  } else if ((direction == "left" && curPage + 1 == bookLength) || (direction == "right" && curPage == bookLength)) {
    // last page turn
    var backCover = book[curPage + pageSelectMod].DIV;
    var secondToLast = book[curPage - 1 + pageSelectMod].DIV;
    if (percent > 0.25) {
      var stretch = (percent - 0.25) * 1.33;
      var invert = Math.abs(stretch - 1);
      $(backCover).css({
        'width': (pUnit * invert) - (coverWhiteLineRoundingStrength * 2), // "White line" problem fix
        'left': pUnit * 2 * stretch,
        'z-index': 2,
      });
      $(secondToLast).css({
        'width': pUnit * 2 * stretch,
        'left': 0,
        'z-index': 3,
        'display': 'block'
      });
    } else {
      var stretch = percent * 4;
      var invert = Math.abs(stretch - 1);
      $(backCover).css({
        'width': (pUnit) - (coverWhiteLineRoundingStrength * 2), // "White line" problem fix
        'left': pUnit / 2 * invert,
        'z-index': 2,
      });
      $(secondToLast).css({
        'display': 'none'
      });
    }
  }
}
function pointInPoly(poly, pt) {
  for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
    ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
    && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
    && (c = !c);
  return c;
}
function hoverMouse(type) {
  if (!isPad) {
    var tmpStyle = "";
    if (type) {
      tmpStyle = type;
      if (isChrome) {
        if (type == "grab") {
          tmpStyle = "-webkit-grab";
        } else if (type == "grabbing") {
          tmpStyle = "-webkit-grabbing";
        }
      }
    } else {
      tmpStyle = "auto";
    }
    if (type == "hand" && isFirefox) {
      tmpStyle = "pointer";
    } else if (type == "drawingTool") {
      tmpStyle = "url('" + dependenciesLoc + "presets/icons/" + book.drawingTools.cur + "-cursor.png'), auto";
    } else if (type == false) {
    }
    $("body").css("cursor", tmpStyle);
  }
}
function newBuffer() {
  for (buf in bufObjArr) {
    if (bufObjArr[buf].running) {
      bufObjArr[buf].clear = true;
      bufObjArr[buf].path = buf;
    } else {
      bufObjArr.splice(buf, 1);
    }
  }
  bufObjArr.push(new buffer());
}
function setGotoCover() {
  var cover = document.getElementById('gotoCover');
  if (pDisplay == 'Single') {
    var onlyPageStr = pageNumberingStr[curPage - 1] || curPage;
    if (onlyPageStr == 'undefined') {
      onlyPageStr = curPage;
    }
    cover.innerHTML = onlyPageStr;
  } else if (pDisplay == 'SingleSpread') {
    var leftPage = pageNumberingStr[curPage - 2] || curPage - 1;
    var rightPage = pageNumberingStr[curPage - 1] || curPage;
    if (curPage == 1) {
      cover.innerHTML = rightPage;
    } else if (curPage == bookLength && isEven(bookLength)) {
      cover.innerHTML = rightPage;
    } else if (curPage > bookLength) {
      cover.innerHTML = leftPage;
    } else {
      cover.innerHTML = leftPage + ' - ' + rightPage;
    }
  } else if (pDisplay == 'BlockSpread') {
    var inner = false;
    if (pageNumberingStr && pageNumberingStr[curPage - 1]) {
      inner = pageNumberingStr[curPage - 1];
    } else {
      var rightPageVis = (curPage * 2) - 1;
      var leftPageVis = rightPageVis - 1;
      if (curPage == 1) {
        inner = rightPageVis;
      } else if (curPage >= book.length) {
        inner = leftPageVis;
      } else {
        inner = leftPageVis + ' - ' + rightPageVis;
      }
    }
    cover.innerHTML = inner;
  }
}
function gotoChange(page, ident) {
  var gotoPage;
  if (page) {
    gotoPage = parseFloat((page.childNodes[page.selectedIndex].value));
  } else if (ident) {
    gotoPage = ident;
  }
  if (isEven(gotoPage) && gotoPage < bookLength && pDisplay == 'SingleSpread') {
    gotoPage++;
  }
  if (curSequence) {
    curSequence.clear(true);
  }
  curPage = gotoPage;
  newBuffer();
  arrangePages();
  setGotoCover();
  checkOpenPageLinks();
}
function hideNav() {
  book.noNav = true;
  $("#navC").css("display", "none");
}
function showNav() {
  book.noNav = false;
  $("#navC").css("display", "block");
}

function vertCenterBook() {
  var workHeight = window.innerHeight;
  var middle = $('#screen-middle').offset().top;
  var workHeight = (middle * 2) - deviceTopBar;
  if (isPad && !isAndroid) {
    if (window.orientation == 90 || window.orientation == -90) {
      //workHeight = (screenWidth - deviceTopBar) / viewportScale;
    } else if (window.orientation != undefined) {
      //workHeight = (screenHeight - deviceTopBar) / viewportScale;
    } else {
      //workHeight = 0;
    }
  }
  if (workHeight > bookHeight) {
    var overflow = workHeight - bookHeight;
    overflow /= 2;
    $("#main").css("margin-top", overflow);
    vertCenteredOffset = overflow;
  }
}


// quick shits
//

function splitAndInt(str, del) {
  var strArr = str.split(del);
  var numArr = [];
  for (var i = 0; i < strArr.length; i++) {
    numArr.push(parseInt(strArr[i]));
  }
  return numArr;
}
function splitAndFloat(str, del) {
  var strArr = str.split(del);
  var numArr = [];
  for (var i = 0; i < strArr.length; i++) {
    numArr.push(parseFloat(strArr[i]));
  }
  return numArr;
}

