// project.js - Generative worlds using tilesets
// Author: Scott Miller
// Date: 4/22/2025

// p2_base

/* exported preload, setup, draw, placeTile */

/* global generateGrid drawGrid */

let seed = 0;
let tilesetImage;
let currentGrid = [];
let numRows, numCols;

function preload() {
  tilesetImage = loadImage("../../img/tilesetP8.png");
}

function reseed() {
  seed = (seed | 0) + 1109;
  randomSeed(seed);
  noiseSeed(seed);
  select("#seedReport").html("seed " + seed);
  regenerateGrid();
}

function regenerateGrid() {
  select("#asciiBox").value(gridToString(generateGrid(numCols, numRows)));
  reparseGrid();
}

function reparseGrid() {
  currentGrid = stringToGrid(select("#asciiBox").value());
}

function gridToString(grid) {
  let rows = [];
  for (let i = 0; i < grid.length; i++) {
    rows.push(grid[i].join(""));
  }
  return rows.join("\n");
}

function stringToGrid(str) {
  let grid = [];
  let lines = str.split("\n");
  for (let i = 0; i < lines.length; i++) {
    let row = [];
    let chars = lines[i].split("");
    for (let j = 0; j < chars.length; j++) {
      row.push(chars[j]);
    }
    grid.push(row);
  }
  return grid;
}

function setup() {
  console.log("canvasContainer:", select("#canvas-container"));
  numCols = select("#asciiBox").attribute("rows") | 0;
  numRows = select("#asciiBox").attribute("cols") | 0;

  createCanvas(16 * numCols, 16 * numRows).parent("canvasContainer");
  select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;

  select("#reseedButton").mousePressed(reseed);
  select("#asciiBox").input(reparseGrid);
  
  createButton("Toggle Mode")
  .parent("canvasContainer")
  .mousePressed(() => {
    toggleMode();
    regenerateGrid();
  });

  reseed();
}





function draw() {
  randomSeed(seed);
  drawGrid(currentGrid);
}

function placeTile(i, j, ti, tj) {
  image(tilesetImage, 16 * j, 16 * i, 16, 16, 8 * ti, 8 * tj, 8, 8);
}


// p2_solution

let currMode = "overworld";

// scene change, done... errors
function toggleMode() {
  currMode = currMode === "overworld" ? "dungeon" : "overworld";
}

function generateGrid(col, row) {
  if (currMode === "dungeon") {
    return generateDungeon(col, row);
  } else {
    return generateOverworld(col, row);
  }
}

function generateOverworld(col, row) {
  let grid = [];

  for (let i = 0; i < row; i++) {
    let row = [];
    for (let j = 0; j < col; j++) {
      // water and grass variation, 0.1 or 0.2 i would stay 0.1
      let n = noise(i * 0.1, j * 0.1);
      row.push(n < 0.4 ? "~" : ".");
    }
    grid.push(row);
  }

  return grid;
}

function generateDungeon(col, row) {
  let grid = [];

  // push walls
  for (let i = 0; i < row; i++) {
    let row = [];
    for (let j = 0; j < col; j++) {
      row.push("#");
    }
    grid.push(row);
  }

  // this is for handling multiple rooms
  let rooms = [];
  let numRooms = floor(random(4, 7));

  for (let n = 0; n < numRooms; n++) {
    let roomW = floor(random(5, 10));
    let roomH = floor(random(5, 8));
    let x = floor(random(1, col - roomW - 1));
    let y = floor(random(1, row - roomH - 1));

    // spent too long figuring this out -- ChatGPT help

    // ChatGPT help START

    // this function carves out the room
    for (let i = y; i < y + roomH; i++) {
      for (let j = x; j < x + roomW; j++) {
        grid[i][j] = ".";
      }
    }

    // this keeps the room center, allows for multiple rooms to connect... never seen this
    rooms.push({ x: floor(x + roomW / 2), y: floor(y + roomH / 2) });
  }

  // IMPORTANT: connects each room to the prev one
  for (let i = 1; i < rooms.length; i++) {
    let prev = rooms[i - 1];
    let curr = rooms[i];

    if (random() < 0.5) {
      // horizontal then vertical
      carveHorzHall(grid, prev.x, curr.x, prev.y);
      carveVertHall(grid, prev.y, curr.y, curr.x);
    } else {
      // vertical then horizontal
      carveVertHall(grid, prev.y, curr.y, prev.x);
      carveHorzHall(grid, prev.x, curr.x, curr.y);
    }
  }

  return grid;
}

// this is where a lot of the real variation is
// chooses how the rooms will be carved, in which direction. take note

function carveHorzHall(grid, x1, x2, y) {
  for (let x = min(x1, x2); x <= max(x1, x2); x++) {
    grid[y][x] = ".";
  }
}

function carveVertHall(grid, y1, y2, x) {
  for (let y = min(y1, y2); y <= max(y1, y2); y++) {
    grid[y][x] = ".";
  }
}

