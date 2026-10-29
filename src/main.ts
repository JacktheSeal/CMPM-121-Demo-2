import "./styles.css";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

// context setup
const context = canvas.getContext("2d");
if (!context) {
  throw new Error("Failed to get 2d canvas context");
}

// setup for memory (redo, undo)
type Point = { x: number; y: number };
type Line = { points: Point[]; color: string };
const lines: Line[] = [];
const redoLines: Line[] = [];
let currentLine: Line | null = null;
let currentColor: string = "black";

const cursor = { active: false, x: 0, y: 0 };

// These next 3 Listeners watch the mouse movement

// Starts a new line when mouse is clicked
canvas.addEventListener("pointerdown", (e) => {
  console.log("Pointer down");
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;

  currentLine = { points: [], color: currentColor };
  lines.push(currentLine);
  redoLines.splice(0, redoLines.length);
  currentLine.points.push({ x: cursor.x, y: cursor.y });

  redraw();
});

// Ends the line when the mouse is unclicked
canvas.addEventListener("pointerup", () => {
  cursor.active = false;
  currentLine = null;
});

// Ends the line when the mouse leaves the canvas
canvas.addEventListener("pointerleave", () => {
  cursor.active = false;
  currentLine = null;
});

// Tracks movement of mouse when is converted in redraw to a line
canvas.addEventListener("pointermove", (e) => {
  if (cursor.active && currentLine) {
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    currentLine.points.push({ x: cursor.x, y: cursor.y });

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
    if (line.points.length > 1) {
      context.strokeStyle = line.color;
      context.beginPath();
      const { x, y } = line.points[0];
      context.moveTo(x, y);
      for (const { x, y } of line.points) {
        context.lineTo(x, y);
      }
      context.stroke();
    }
  }
}

//document.body.append(document.createElement("br"));

// adds ability to clear canvas
const clearButton = document.getElementById("clearButton")!;

clearButton.addEventListener("click", () => {
  lines.splice(0, lines.length);
  redoLines.splice(0, redoLines.length);
  redraw();
});

//redraws the whole canvas
const redrawButton = document.getElementById("redrawButton")!;

redrawButton.addEventListener("click", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  setTimeout(() => {
    redraw();
  }, 1000);
});

// undo button addition and listener
const undoButton = document.getElementById("undoButton")!;

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
const redoButton = document.getElementById("redoButton")!;

redoButton.addEventListener("click", () => {
  if (redoLines.length > 0) {
    const line = redoLines.pop();
    if (line) {
      lines.push(line);
      redraw();
    }
  }
});

const blackButton = document.getElementById("blackButton")!;

blackButton.addEventListener("click", () => {
  currentColor = "black";
});

const yellowButton = document.getElementById("yellowButton")!;

yellowButton.addEventListener("click", () => {
  currentColor = "#d7de15";
});

const blueButton = document.getElementById("blueButton")!;

blueButton.addEventListener("click", () => {
  currentColor = "#1537FF";
});
