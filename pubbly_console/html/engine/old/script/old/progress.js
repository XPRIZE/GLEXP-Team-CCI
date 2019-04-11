function loader(placement) {
    var THIS = this;
    this.loadTimes = [];
    this.averageLoadTime = 0;
    this.done = 0;
    this.steps = false;
    this.contID = placement;
    var ratio = 131.438 / 800;

    var workWidth = Math.min(maxDim[1] * 0.8, 1200);
    var letterWidth = workWidth / 6;
    this.canDim = [(workWidth * ratio), letterWidth];
    this.canTopMax = this.canDim[0];


    placement.innerHTML =
      '<div id=loadContVertCenter>' +
      '<div id=loadCont>' +
      '<div id=cansCont>' +
      '<canvas class="loadCan" id="canP" height=' + (this.canDim[0]) + ' width=' + this.canDim[1] + '></canvas>' +
      '<canvas class="loadCan" id="canU" height=' + (this.canDim[0]) + ' width=' + this.canDim[1] + '></canvas>' +
      '<canvas class="loadCan" id="canB1" height=' + (this.canDim[0]) + ' width=' + this.canDim[1] + '></canvas>' +
      '<canvas class="loadCan" id="canB2" height=' + (this.canDim[0]) + ' width=' + this.canDim[1] + '></canvas>' +
      '<canvas class="loadCan" id="canL" height=' + (this.canDim[0]) + ' width=' + this.canDim[1] + '></canvas>' +
      '<canvas class="loadCan" id="canY" height=' + (this.canDim[0]) + ' width=' + this.canDim[1] + '></canvas>' +
      '</div>' +
      '<div id="load-letters-cont">' +
      '<img id="load-logo"/>' +
          /*
           '<img class="load-letter" id="load-letter-p" letter="p" src="' + dependenciesLoc + 'presets/letters/p_plain.png" />' +
           '<img class="load-letter" id="load-letter-u" letter="u" src="' + dependenciesLoc + 'presets/letters/u_plain.png" />' +
           '<img class="load-letter" id="load-letter-b1" letter="b1" src="' + dependenciesLoc + 'presets/letters/b1_plain.png" />' +
           '<img class="load-letter" id="load-letter-b2" letter="b2" src="' + dependenciesLoc + 'presets/letters/b2_plain.png" />' +
           '<img class="load-letter" id="load-letter-l" letter="l" src="' + dependenciesLoc + 'presets/letters/l_plain.png" />' +
           '<img class="load-letter" id="load-letter-y" letter="y" src="' + dependenciesLoc + 'presets/letters/y_plain.png" />' +
           */
      '</div>' +
      '</div>' +
      '<p id=loadText>0%</p>' +
      '</div>';

    document.getElementById("load-logo").onload = function () {
        $("#cansCont").css("visibility", "visible");
    };
    document.getElementById("load-logo").src = dependenciesLoc + 'presets/logos/logoEmptyColors.png';

    $(".loadCan").css({"width": letterWidth});
    /*
     if (maxDim[0] > 350) {
     $("#cansCont").css({"height":this.canDim[0] - 2,"width": workWidth,"left":"50%","margin-left":workWidth / -2,"margin-top":1});
     }	else	{
     $("#cansCont").css({"height":this.canDim[0],"width": workWidth,"left":"50%","margin-left":workWidth / -2,"margin-top":0});
     }
     */
    // This is the thing you increase if there are colors below the pubbly loader.
    $("#cansCont").css({
        "height": this.canDim[0] - 2,
        "width": workWidth,
        "left": "50%",
        "margin-left": workWidth / -2,
        "margin-top": 1
    });
    $("#load-logo").css({"width": workWidth, "left": workWidth / -2});
    $("#loadCont").css({"margin-top": ((workWidth * ratio) / -2) - 15, "height": workWidth * ratio});

    $(".load-letter").hover(function () {
        var curSrc = $(this).attr("src");
        $(this).attr("src", curSrc.replace("_plain", "_hover"));
    }, function () {
        var curSrc = $(this).attr("src");
        $(this).attr("src", curSrc.replace("_hover", "_plain"));
    });

    this.loadText = document.getElementById('loadText');
    var canColors = [
        'RGB(136,103,172)', // P
        'RGB(57,77,129)',   // U
        'RGB(226,98,35)',   // B
        'RGB(179,36,42)',   // B
        'RGB(91,173,198)',  // L
        'RGB(145,188,72)',  // Y
    ];
    this.cans = [];
    var cans = document.getElementsByClassName("loadCan");
    for (var c = 0; c < cans.length; c++) {
        var cur = cans[c];
        var curCtx = cur.getContext('2d');
        curCtx.fillStyle = canColors[c];
        curCtx.fillRect(0, 50, this.canDim[1], this.canDim[0]);
        this.cans.push({elem: cur, ctx: curCtx});
    }
    // fillRect(left,top,right,bottom)
    this.averageLoads = function () {
        var average = 0;
        for (var i = 0; i < this.loadTimes.length; i++) {
            average += this.loadTimes[i];
        }
        average /= this.loadTimes.length;
        this.averageLoadTime = average;
    };
    this.update = function (at, total) {
        if (!this.loadTimes.length) {
            this.steps = total;
            this.jump = parseInt(this.canDim[0] / total);
        }
        this.done = at / total;

        this.canTopMax -= this.jump;
        this.newLoad = new Date();
        this.betweenTimes = this.newLoad.getTime() - this.lastLoad.getTime();
        this.loadTimes.push(this.betweenTimes);
        this.averageLoads();
        this.lastLoad = this.newLoad;
        this.smoothMax = Math.floor(this.averageLoadTime / this.redrawTime);
        this.smoothAt = 0;


        bufArr[key + 'at'] = 0;

        if (at >= total) {
            window.clearInterval(this.redraw);
            this.loadText.innerHTML = '100%';
            for (var c = 0; c < this.cans.length; c++) {
                var curCtx = this.cans[c].ctx;
                curCtx.fillRect(0, 0, this.canDim[1], this.canDim[0]);
            }
        }


    };
    this.clear = function () {
        for (var c = 0; c < this.cans.length; c++) {
            var curCtx = this.cans[c].ctx;
            curCtx.clearRect(0, 0, this.canDim[1], this.canDim[0]);
        }
    };
    this.draw = function () {
        var smooth = Math.min((parseInt(100 * (this.smoothAt / this.smoothMax))) / 100, 1);
        var smoothTop = Math.max(this.canTopMax - (smooth * this.jump), 0);
        for (var c = 0; c < this.cans.length; c++) {
            var curCtx = this.cans[c].ctx;
            curCtx.fillRect(0, smoothTop, this.canDim[1], this.canDim[0]);
        }
        var percentage = Math.min(100, parseInt(((this.canDim[0] - smoothTop) / this.canDim[0]) * 100)) || 0;
        this.loadText.innerHTML = percentage + "%";
    };
    this.kill = function () {
        window.clearInterval(this.redraw);
        this.contID.innerHTML = '';
    };
    this.waveAt = 0;
    this.redrawTime = 10;
    this.smoothMax = 0;
    this.smoothAt = 0;
    this.redraw = window.setInterval(function () {
        THIS.smoothAt++;
        THIS.clear();
        THIS.draw();
        $("#shade").css("display", "block");
    }, this.redrawTime);
    this.lastLoad = new Date();
}


function spinner(placement) {
    var THIS = this;
    this.contID = placement;
    placement.innerHTML =
      '<div id=loadContVertCenter>' +
      '<div id=loadCont>' +
      '<img class="load-spinner" src =' + dependenciesLoc + 'presets/spinner.png></img>' +
      '</div>' +
      '</div>';
    this.spinner = this.contID.getElementsByClassName('load-spinner')[0];
    this.kill = function () {
        this.contID.innerHTML = '';
    }
}
