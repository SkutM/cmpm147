/* exported preload, setup, draw, getInspirations, initDesign, renderDesign, mutateDesign */

let bestDesign;
let currentDesign;
let currentScore;
let currentInspiration;
let currentCanvas;
let currentInspirationPixels;

function preload() {
  let allInspirations = getInspirations();

  for (let i = 0; i < allInspirations.length; i++) {
    let insp = allInspirations[i];
    insp.image = loadImage(insp.assetUrl);
    let option = document.createElement("option");
    option.value = i;
    option.innerHTML = insp.name;
    document.getElementById("dropper").appendChild(option);
  }
  document.getElementById("dropper").onchange = e =>
    inspirationChanged(allInspirations[e.target.value]);
  currentInspiration = allInspirations[0];

  document.getElementById("restart").onclick = () =>
    inspirationChanged(allInspirations[document.getElementById("dropper").value]);
}

function inspirationChanged(nextInspiration) {
  currentInspiration = nextInspiration;
  currentDesign = undefined;
  document.getElementById("memory").innerHTML = "";
  setup();
}

function setup() {
  currentCanvas = createCanvas(100, 66, { willReadFrequently: true });
  currentCanvas.parent(document.getElementById("canvas-container"));
  currentScore = Number.NEGATIVE_INFINITY;
  currentDesign = initDesign(currentInspiration);
  bestDesign = currentDesign;
  image(currentInspiration.image, 0, 0, width, height);
  loadPixels();
  currentInspirationPixels = pixels;
}


function evaluate() {
  loadPixels();
  let error = 0;
  let n = pixels.length;

  for (let i = 0; i < n; i++) {
    error += sq(pixels[i] - currentInspirationPixels[i]);
  }
  return 1 / (1 + error / n);
}

function memorialize() {
  let url = currentCanvas.canvas.toDataURL();

  let img = document.createElement("img");
  img.classList.add("memory");
  img.src = url;
  img.width = width;
  img.height = height;
  img.title = currentScore;

  document.getElementById("best").innerHTML = "";
  document.getElementById("best").appendChild(img.cloneNode());

  img.width = width / 2;
  img.height = height / 2;

  let memory = document.getElementById("memory");
  memory.insertBefore(img, memory.firstChild);

  if (memory.childNodes.length > memory.dataset.maxItems) {
    memory.removeChild(memory.lastChild);
  }
}

let mutationCount = 0;

function draw() {
  if (!currentDesign) {
    return;
  }

  randomSeed(mutationCount++);
  currentDesign = JSON.parse(JSON.stringify(bestDesign));
  let rate = document.getElementById("slider").value;
  document.getElementById("rate").innerHTML = rate;
  mutateDesign(currentDesign, currentInspiration, rate / 100.0);

  randomSeed(0);
  renderDesign(currentDesign, currentInspiration);
  let nextScore = evaluate();
  document.getElementById("activeScore").innerHTML = nextScore.toFixed(4);

  if (nextScore > currentScore) {
    currentScore = nextScore;
    bestDesign = currentDesign;
    memorialize();
    document.getElementById("bestScore").innerHTML = currentScore.toFixed(4);
  }

  document.getElementById("fpsCounter").innerHTML = Math.round(frameRate());
}

function getInspirations() {
  return [
    {
      name: "Sunset",
      assetUrl: "https://cdn.glitch.global/671af90a-7648-40a0-832d-23decbc4d665/sunset.jpg?v=1746838139373",
      credit: "Sunset over a vast ocean"
    },
    {
      name: "Mountains",
      assetUrl: "https://cdn.glitch.global/671af90a-7648-40a0-832d-23decbc4d665/mountain.jpg?v=1746838134763",
      credit: "Mountains in a beautiful valley"
    },
    {
      name: "Underwater",
      assetUrl: "https://cdn.glitch.global/671af90a-7648-40a0-832d-23decbc4d665/fishseafloor.jpg?v=1746838130145",
      credit: "Underwater in a decorus coral reef"
    }
  ];
}

function initDesign(inspiration) {
  let shapes = [];
  let shapeCount = 150;

  let shapeType = "triangle";
  let colorRange = { r: [150, 255], g: [100, 200], b: [50, 150] };

  if (inspiration.name === "Mountains") {
    shapeType = "rect";
    colorRange = { r: [50, 150], g: [100, 200], b: [150, 255] };
    shapeCount = 120;
  } else if (inspiration.name === "Underwater") {
    shapeType = "ellipse";
    colorRange = { r: [50, 150], g: [150, 255], b: [150, 255] };
    shapeCount = 180;
  }

  for (let i = 0; i < shapeCount; i++) {
    shapes.push({
      x: random(width),
      y: random(height),
      size: random(5, 30),
      rotation: random(TWO_PI),
      shapeType: shapeType,
      color: [
        random(colorRange.r[0], colorRange.r[1]),
        random(colorRange.g[0], colorRange.g[1]),
        random(colorRange.b[0], colorRange.b[1]),
        random(75, 100)
      ]
    });
  }

  return {
    shapes: shapes
  };
}

function renderDesign(design, inspiration) {
  image(inspiration.image, 0, 0, width, height);
  noStroke();

  for (let shape of design.shapes) {
    fill(shape.color[0], shape.color[1], shape.color[2], shape.color[3]);

    push();
    translate(shape.x, shape.y);
    rotate(shape.rotation);

    if (shape.shapeType === "triangle") {
      triangle(
        0, -shape.size / 2,
        shape.size / 2, shape.size / 2,
        -shape.size / 2, shape.size / 2
      );
    } else if (shape.shapeType === "ellipse") {
      ellipse(0, 0, shape.size);
    } else if (shape.shapeType === "rect") {
      rect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
    }

    pop();
  }
}

function mutateDesign(design, inspiration, rate) {
  for (let shape of design.shapes) {
    shape.x = mut(shape.x, 0, width, rate);
    shape.y = mut(shape.y, 0, height, rate);
    shape.size = mut(shape.size, 5, 30, rate);
    shape.rotation = mut(shape.rotation, 0, TWO_PI, rate);

    shape.color[0] = mut(shape.color[0], 0, 255, rate);
    shape.color[1] = mut(shape.color[1], 0, 255, rate);
    shape.color[2] = mut(shape.color[2], 0, 255, rate);
    shape.color[3] = mut(shape.color[3], 7, 100, rate);
  }
}

function mut(num, min, max, rate) {
  return constrain(randomGaussian(num, (rate * (max - min)) / 20), min, max);
}
