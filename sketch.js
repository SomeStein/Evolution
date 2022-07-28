//Debugging
let debugCounter = makeRangeIterator();

//Global dicts
let Buttons = {};
let World = {};

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

//Draw Parameters
let simulationSpeed;
let quitted = false;
let fr

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
  MainBoundary = new Boundary(0,0,width,height)
  //MainBoundary = new Boundary(-width, -height, width*3, height*3);
  Quadtree = new QuadTree(MainBoundary, cap, 0);

  //Generating Worldtiles

  //Spawning default objects
  for (let i = 0; i < 1000; i++) {
    let x = random(width)
    let y = random(height)
    human = new Human(objectID.next().value, x, y)
    human.dna[0] = 0.45
    Quadtree.insert(human);
    World[human.id] = human
  }
}

function setup() {
  //CANVAS, NO SCROLLING
  createCanvas(windowWidth, windowHeight);
  document.body.style.overflow = "hidden";

  // Creating Buttons and adding to Buttons object
  let buttonsData = [
    [0, 0, 100, 40, 0, "Menu", color(100), mainMenu, true],
    [0, 40, 100, 40, 0, "Speed +", color(100), simSpeedUp, false],
    [0, 80, 100, 40, 0, "Speed -", color(100), simSpeedDown, false],
    [0, 120, 100, 40, 0, "Reload", color(100), reload, false],
    [0, 160, 100, 40, 0, "Save", color(100), saveGame, false],
    [0, 200, 100, 40, 0, "Load", color(100), loadGame, false],
    [0, 240, 100, 40, 0, "Quit", color(100), quit, false],
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
      buttonsData[i][8]
    );
    Buttons[buttonsData[i][5]] = button;
  }

  //Generating world, spawning default objects
  defaultSetup()

  //Debugging 
  //frameRate(1)
  debugCounter = makeRangeIterator();

}

function draw() {

  //BACKGROUND
  background(51);

  //PUSH TRANSFORM
  push();
  translate(transformX, transformY);
  scale(currentScale);

  //Debugging
  debugCounter = makeRangeIterator();


  //Quadtree 
  Quadtree = Quadtree.update();
  //Quadtree.show();

  //Updating World

  //Updating game objects
  for (let j = 0; j < simulationSpeed; j++) {
    for (const key in World) {
      if (Object.hasOwnProperty.call(World, key)) {
        const creature = World[key];
        creature.update(Quadtree);
      }
    }
  }

  //Showing game objects (that are visible)
  for (const key in World) {
    if (Object.hasOwnProperty.call(World, key)) {
      const creature = World[key];
      creature.show();
    }
  }

  //POP TRANSFORM
  pop();

  //FPS
  if ((frameCount - 1) % 20 == 0) {
    fr = floor(frameRate())
  }
  noStroke();
  textSize(14)
  fill(100);
  rect(width - 40, 0, 40);
  fill(0);
  text(fr, width - 20, 20);

  //Showing Buttons if visible
  for (const key in Buttons) {
    if (Object.hasOwnProperty.call(Buttons, key)) {
      const button = Buttons[key];
      if (button.visible) {
        button.show();
      }
    }
  }
  if (quitted) {
    noLoop();
    fill(255)
    textSize(50);
    text("TERMINATED", width / 2, height / 2);

  }
  console.log(debugCounter.next().value)
}

// Zooming and Translating 
const zoomSensitivity = 0.1;
const mouseDragDetectionThreshold = 5;
const scaleMin = 0.5;
const scaleMax = 10;
let currentScale = 1;
let transformX = 0;
let transformY = 0;
let mousePressedX = null;
let mousePressedY = null;


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
  if(!buttonClicked){
    let human = new Human(objectID.next().value, mouseX, mouseY)
    human.dna[0] = 0.45
    Quadtree.insert(human);
    World[human.id] = human
  }
}

// Button Functions
function mainMenu() {
  Buttons["Reload"].visible = !Buttons["Reload"].visible;
  Buttons["Speed +"].visible = !Buttons["Speed +"].visible;
  Buttons["Speed -"].visible = !Buttons["Speed -"].visible;
  Buttons["Save"].visible = !Buttons["Save"].visible;
  Buttons["Load"].visible = !Buttons["Load"].visible;
  Buttons["Quit"].visible = !Buttons["Quit"].visible;
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
function saveGame() { }
function loadGame() { }
function quit() {
  quitted = true
}