// ChatGPT help END

function gridCheck(grid, i, j, target) {
  // had to write down on paper to figure this one :(
  return (
    i >= 0 &&
    i < grid.length &&
    j >= 0 &&
    j < grid[0].length &&
    grid[i][j] === target
  );
}

function gridCode(grid, i, j, target) {
  let north = gridCheck(grid, i - 1, j, target) ? 1 : 0;
  let south = gridCheck(grid, i + 1, j, target) ? 1 : 0;
  let east = gridCheck(grid, i, j + 1, target) ? 1 : 0;
  let west = gridCheck(grid, i, j - 1, target) ? 1 : 0;
  // reverse engineered from slide solution
  return (north << 0) + (south << 1) + (east << 2) + (west << 3);
}

function drawContext(grid, i, j, target, dti, dtj) {
  // from slides except "code"
  let code = gridCode(grid, i, j, target);
  let [tiOffset, tjOffset] = lookup[code];
  placeTile(i, j, dti + tiOffset, dtj + tjOffset);
}

const lookup = [
  [1, 1], // 0: by itself
  [1, 0], // 1: N only
  [1, 2], // 2: S only
  [1, 1], // 3: N + S
  [2, 1], // 4: E only
  [2, 0], // 5: N + E
  [2, 2], // 6: S + E
  [2, 1], // 7: N + S + E
  [0, 1], // 8: W only
  [0, 0], // 9: N + W
  [0, 2], // 10: S + W
  [0, 1], // 11: N + S + W
  [1, 1], // 12: E + W
  [1, 0], // 13: N + E + W
  [1, 2], // 14: S + E + W
  [1, 1], // 15: all 4
];

function drawGrid(grid) {
  background(128);

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      let code = grid[i][j];

      if (currMode === "dungeon") {
        if (code === "#") {
          // wall next to a floor tile ?
          const hasFloor =
            gridCheck(grid, i - 1, j, ".") ||
            gridCheck(grid, i + 1, j, ".") ||
            gridCheck(grid, i, j - 1, ".") ||
            gridCheck(grid, i, j + 1, ".");

          // reg wall
          placeTile(i, j, 1, 21);

          // wall stuff
          if (random() < 0.004) placeTile(i, j, 1, 22);
          if (random() < 0.04) placeTile(i, j, 1, 23);
          if (random() < 0.01) placeTile(i, j, 11, 22);
          if (random() < 0.004) placeTile(i, j, 16, 24);

          // door only if next to floor
          if (hasFloor && random() < 0.02) {
            placeTile(i, j, 15, 25); // door
          }
          if (hasFloor && random() < 0.02) {
            placeTile(i, j, 26, 25); // door2
          }
        } else if (code === ".") {
          placeTile(i, j, 21, 21); // floor stuff
          if (random() < 0.03) placeTile(i, j, 21, 22);
          if (random() < 0.001) placeTile(i, j, 0, 28);
          if (random() < 0.03) placeTile(i, j, 28, 0);
        }
      } else {
        if (code === "~") {
          //placeTile(i, j, 3, 13); // water, do not touch
          animateTile(i, j, 3, 13); // animated water shimmer
          if (random() < 0.01) placeTile(i, j, 14, 15); // rock, sometimes (water)
        } else if (code === ".") {
          const cliff = gridCode(grid, i, j, "~");
          if (cliff !== 0) placeTile(i, j, 3, 13);

          // array, 0 most likely
          //couldn't figure out any other way for grass variation
          if ([0, 1, 2, 4, 8].includes(cliff)) {
            let grassOptions = [0, 0, 0, 0, 0, 0, 0, 1, 2, 3];
            let ti = random(grassOptions) | 0;
            placeTile(i, j, ti, 0);
          } else {
            drawContext(grid, i, j, ".", 9, 0);
          }

          //if (random() < 0.1) placeTile(i, j, 18, 2); // tree
          if (random() < 0.1) {
            let sway = map(mouseX, 0, width, -1, 1);
            let tx = 18 + floor(sway);
            // constrain https://p5js.org/reference/p5/constrain/ , good reference
            // did not know this was a function, if u need mouseX to stay in a sort of 
            // safe-zone, utilize this going forward
            placeTile(i, j, constrain(tx, 17, 19), 2);
          }

          if (random() < 0.001) placeTile(i, j, 14, 6); // rock (grass)
          if (random() < 0.003) placeTile(i, j, 27, 0); // rock (grass)
        }
      }
    }
  }
}

function animateTile(i, j, ti, tj) {
  let offset = floor(sin(millis() / 500 + i + j) * 1.5);
  // I used ChatGPT for the below code
  image(
    tilesetImage,
    16 * j,
    16 * i,
    16,
    16,
    8 * (ti + offset - 1),
    8 * tj,
    8,
    8
  );
}
