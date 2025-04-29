// sketch.js - Cosmic Space Infinite World
// Author: Scott Miller
// CMPM 147 - Experiment 4

let worldSeed;
let clicks = {};
let explosions = {};

function preload() {
}

function setup() {
  canvasContainer = $("#canvas-container");

  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");

  $(window).resize(function () {
    resizeScreen();
  });
  resizeScreen();
}

function resizeScreen() {
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
}

function worldKeyChanged(key) {
  worldSeed = XXH.h32(key, 0);
  noiseSeed(worldSeed);
  randomSeed(worldSeed);
}

function tileWidth() {
  return 64;
}

function tileHeight() {
  return 32;
}

let [tw, th] = [tileWidth(), tileHeight()];

function tileClicked(i, j) {
  let key = [i, j];
  let n = clicks[key] | 0;

  if (n == 0) {
    clicks[key] = 1; // create planet
  } else {
    delete clicks[key]; // remove planet
    explosions[key] = millis(); // start explosion
  }
}

function drawBefore() {
  // Background cosmic gradient
  setGradient(0, 0, width, height, color(10, 10, 30), color(40, 0, 60), color(0, 30, 60));
}

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

function drawTile(i, j) {
  noStroke();
  push();

  let tileHash = XXH.h32("tile:" + [i, j], worldSeed).toNumber();
  randomSeed(tileHash);

  let hasStar = random() < 0.25;
  if (hasStar) {
    let baseSize = random(1, 4);
    let twinkle = sin(millis() / 500 + i * 5 + j * 7) * 1.5;
    let starSize = baseSize + twinkle;

    let starColor = color(random(180, 255), random(180, 255), random(200, 255));
    fill(starColor);
    ellipse(0, 0, starSize, starSize);
  }

  let n = clicks[[i, j]] | 0;
  if (n > 0) {
    let r = random(50, 80);
    let planetColor = color(random(100, 255), random(100, 255), random(100, 255));

    fill(red(planetColor), green(planetColor), blue(planetColor), 50);
    ellipse(0, 0, r * 1.5, r * 1.5);

    fill(planetColor);
    ellipse(0, 0, r, r);

    for (let k = 0; k < 5; k++) {
      let angle = random(TWO_PI);
      let dist = random(r * 0.1, r * 0.4);
      let sx = cos(angle) * dist;
      let sy = sin(angle) * dist;
      fill(
        planetColor.levels[0] + random(-20, 20),
        planetColor.levels[1] + random(-20, 20),
        planetColor.levels[2] + random(-20, 20)
      );
      ellipse(sx, sy, random(5, 10), random(2, 5));
    }

    if (random() < 0.3) {
      noFill();
      stroke(255, 255, 150, 120);
      strokeWeight(2);
      ellipse(0, 0, r * 1.2, r * 0.3);
    }
  }

  if (explosions[[i, j]] !== undefined) {
    let explosionStart = explosions[[i, j]];
    let elapsed = millis() - explosionStart;
    if (elapsed < 500) {
      let numParticles = 8;
      for (let k = 0; k < numParticles; k++) {
        let angle = (TWO_PI / numParticles) * k;
        let dist = elapsed / 5;
        let px = cos(angle) * dist;
        let py = sin(angle) * dist;
        fill(255, 200, 0, 255 - elapsed);
        ellipse(px, py, 5, 5);
      }
    } else {
      delete explosions[[i, j]];
    }
  }

  pop();
}

function drawSelectedTile(i, j) {
  noFill();
  stroke(0, 255, 0, 128);

  beginShape();
  vertex(-tw, 0);
  vertex(0, th);
  vertex(tw, 0);
  vertex(0, -th);
  endShape(CLOSE);

  noStroke();
  fill(255);
  text("tile " + [i, j], 0, 0);
}

function drawAfter() {}
