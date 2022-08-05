class Button {
  constructor(x, y, w, h, round, id, text, col, ButtonFunction, visible = true) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.round = round;
    this.id = id
    this.text = text;
    this.col = col;
    this.visible = visible;
    this.highlightColor = lerpColor(col, color("WHITE"), 0.2);
    this.ButtonFunction = ButtonFunction;
  }

  show() {
    let c;
    if (this.hoverOver(mouseX, mouseY)) {
      c = this.highlightColor;
    } else {
      c = this.col;
    }
    fill(c);
    noStroke();
    rect(this.x, this.y, this.w, this.h, this.round);
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(15);
    text(this.text, this.x + this.w / 2, this.y + this.h / 2);
  }

  hoverOver(x, y) {
    return (
      x >= this.x &&
      x <= this.x + this.w &&
      y >= this.y &&
      y <= this.y + this.h &&
      this.visible
    );
  }

  click() {
    this.ButtonFunction(this);
  }
}

class DropDown extends Button {
  constructor(x, y, w, h, round, id, text, col, orientation, nameList, functionList, visible = true) {


    this.orientation = orientation
    this.nameList = nameList
    this.functionList = functionList
    this.buttons = []
    this.buttonsVisibility = false

    if (this.orientation == 0) {
      this.Xoffset = 0
      this.Yoffset = this.h
    }
    else if (this.orientation == 1) {
      this.Xoffset = this.w
      this.Yoffset = 0
    }
    else {
      this.Xoffset = 0
      this.Yoffset = this.h
    }

    for (let i = 0; i < this.nameList.length; i++) {
      let button = new Button(this.x + this.Xoffset,
        this.y + this.Yoffset,
        this.w,
        this.h,
        this.round,
        this.id + " " + this.nameList[i],
        this.nameList[i],
        this.col,
        this.functionList[i],
        false)
      Buttons[button.id] = button
      this.buttons.push(button)
    }
    let ButtonFunction = function () {
      let visible = !this.buttonsVisibility
      for (let button of this.buttons) {
        button.visible = visible
      }
    }
    super(x, y, w, h, round, id, text, col, ButtonFunction, visible = true)
  }
}

class InfoScreen {
  constructor(text, x, y, w, col) {
    this.text = text
    this.x = x
    this.y = y
    this.w = w
    this.col = col
  }

  showInfo(Info) {
    
    if (Info.length > 0) {
      noStroke()
      fill(this.col)
      rect(this.x, this.y, this.w, Info.length * 25 + 25)
      fill(0)
      text(this.text, this.x + this.w / 2, this.y + 12.5)
    }
    for (let i = 0; i < Info.length; i++) {
      text(Info[i], this.x + this.w / 2, this.y + i * 25 + 37.5)
    }
  }
}

//Zooming and Translating 
const zoomSensitivity = 0.1;
const mouseDragDetectionThreshold = 5;
const scaleMin = 0.125;
const scaleMax = 12;
let currentScale = 1;
let transformX = 0;
let transformY = 0;
let mousePressedX = null;
let mousePressedY = null;

//Input Functions
function mousePressed() {
  mousePressedX = mouseX;
  mousePressedY = mouseY;
}
function mouseDragged() {
  if (dist(mousePressedX, mousePressedY, mouseX, mouseY) > mouseDragDetectionThreshold) {
    transformX += (mouseX - pmouseX);
    transformY += (mouseY - pmouseY);
  }
}
function mouseReleased() {
  mousePressedX = null;
  mousePressedY = null;
}
function mouseWheel(event) {
  // Determine the scale factor based on zoom sensitivity
  let scaleFactor = null;
  if (event.delta < 0) {
    scaleFactor = 1 + zoomSensitivity;
  } else {
    scaleFactor = 1 - zoomSensitivity;
  }

  // Apply transformation and scale incrementally if within boundary 
  if ((currentScale < scaleMax || scaleFactor < 1) && (currentScale > scaleMin || scaleFactor > 1)) {
    currentScale = currentScale * scaleFactor

    transformX = mouseX - (mouseX * scaleFactor) + (transformX * scaleFactor);
    transformY = mouseY - (mouseY * scaleFactor) + (transformY * scaleFactor);
  }

  // Disable page scroll
  return false;
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  debugStatsScreen = new InfoScreen("Debug Stats", width - 250, 0, 250, color(100, 50))
}
function mouseClicked() {
  //clicking Buttons if mouse hovers over
  let buttonClicked = false
  for (const key in Buttons) {
    if (Object.hasOwnProperty.call(Buttons, key)) {
      const button = Buttons[key];
      if (button.hoverOver(mouseX, mouseY)) {
        button.click();
        buttonClicked = true
      }
    }
  }
  if (!buttonClicked) {
    let human = new Human(objectID.next().value, (mouseX - transformX) / currentScale, (mouseY - transformY) / currentScale)
    human.dna[0] = 0.45
    Quadtree.insert(human);
    Creatures[human.id] = human
  }
}

//Button Functions
function mainMenu() {
  let visible = !Buttons["Reload"].visible;
  Buttons["Reload"].visible = visible;
  Buttons["Sim Speed +"].visible = visible;
  Buttons["Sim Speed -"].visible = visible;
  Buttons["Save Game"].visible = visible;
  Buttons["Load Game"].visible = visible;
  Buttons["Debug Menu"].visible = visible;
  Buttons["Quit"].visible = visible;
  if (Buttons["Debug Quadtree"].visible) {
    debugMenu()
  }
}
function reload() {
  defaultSetup()
}
function simSpeedUp() {
  simulationSpeed += 1;
}
function simSpeedDown() {
  simulationSpeed -= 1;
}
function saveGame() {

}
function loadGame() {

}
function debugMenu() {
  Buttons["Debug Quadtree"].visible = !Buttons["Debug Quadtree"].visible;
  Buttons["Debug QuadtreeFetching"].visible = !Buttons["Debug QuadtreeFetching"].visible;
  Buttons["Debug QuadtreeBuildTime"].visible = !Buttons["Debug QuadtreeBuildTime"].visible;
  Buttons["Debug FPS"].visible = !Buttons["Debug FPS"].visible;
  Buttons["Debug CreatureCount"].visible = !Buttons["Debug CreatureCount"].visible;
  Buttons["Debug BuildingCount"].visible = !Buttons["Debug BuildingCount"].visible;
  Buttons["Debug WorldObjectsCount"].visible = !Buttons["Debug WorldObjectsCount"].visible;
  Buttons["Debug FrameCount"].visible = !Buttons["Debug FrameCount"].visible;
  Buttons["Debug Dead"].visible = !Buttons["Debug Dead"].visible;
  Buttons["Debug Generation"].visible = !Buttons["Debug Generation"].visible;
  Buttons["Debug SimSpeed"].visible = !Buttons["Debug SimSpeed"].visible;
  Buttons["Debug CreaturesShow"].visible = !Buttons["Debug CreaturesShow"].visible;
  Buttons["Debug BuildingsShow"].visible = !Buttons["Debug BuildingsShow"].visible;
  Buttons["Debug WorldObjectsShow"].visible = !Buttons["Debug WorldObjectsShow"].visible;
}
function quit() {
  quitted = true
}
function debugFunction(self) {
  DebugOptions[self.id] = !DebugOptions[self.id]
}
