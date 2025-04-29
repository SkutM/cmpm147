// sketch.js - Cosmic Space Infinite World
// Author: Scott Miller
// CMPM 147 - Experiment 4

"use strict";

/* global XXH */
/* exported
    preload
    setup
    p3_worldKeyChanged
    p3_tileWidth
    p3_tileHeight
    p3_tileClicked
    p3_drawBefore
    p3_drawTile
    p3_drawSelectedTile
    p3_drawAfter
*/

let canvasContainer;
let worldSeed;
let clicks = {};
let explosions = {};

// camera setup
let cameraOffsetX = 0;
let cameraOffsetY = 0;
let cameraSpeed = 20;

// track held keys
let keysDown = {};

function preload() {}

function setup() {
  canvasContainer = $("#canvas-container");

  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");

  $(window).resize(function () {
    resizeScreen();
  });
  resizeScreen();

  // set key from input box
  $("#set-key").click(function() {
    let key = $("#world-key").val();
    p3_worldKeyChanged(key);
  });

  // default key
  p3_worldKeyChanged("default");
}

function resizeScreen() {
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
}

function p3_worldKeyChanged(key) {
  worldSeed = XXH.h32(key, 0);
  noiseSeed(worldSeed);
  randomSeed(worldSeed);
  clicks = {};
  explosions = {};
}

function p3_tileWidth() {
  return 64;
}
function p3_tileHeight() {
  return 32;
}

let [tw, th] = [p3_tileWidth(), p3_tileHeight()];

function p3_tileClicked(i, j) {
  let key = [i, j];
  let n = clicks[key] | 0;

  if (n == 0) {
    // make planet if no click on tile
    clicks[key] = 1;
  } else {
    // explode
    delete clicks[key];
    explosions[key] = millis();
  }
}

function p3_drawBefore() {
  // background
  setGradient(0, 0, width, height, color(10, 10, 30), color(40, 0, 60), color(0, 30, 60));
}

// gradient (directly from experiment 2)
function setGradient(x, y, w, h, c1, c2, c3) {
  noFill();
  for (let i = y; i <= y + h; i++) {
    let inter1 = map(i, y, y + h, 0, 1);
    let inter2 = map(i, y, y + h, 0, 1);
    let c = lerpColor(lerpColor(c1, c2, inter1), c3, inter2);
    stroke(c);
    line(x, i, x + w, i);
  }
}

function p3_drawTile(i, j) {
  noStroke();
  push();

  let tileHash = XXH.h32("tile:" + [i, j], worldSeed).toNumber();
  randomSeed(tileHash);

  let hasStar = random() < 0.25; // 25% chance star
  if (hasStar) {
    let baseSize = random(1, 4);
    let twinkle = sin(millis() / 500 + i * 5 + j * 7) * 1.5;
    let starSize = baseSize + twinkle;

    let starColor = color(random(180, 255), random(180, 255), random(200, 255));
    fill(starColor);
    ellipse(0, 0, starSize, starSize);
  }

  // If clicked, planet
  let n = clicks[[i, j]] | 0;
  if (n > 0) {
    let r = random(50, 80);
    let planetColor = color(random(100, 255), random(100, 255), random(100, 255));

    // glow around a planet
    fill(red(planetColor), green(planetColor), blue(planetColor), 50);
    ellipse(0, 0, r * 1.5, r * 1.5);

    // middle planet
    fill(planetColor);
    ellipse(0, 0, r, r);

    // gpt help
    // gpt start
    // create surface of planet details
    for (let k = 0; k < 5; k++) {
      let angle = random(TWO_PI);
      let dist = random(r * 0.1, r * 0.4);
      let sx = cos(angle) * dist;
      let sy = sin(angle) * dist;
      fill(planetColor.levels[0] + random(-20, 20), planetColor.levels[1] + random(-20, 20), planetColor.levels[2] + random(-20, 20));
      ellipse(sx, sy, random(5, 10), random(2, 5));
    }
    // gpt end

    // ring sometimes
    if (random() < 0.3) {
      noFill();
      stroke(255, 255, 150, 120);
      strokeWeight(2);
      ellipse(0, 0, r * 1.2, r * 0.3);
    }
  }

  // slight gpt help, noted below
  if (explosions[[i, j]] !== undefined) { // gpt helped line
    let explosionStart = explosions[[i, j]]; // mine
    let elapsed = millis() - explosionStart; // mine
    if (elapsed < 500) { // mine
      let numParticles = 8; // mine
      for (let k = 0; k < numParticles; k++) { // gpt
        let angle = (TWO_PI / numParticles) * k; // gpt
        let dist = elapsed / 5; // gpt
        let px = cos(angle) * dist; // gpt
        let py = sin(angle) * dist; // gpt
        fill(255, 200, 0, 255 - elapsed); // mine (fades out)
        ellipse(px, py, 5, 5); // gpt
      }
    } else {
      delete explosions[[i, j]];
    }
  }

  pop();
}

function p3_drawSelectedTile(i, j) {
  noFill();
  stroke(0, 255, 0, 128);

  beginShape();
  vertex(-tw, 0);
  vertex(0, th);
  vertex(tw, 0);
  vertex(0, -th);
  endShape(CLOSE);

  noStroke();
  fill(0);
  text("tile " + [i, j], 0, 0);
}

function p3_drawAfter() {}

function draw() {
  // camera movement while holding keys
  if (keysDown[LEFT_ARROW]) {
    cameraOffsetX += cameraSpeed;
  }
  if (keysDown[RIGHT_ARROW]) {
    cameraOffsetX -= cameraSpeed;
  }
  if (keysDown[UP_ARROW]) {
    cameraOffsetY += cameraSpeed;
  }
  if (keysDown[DOWN_ARROW]) {
    cameraOffsetY -= cameraSpeed;
  }

  p3_drawBefore();

  push();
  translate(width/2 + cameraOffsetX, height/2 + cameraOffsetY);

  let tilesAcross = int(width / tw) + 4;
  let tilesDown = int(height / th) + 4;

  let iCenter = int(-cameraOffsetY / th);
  let jCenter = int(cameraOffsetX / tw);

  for (let dj = -tilesAcross/2; dj < tilesAcross/2; dj++) {
    for (let di = -tilesDown/2; di < tilesDown/2; di++) {
      push();
      let i = iCenter + di;
      let j = jCenter + dj;
      translate(j * tw - i * tw, i * th + j * th);
      p3_drawTile(i, j);
      pop();
    }
  }

  pop();

  p3_drawAfter();
}

function mousePressed() {
  let tw = p3_tileWidth();
  let th = p3_tileHeight();

  let x = mouseX - width/2 - cameraOffsetX;
  let y = mouseY - height/2 - cameraOffsetY;

  let j = round((x / (2 * tw) + y / (2 * th)));
  let i = round((y / (2 * th) - x / (2 * tw)));

  p3_tileClicked(i, j);
}

function keyPressed() {
  keysDown[keyCode] = true;
}

function keyReleased() {
  keysDown[keyCode] = false;
}
