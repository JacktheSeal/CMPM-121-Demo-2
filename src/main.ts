import "./styles.css";

// Import images
const squid = new Image();
squid.src = "/squid.png";

const octo = new Image();
octo.src = "/octo.png";

const rainmaker = new Image();
rainmaker.src = "/rainmaker.png";

const splatted = new Image();
splatted.src = "/splatted.png";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

// context setup
const context = canvas.getContext("2d");
if (!context) {
  throw new Error("Failed to get 2d canvas context");
}

// setup for memory (redo, undo)
type Point = { x: number; y: number };
type Line = { type: "line"; points: Point[]; color: string };
type Stamp = { type: "stamp"; points: Point; image: HTMLImageElement };
type Drawing = Line | Stamp;

const drawings: Drawing[] = [];
const redoDrawings: Drawing[] = [];

const stampSize = 30;
let currentLine: Line | null = null;
let currentStamp: Stamp | null = null;
let currentColor: string = "black";
let currentImage: HTMLImageElement = squid;
let currentTool = "line";

const cursor = { active: false, x: 0, y: 0 };

// These next 3 Listeners watch the mouse movement

// Starts a new line when mouse is clicked
canvas.addEventListener("pointerdown", (e) => {
  console.log("Pointer down");
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;

  if (currentTool === "line") {
    currentLine = { type: currentTool, points: [], color: currentColor };
    drawings.push(currentLine);
    currentLine.points.push({ x: cursor.x, y: cursor.y });
  }
  if (currentTool === "stamp") {
    currentStamp = {
      type: currentTool,
      points: { x: cursor.x - stampSize / 2, y: cursor.y - stampSize / 2 },
      image: currentImage,
    };
    drawings.push(currentStamp);
  }

  redoDrawings.splice(0, redoDrawings.length);

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
  for (const drawing of drawings) {
    if (drawing.type === "line") {
      if (drawing.points.length > 1) {
        context.strokeStyle = drawing.color;
        context.beginPath();
        const { x, y } = drawing.points[0];
        context.moveTo(x, y);
        for (const { x, y } of drawing.points) {
          context.lineTo(x, y);
        }
        context.stroke();
      }
    }
    if (drawing.type === "stamp") {
      context.drawImage(
        drawing.image,
        drawing.points.x,
        drawing.points.y,
        stampSize,
        stampSize,
      );
    }
  }
}

//document.body.append(document.createElement("br"));

// adds ability to clear canvas
const clearButton = document.getElementById("clearButton")!;

clearButton.addEventListener("click", () => {
  drawings.splice(0, drawings.length);
  redoDrawings.splice(0, redoDrawings.length);
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
  if (drawings.length > 0) {
    const drawing = drawings.pop();

    if (drawing) {
      redoDrawings.push(drawing);
      redraw();
    }
  }
});

// redo button addition and listener
const redoButton = document.getElementById("redoButton")!;

redoButton.addEventListener("click", () => {
  if (redoDrawings.length > 0) {
    const line = redoDrawings.pop();
    if (line) {
      drawings.push(line);
      redraw();
    }
  }
});

type button = { id: string; color?: string; image?: HTMLImageElement };
type buttonGroup = { type: string; buttons: button[] };

const buttons: buttonGroup[] = [{
  type: "colorButtons",
  buttons: [
    { id: "blackButton", color: "black" },
    { id: "yellowButton", color: "#d7de15" },
    { id: "blueButton", color: "#1537FF" },
  ],
}, {
  type: "stampButtons",
  buttons: [
    { id: "squidButton", image: squid },
    { id: "octoButton", image: octo },
    { id: "rainmakerButton", image: rainmaker },
    { id: "splattedButton", image: splatted },
  ],
}];

// Loops through array and object data above and creates buttons with behavior
for (const group of buttons) {
  if (group.type === "colorButtons") {
    for (const button of group.buttons) {
      document.getElementById(button.id)!.addEventListener("click", () => {
        if (button.color !== undefined) currentColor = button.color;
        currentTool = "line";
      });
    }
  }

  if (group.type === "stampButtons") {
    for (const button of group.buttons) {
      document.getElementById(button.id)!.addEventListener("click", () => {
        if (button.image !== undefined) currentImage = button.image;
        currentTool = "stamp";
      });
    }
  }
}
