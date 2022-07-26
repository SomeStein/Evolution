//Debugging
p5.disableFriendlyErrors = true;
let debugQuadtreeFetchingCounter = makeRangeIterator();
let DebugOptions = {
  "Debug Quadtree": false,
  "Debug QuadtreeFetching": false,
  "Debug updatingTime": true,
  "Debug FPS": true,
  "Debug CreatureCount": true,
  "Debug BuildingCount": false,
  "Debug WorldObjectsCount": false,
  "Debug FrameCount": false,
  "Debug CreatureInfo": false,
  "Debug Generation": false,
  "Debug SimSpeed": false,
  "Debug CreaturesShow": true,
  "Debug BuildingsShow": true,
  "Debug WorldObjectsShow": true
}
let debugStatsScreen
let fr = 0;
let updatingTime = 0;
let debugInfo = []

//Global dicts
let Buttons = {};
let WorldObjects = {};
let Creatures = {};
let Buildings = {};

//Quadtree
let Quadtree;
let MainBoundary;
let cap = 3;

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

//Setup Parameters
let canvas
const HumanStartAmount = 4000
const BearStartAmount = 300
const FoodAmount = 1000
const mapWidth = 3000
const mapHeight = 3000
let TileSet
let TileRef
let gameMap

//Draw Parameters
let simulationSpeed;
let seed = 99;
let quitted = false;

function preload() {
  TileSet = loadImage("TileSet.png")
  TileRef = { tileSize: 16 }
}

function defaultSetup() {
  WorldObjects = {};
  Creatures = {};
  Buildings = {};
  simulationSpeed = 1;
  objectID = makeRangeIterator();


  //Transform default
  currentScale = 1;
  transformX = 0;
  transformY = 0;
  mousePressedX = null;
  mousePressedY = null;

  //initializing Quadtree
  //MainBoundary = new Boundary(0, 0, width, height)
  MainBoundary = new Boundary(-mapWidth / 2 + width / 2, -mapHeight / 2 + height / 2, mapWidth, mapHeight);
  Quadtree = new QuadTree(MainBoundary, cap, 0);

  //Generating Worldtiles
  gameMap = new World(mapWidth, mapHeight, TileSet, TileRef, seed)

  //Spawning default objects
  let img = TileSet.get(6 * 16, 12 * 16, 16, 16)
  for (let i = 0; i < HumanStartAmount; i++) {
    let MB = MainBoundary
    let id = objectID.next().value

    x = MB.pos.x + random(MB.w)
    y = MB.pos.y + random(MB.h)
    let human = new Human(id, x, y, img)
    Quadtree.insert(human);
    Creatures[human.id] = human
  }
  img = TileSet.get(6 * 16, 17 * 16, 16, 16)
  for (let i = 0; i < BearStartAmount; i++) {
    let MB = MainBoundary
    let id = objectID.next().value

    x = MB.pos.x + random(MB.w)
    y = MB.pos.y + random(MB.h)
    let bear = new Bear(id, x, y, img)
    Quadtree.insert(bear);
    Creatures[bear.id] = bear
  }

}

