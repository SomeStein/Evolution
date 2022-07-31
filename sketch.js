//Testing
let mil = 0

//Debugging
let debugQuadtreeFetchingCounter = makeRangeIterator();
let DebugOptions = {
  "Debug Quadtree": false,
  "Debug QuadtreeFetching": true,
  "Debug QuadtreeBuildTime": false,
  "Debug FPS": true,
  "Debug CreatureCount": false,
  "Debug BuildingCount": false,
  "Debug WorldCount": false,
  "Debug FrameCount": true,
  "Debug Dead": false,
  "Debug Generation": false,
  "Debug SimSpeed": false,
  "Debug CreaturesShow": true,
  "Debug BuildingsShow": true,
  "Debug WorldShow": true,
}
let debugStatsScreen
let fr = 0;
let quadtreeBuildTime = 0;
let debugInfo = []

//Global dicts
let Buttons = {};
let World = {};
let Creatures = {};
let Buildings = {};

//Quadtree
let Quadtree;
let MainBoundary;
let cap = 1000;

//ID system 
function makeRangeIterator(start = 0, end = Infinity, step = 1) {
  let nextIndex = start;
  let iterationCount = 0;

  const rangeIterator = {
    next() {
      let result;
      if (nextIndex < end) {
        result = { value: nextIndex, done: false }
        nextIndex += step;
        iterationCount++;
        return result;
      }
      return { value: iterationCount, done: true }
    }
  };
  return rangeIterator;
}
let objectID;

//Draw Parameters
let simulationSpeed;
let quitted = false;


function defaultSetup() {
  World = {};
  simulationSpeed = 1;
  objectID = makeRangeIterator();

  //Transform default
  currentScale = 1;
  transformX = 0;
  transformY = 0;
  mousePressedX = null;
  mousePressedY = null;

  //initializing Quadtree
  MainBoundary = new Boundary(0, 0, width, height)
  //MainBoundary = new Boundary(-width, -height, width*3, height*3);
  Quadtree = new QuadTree(MainBoundary, cap, 0);

  //Generating Worldtiles

  //Spawning default objects
  for (let i = 0; i < 1500; i++) {
    let x = random(width)
    let y = random(height)
    human = new Human(objectID.next().value, x, y)
    human.dna[0] = 0.45
    Quadtree.insert(human);
    Creatures[human.id] = human
  }
}

function setup() {
  //CANVAS, NO SCROLLING
  createCanvas(windowWidth, windowHeight);
  document.body.style.overflow = "hidden";

  // Creating Buttons and adding to Buttons object
  let buttonsData = [
    [0, 0, 160, 40, 0, "Menu", "Menu", color(100), mainMenu, true],
    [0, 40, 160, 40, 0, "Sim Speed +", "Simulation Speed +", color(100), simSpeedUp, false],
    [0, 80, 160, 40, 0, "Sim Speed -", "Simulation Speed -", color(100), simSpeedDown, false],
    [0, 120, 160, 40, 0, "Reload", "Reload Simulation", color(100), reload, false],
    [0, 160, 160, 40, 0, "Save Game", "Save", color(100), saveGame, false],
    [0, 200, 160, 40, 0, "Load Game", "Load", color(100), loadGame, false],
    [0, 240, 160, 40, 0, "Debug Menu", "Debug Menu", color(100), debugMenu, false],
    [160, 240, 200, 30, 0, "Debug Quadtree", "Quadtree", color(100), debugFunction, false],
    [160, 270, 200, 30, 0, "Debug QuadtreeFetching", "Quadtree calls", color(100), debugFunction, false],
    [160, 300, 200, 30, 0, "Debug QuadtreeBuildTime", "Quadtree build time", color(100), debugFunction, false],
    [160, 330, 200, 30, 0, "Debug FPS", "FPS", color(100), debugFunction, false],
    [160, 360, 200, 30, 0, "Debug CreatureCount", "Creature count", color(100), debugFunction, false],
    [160, 390, 200, 30, 0, "Debug BuildingCount", "Building count", color(100), debugFunction, false],
    [160, 420, 200, 30, 0, "Debug WorldCount", "World elements count", color(100), debugFunction, false],
    [160, 450, 200, 30, 0, "Debug FrameCount", "Frame number", color(100), debugFunction, false],
    [160, 480, 200, 30, 0, "Debug Dead", "Show dead", color(100), debugFunction, false],
    [160, 510, 200, 30, 0, "Debug Generation", "Highest Generation number", color(100), debugFunction, false],
    [160, 540, 200, 30, 0, "Debug SimSpeed", "Simulation speed", color(100), debugFunction, false],
    [160, 570, 200, 30, 0, "Debug CreaturesShow", "Show creatures", color(100), debugFunction, false],
    [160, 600, 200, 30, 0, "Debug BuildingsShow", "Show buildings", color(100), debugFunction, false],
    [160, 630, 200, 30, 0, "Debug WorldShow", "Show world", color(100), debugFunction, false],
    [0, 280, 160, 40, 0, "Quit", "Quit", color(100), quit, false],
  ];

  for (let i = 0; i < buttonsData.length; i++) {
    const button = new Button(
      buttonsData[i][0],
      buttonsData[i][1],
      buttonsData[i][2],
      buttonsData[i][3],
      buttonsData[i][4],
      buttonsData[i][5],
      buttonsData[i][6],
      buttonsData[i][7],
      buttonsData[i][8],
      buttonsData[i][9]
    );
    Buttons[button.id] = button;
  }

  //Generating world, spawning default objects
  defaultSetup()

  //Debugging 
  //frameRate(1)
  debugStatsScreen = new InfoScreen("Debug Stats", width - 250, 0, 250, color(100, 50))

}

