// sketch.js - purpose and description here
// Author: Scott Miller
// Date: 4/14/2025

// needed for two fnctions
let waterTop, bottom, seafloor;

// seeed
let seed = 0;

function drawFish(x, y, size, faceLeft) {
  // push saves settings, pop restores. b4 & after
  push();
  translate(x, y);
  // if facing left, flip!
  scale(faceLeft ? -1 : 1, 1);

  // orange, body
  fill('#FDB813');
  ellipse(0, 0, size * 2, size);

  // dark orange, tail
  fill('#FF7F50');
  // triangle(x1, y1, x2, y2, x3, y3); (for reference)
  triangle(-size, 0, -size - size / 2, -size / 2, -size - size / 2, size / 2);

  // eye
  fill(255);
  ellipse(size / 2, -size / 6, size / 3, size / 3);
  fill(0);
  ellipse(size / 2, -size / 6, size / 6, size / 6);

  pop();
}


function setup() {
  createCanvas(400, 200);

  // colors for defined, https://htmlcolorcodes.com/
  waterTop = color('#69ade4');
  bottom = color('#015F70');
  seafloor = color('#c2b280');

  createButton("new fish").mousePressed(() => seed++);
}

function draw() {
  randomSeed(seed);

  // call gradient fnct for water depth, see bottom of code
  gradient();

  // ocean floor!
  fill(seafloor);
  noStroke();
  beginShape();
  vertex(0, height);
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    let x = (width * i) / steps;
    // random, checklist:
    // start at bottom of canvas (check)
    // move up for hills (check)
    // more random * = less sporatic, 3 or 4 (check)
    let y = height - random() * random() * random() * (height / 3) - height / 50;
    vertex(x, y);
  }
  vertex(width, height); // took me years. do not comment this out
  endShape(CLOSE);

  // bubbles
  noStroke();
  const bubbles = 20;
  for (let i = 0; i < bubbles; i++) {
    let z = random(0.5, 1.5);  // depth factor
    
    // from example
    let x = width * ((random() + (mouseX / 1000 + millis() / 100000.0) / z) % 1);
    
    // float up
    let ogY = height - random() * height;
    // https://p5js.org/reference/p5/millis/ I really like this! reference
    let upY = (ogY - (millis() / 30) % height + height) % height;

    let s = random(4, 10) / z; // size +- with depth
    // get rid of orange color, transparent+random
    fill(255, 255, 255, 100 + 50 * random());
    ellipse(x, upY, s, s);
  }
  
    // ChatGPT start
  const fishCount = 5;
  for (let i = 0; i < fishCount; i++) {
    let z = random(0.6, 1.5); // depth
    let size = random(8, 16) / z;

    let swimSpeed = 0.3 + random() * 0.5;
    let offset = i * 1000;
    let directionLeft = i % 2 === 0;
    let x = directionLeft
      ? width - ((millis() / (swimSpeed * 10) + offset) % (width + 100))
      : (millis() / (swimSpeed * 10) + offset) % (width + 100) - 50;

    let y = height * 0.3 + noise(i * 100 + millis() / 2000) * height * 0.4;

    drawFish(x, y, size, directionLeft);
  }
    // end ChatGPT
  
}

// easier in a different func, helper
function gradient() {
  // row by row draw lines
  for (let y = 0; y < height; y++) {
    //taken directly from CMPM169, inter & lerpColor
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(waterTop, bottom, inter);
    stroke(c);
    line(0, y, width, y);
  }
}
