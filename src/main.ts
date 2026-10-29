import "./styles.css";

const app = document.querySelector<HTMLElement>("#app")!;

const heading = document.createElement("h1");
heading.textContent = "D2 project";

const message = document.createElement("p");
message.textContent = "Your project starts here.";

// canvas setup
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;

// context setup
const context = canvas.getContext("2d");
if (!context) {
  throw new Error("Failed to get 2d canvas context");
}

// setup for memory (redo, undo)
type Point = { x: number; y: number };
const lines: Point[][] = [];
const redoLines: Point[][] = [];
let currentLine: Point[] | null = null;

const cursor = { active: false, x: 0, y: 0 };

// These next 3 Listeners watch the mouse movement

// Starts a new line when mouse is clicked
canvas.addEventListener("pointerdown", (e) => {
  console.log("Pointer down");
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;

  currentLine = [];
  lines.push(currentLine);
  redoLines.splice(0, redoLines.length);
  currentLine.push({ x: cursor.x, y: cursor.y });

  redraw();
});

// Ends the line when the mouse is unclicked
canvas.addEventListener("pointerup", () => {
  cursor.active = false;
  currentLine = null;
});

// Tracks movement of mouse when is converted in redraw to a line
canvas.addEventListener("pointermove", (e) => {
  if (cursor.active && currentLine) {
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    currentLine.push({ x: cursor.x, y: cursor.y });

    redraw();
  }
});

// Series of points becomes a series of line segments which are then drawn in a single stroke
function redraw() {
  // rechecked to make sure its the right type (deno was angry)
  if (!context) {
    throw new Error("Failed to get 2d canvas context");
  }
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (const line of lines) {
    if (line.length > 1) {
      context.beginPath();
      const { x, y } = line[0];
      context.moveTo(x, y);
      for (const { x, y } of line) {
        context.lineTo(x, y);
      }
      context.stroke();
    }
  }
}

//document.body.append(document.createElement("br"));

// adds ability to clear canvas
const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
document.body.append(clearButton);

clearButton.addEventListener("click", () => {
  lines.splice(0, lines.length);
  redoLines.splice(0, redoLines.length);
  redraw();
});

//redraws the whole canvas
const redrawButton = document.createElement("button");
redrawButton.innerHTML = "redraw";
document.body.append(redrawButton);

redrawButton.addEventListener("click", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  setTimeout(() => {
    redraw();
  }, 1000);
});

// undo button addition and listener
const undoButton = document.createElement("button");
undoButton.innerHTML = "undo";
document.body.append(undoButton);

undoButton.addEventListener("click", () => {
  if (lines.length > 0) {
    const line = lines.pop();

    if (line) {
      redoLines.push(line);
      redraw();
    }
  }
});

// redo button addition and listener
const redoButton = document.createElement("button");
redoButton.innerHTML = "redo";
document.body.append(redoButton);

redoButton.addEventListener("click", () => {
  if (redoLines.length > 0) {
    const line = redoLines.pop();
    if (line) {
      lines.push(line);
      redraw();
    }
  }
});

app.append(heading, message, canvas);