function draw() {
  if(frameCount % 2000== 0){
    console.log(millis())
    reload()
  }

  //BACKGROUND
  background(51);

  //Debugging
  debugQuadtreeFetchingCounter = makeRangeIterator();
  if ((frameCount - 1) % 20 == 0) {
    fr += round(frameRate())
    fr = round(fr/2)
  }
  debugInfo = [];

  //PUSH TRANSFORM
  push();
  translate(transformX, transformY);
  scale(currentScale);

  //Quadtree 
  quadtreeBuildTime = millis();
  Quadtree = Quadtree.update();
  quadtreeBuildTime -= millis();
  quadtreeBuildTime *= -1
  if (DebugOptions["Debug Quadtree"]) {
    Quadtree.show();
  }

  //Updating World

  //Updating game objects
  //World
  for (let j = 0; j < simulationSpeed; j++) {
    for (const key in World) {
      if (Object.hasOwnProperty.call(World, key)) {
        const tile = World[key];
        tile.update(Quadtree);
      }
    }
  }
  //Buildings
  for (let j = 0; j < simulationSpeed; j++) {
    for (const key in Buildings) {
      if (Object.hasOwnProperty.call(Buildings, key)) {
        const building = Buildings[key];
        building.update(Quadtree);
      }
    }
  }
  //Creatures
  for (let j = 0; j < simulationSpeed; j++) {
    for (const key in Creatures) {
      if (Object.hasOwnProperty.call(Creatures, key)) {
        const creature = Creatures[key];
        creature.update(Quadtree);
      }
    }
  }

  //Showing game objects (that are visible)
  //World
  if (DebugOptions["Debug WorldShow"]) {
    for (let j = 0; j < simulationSpeed; j++) {
      for (const key in World) {
        if (Object.hasOwnProperty.call(World, key)) {
          const tile = World[key];
          tile.show();
        }
      }
    }
  }
  //Buildings
  if (DebugOptions["Debug BuildingsShow"]) {
    for (let j = 0; j < simulationSpeed; j++) {
      for (const key in Buildings) {
        if (Object.hasOwnProperty.call(Buildings, key)) {
          const building = Buildings[key];
          building.show();
        }
      }
    }
  }
  //Creatures
  if (DebugOptions["Debug CreaturesShow"]) {
    //Creatures
    for (let j = 0; j < simulationSpeed; j++) {
      for (const key in Creatures) {
        if (Object.hasOwnProperty.call(Creatures, key)) {
          const creature = Creatures[key];
          creature.show();
        }
      }
    }
  }

  //POP TRANSFORM
  pop();

  //Showing Buttons if visible
  for (const key in Buttons) {
    if (Object.hasOwnProperty.call(Buttons, key)) {
      const button = Buttons[key];
      if (button.visible) {
        button.show();
      }
    }
  }

  //Debug Info Screen
  if (true) {
    if (DebugOptions["Debug QuadtreeFetching"]) {
      debugInfo.push("Quadtree dist evaluations: " + debugQuadtreeFetchingCounter.next().value)
    }
    if (DebugOptions["Debug QuadtreeBuildTime"]) {
      debugInfo.push("Quadtree Build Time: " + ceil(quadtreeBuildTime))
    }
    if (DebugOptions["Debug FPS"]) {
      debugInfo.push("FPS: " + fr)
    }
    if (DebugOptions["Debug CreatureCount"]) {
      debugInfo.push("Creature count: " + Object.keys(Creatures).length)
    }
    if (DebugOptions["Debug BuildingCount"]) {
      debugInfo.push("Buildings count: " + Object.keys(Buildings).length)
    }
    if (DebugOptions["Debug WorldCount"]) {
      debugInfo.push("World elements count: " + Object.keys(World).length)
    }
    if (DebugOptions["Debug FrameCount"]) {
      debugInfo.push("Frame number: " + frameCount)
    }
    if (DebugOptions["Debug SimSpeed"]) {
      debugInfo.push("Simulation Speed: " + simulationSpeed)
    }
  }

  debugStatsScreen.showInfo(debugInfo)
  if (quitted) {
    noLoop();
    fill(255)
    textSize(50);
    text("TERMINATED", width / 2, height / 2);

  }
}

//Zooming and Translating 
const zoomSensitivity = 0.1;
const mouseDragDetectionThreshold = 5;
const scaleMin = 0.5;
const scaleMax = 10;
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
        buttenClicked = true
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
  Buttons["Debug WorldCount"].visible = !Buttons["Debug WorldCount"].visible;
  Buttons["Debug FrameCount"].visible = !Buttons["Debug FrameCount"].visible;
  Buttons["Debug Dead"].visible = !Buttons["Debug Dead"].visible;
  Buttons["Debug Generation"].visible = !Buttons["Debug Generation"].visible;
  Buttons["Debug SimSpeed"].visible = !Buttons["Debug SimSpeed"].visible;
  Buttons["Debug CreaturesShow"].visible = !Buttons["Debug CreaturesShow"].visible;
  Buttons["Debug BuildingsShow"].visible = !Buttons["Debug BuildingsShow"].visible;
  Buttons["Debug WorldShow"].visible = !Buttons["Debug WorldShow"].visible;
}
function quit() {
  quitted = true
}
function debugFunction(self) {
  DebugOptions[self.id] = !DebugOptions[self.id]
}