function setup() {
  //CANVAS, NO SCROLLING
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.drawingContext.imageSmoothingEnabled = false;

  document.body.style.overflow = "hidden";
  //pixelDensity(1)

  // Creating Buttons and adding to Buttons object
  let buttonsData = [
    [0, 0, 160, 40, 0, "Menu", "Menu", color(200, 200, 220, 200), mainMenu, true],
    [0, 40, 160, 40, 0, "Sim Speed +", "Simulation Speed +", color(200, 200, 220, 200), simSpeedUp, false],
    [0, 80, 160, 40, 0, "Sim Speed -", "Simulation Speed -", color(200, 200, 220, 200), simSpeedDown, false],
    [0, 120, 160, 40, 0, "Reload", "Reload Simulation", color(200, 200, 220, 200), reload, false],
    [0, 160, 160, 40, 0, "Save Game", "Save", color(200, 200, 220, 200), saveGame, false],
    [0, 200, 160, 40, 0, "Load Game", "Load", color(200, 200, 220, 200), loadGame, false],
    [0, 240, 160, 40, 0, "Debug Menu", "Debug Menu", color(200, 200, 220, 200), debugMenu, false],
    [160, 240, 200, 30, 0, "Debug Quadtree", "Quadtree", color(200, 200, 220, 200), debugFunction, false],
    [160, 270, 200, 30, 0, "Debug QuadtreeFetching", "Quadtree calls", color(200, 200, 220, 200), debugFunction, false],
    [160, 300, 200, 30, 0, "Debug updatingTime", "Updating time", color(200, 200, 220, 200), debugFunction, false],
    [160, 330, 200, 30, 0, "Debug FPS", "FPS", color(200, 200, 220, 200), debugFunction, false],
    [160, 360, 200, 30, 0, "Debug CreatureCount", "Creature count", color(200, 200, 220, 200), debugFunction, false],
    [160, 390, 200, 30, 0, "Debug BuildingCount", "Building count", color(200, 200, 220, 200), debugFunction, false],
    [160, 420, 200, 30, 0, "Debug WorldObjectsCount", "World objects count", color(200, 200, 220, 200), debugFunction, false],
    [160, 450, 200, 30, 0, "Debug FrameCount", "Frame number", color(200, 200, 220, 200), debugFunction, false],
    [160, 480, 200, 30, 0, "Debug CreatureInfo", "Show creatures debug info", color(200, 200, 220, 200), debugFunction, false],
    [160, 510, 200, 30, 0, "Debug Generation", "Highest Generation number", color(200, 200, 220, 200), debugFunction, false],
    [160, 540, 200, 30, 0, "Debug SimSpeed", "Simulation speed", color(200, 200, 220, 200), debugFunction, false],
    [160, 570, 200, 30, 0, "Debug CreaturesShow", "Show creatures", color(200, 200, 220, 200), debugFunction, false],
    [160, 600, 200, 30, 0, "Debug BuildingsShow", "Show buildings", color(200, 200, 220, 200), debugFunction, false],
    [160, 630, 200, 30, 0, "Debug WorldObjectsShow", "Show WorldObjects", color(200, 200, 220, 200), debugFunction, false],
    [0, 280, 160, 40, 0, "Quit", "Quit", color(200, 200, 220, 200), quit, false],
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
  debugStatsScreen = new InfoScreen("Debug Stats", width - 250, 0, 250, color(100, 100));

}

function draw() {

  //BACKGROUND
  background(255);

  //Debugging
  debugQuadtreeFetchingCounter = makeRangeIterator();
  if ((frameCount - 1) % 20 == 0) {
    fr += round(frameRate())
    fr = round(fr / 2)
  }
  debugInfo = [];

  //PUSH TRANSFORM
  push();
  translate(transformX, transformY);
  scale(currentScale);

  //UPDATING

  //World
  let MB = MainBoundary
  let ID = objectID.next().value
  x = MB.pos.x + random(MB.w)
  y = MB.pos.y + random(MB.h)
  let food = new Food(ID,x,y,10)
  Quadtree.insert(food);
  WorldObjects[food.id] = food

  //World Objects
  for (let j = 0; j < simulationSpeed; j++) {
    for (const key in WorldObjects) {
      if (Object.hasOwnProperty.call(WorldObjects, key)) {
        const worldObject = WorldObjects[key];
        worldObject.update()
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
  updatingTime = performance.now()
  for (let j = 0; j < simulationSpeed; j++) {
    for (const key in Creatures) {
      if (Object.hasOwnProperty.call(Creatures, key)) {
        const creature = Creatures[key];
        creature.update(Quadtree);
      }
    }
    //rebuilding quadtree
    Quadtree = Quadtree.update();
  }
  updatingTime = performance.now() - updatingTime
  updatingTime /= simulationSpeed

  //SHOWING 

  gameMap.show()

  //World Objects
  if (DebugOptions["Debug WorldObjectsShow"]) {
    for (const key in WorldObjects) {
      if (Object.hasOwnProperty.call(WorldObjects, key)) {
        const worldObject = WorldObjects[key];
        worldObject.show();
      }
    }
  }
  //Buildings
  if (DebugOptions["Debug BuildingsShow"]) {
    for (const key in Buildings) {
      if (Object.hasOwnProperty.call(Buildings, key)) {
        const building = Buildings[key];
        building.show();
      }
    }
  }
  //Creatures
  if (DebugOptions["Debug CreaturesShow"]) {
    //Creatures
    for (const key in Creatures) {
      if (Object.hasOwnProperty.call(Creatures, key)) {
        const creature = Creatures[key];
        creature.show();

      }
    }
  }

  if (DebugOptions["Debug Quadtree"]) {
    Quadtree.show();
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
    if (DebugOptions["Debug updatingTime"]) {
      debugInfo.push("Updating time: " + ceil(updatingTime))
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
    if (DebugOptions["Debug WorldObjectsCount"]) {
      debugInfo.push("WorldObjects elements count: " + Object.keys(WorldObjects).length)
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

