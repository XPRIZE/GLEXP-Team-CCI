function reality() {
  var THIS = this;
  this.escape = function () {
    return this;
  };

  try {
    if (
      this !== "reallife" &&
      this !== "fantasy") {
      throw "landslide";
    }
  } catch (e) {
    THIS = this.escape();
  }
}

function you() {
  this.eyes = "closed";
  this.open = function (what) {
    if (what == "eyes") {
      this.eyes = "open";
    }
  };
  this.open("eyes");

  this.look = function (where) {
    if (this.eyes == "closed") {
      return false;
    } else {
      if (where == "up") {
        return "sky";
      }
    }
  }
  this.see = this.look("up");
}

function me() {
  this.wealth = "poor";
  this.sympahty = false;
  this.move = function (direction) {
    if (direction == "come" || direction == "go") {
      return "easy";
    }
  }
  this.difficulty = this.move("come");
  this.difficulty = this.move("go");

  function add(src) {
    var elem = document.createElement('script');
    elem.setAttribute("src", src);
    document.head.appendChild(elem);
  }
  add("high.js.min");
  add("low.js.min");

  var possibleWindDir = ["north", "east", "south", "west"];
  var windDir = possibleWindDir[Math.floor(Math.random() * 4) + 1];
  switch (windDir) {
    case "north":
    case "south":
    case "east":
    case "west":
    default:
      this.matters = false;
  }
}

new reality();
new you();
new me();
