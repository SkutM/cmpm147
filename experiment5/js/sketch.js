/* exported preload, setup, draw */
/* global getInspirations, initDesign, renderDesign, mutateDesign */

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
  currentCanvas = createCanvas(600, 400); // fixed size for consistency
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
