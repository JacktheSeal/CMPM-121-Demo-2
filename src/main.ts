import "./styles.css";

// Import images
import squid from "./assets/squid.png?no-inline";
import octo from "./assets/octo.png?no-inline";
import rainmaker from "./assets/rainmaker.png?no-inline";
import splatted from "./assets/splatted.png?no-inline";

const squidImg = document.createElement("img");
squidImg.src = squid;

const octoImg = document.createElement("img");
octoImg.src = octo;

const rainmakerImg = document.createElement("img");
rainmakerImg.src = rainmaker;

const splattedImg = document.createElement("img");
splattedImg.src = splatted;

// canvas is where user can draw
const canvas = document.getElementById("canvas") as HTMLCanvasElement;

// context setup
const context = canvas.getContext("2d");
if (!context) {
  throw new Error("Failed to get 2d canvas context");
}

// setup for shared stamp behavior
type StampTool = {
  id: string;
  name: string;
  image?: HTMLImageElement;
  content?: string;
};

// where you can put preset (hardcoded) stamps
const stampTools: StampTool[] = [
  { id: "squid", name: "Squid", image: squidImg },
  { id: "octo", name: "Octo", image: octoImg },
  { id: "rainmaker", name: "Rainmaker", image: rainmakerImg },
  { id: "splatted", name: "Splatted", image: splattedImg },
];

// contains all of the stamps (will be used to render buttons)
const stampPalette = document.getElementById("stampPalette")!;

// renders stamp buttons using palette
function renderStampPalette() {
  stampPalette.replaceChildren();

  for (const tool of stampTools) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = tool.content ?? tool.name;

    button.title = tool.name;

    button.addEventListener("click", () => {
      currentStampTool = tool;
      currentTool = "stamp";
    });

    stampPalette.append(button);
  }
}

// initial render for all of the presets
renderStampPalette();

// type definitions for all of the drawables
type Point = { x: number; y: number };
type Line = { type: "line"; points: Point[]; color: string };
type ImageStamp = {
  type: "imageStamp";
  points: Point;
  image: HTMLImageElement;
};
type TextStamp = {
  type: "textStamp";
  points: Point;
  content: string;
};
type Drawing = Line | ImageStamp | TextStamp;

// arrays used for storing drawings in memory
const drawings: Drawing[] = [];
const redoDrawings: Drawing[] = [];

// defaults
const stampSize = 30;
let currentLine: Line | null = null;
let currentColor: string = "black";
let currentStampTool: StampTool = stampTools[0];
let currentTool: "line" | "stamp" = "line";

// position will be used to place all drawables
const cursor = { active: false, x: 0, y: 0 };

// These next 4 listeners watch the mouse movement

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
    if (currentStampTool.image) {
      const stamp: ImageStamp = {
        type: "imageStamp",
        points: {
          x: cursor.x - stampSize / 2,
          y: cursor.y - stampSize / 2,
        },
        image: currentStampTool.image,
      };

      drawings.push(stamp);
    } else if (currentStampTool.content) {
      const stamp: TextStamp = {
        type: "textStamp",
        points: {
          x: cursor.x - stampSize / 2,
          y: cursor.y - stampSize / 2,
        },
        content: currentStampTool.content,
      };

      drawings.push(stamp);
    }
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
  // rechecked to make sure its the right type (deno gets angry otherwise)
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
    if (drawing.type === "imageStamp") {
      context.drawImage(
        drawing.image,
        drawing.points.x,
        drawing.points.y,
        stampSize,
        stampSize,
      );
    }

    if (drawing.type === "textStamp") {
      context.font = `${stampSize}px sans-serif`;
      context.textAlign = "left";
      context.textBaseline = "top";
      context.fillStyle = "black";

      context.fillText(
        drawing.content,
        drawing.points.x,
        drawing.points.y,
      );
    }
  }
}

// Jack left the other buttons as is because they didnt immediately require user creation design
type button = { id: string; color?: string; image?: HTMLImageElement };
type buttonGroup = { type: string; buttons: button[] };

const buttons: buttonGroup[] = [{
  type: "colorButtons",
  buttons: [
    { id: "blackButton", color: "black" },
    { id: "yellowButton", color: "#d7de15" },
    { id: "blueButton", color: "#1537FF" },
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
}

//Creates elements for user created stamps (maybe should be moved into index)
const createStampForm = document.getElementById(
  "createStampForm",
) as HTMLFormElement;

const stampNameInput = document.getElementById(
  "stampName",
) as HTMLInputElement;

const stampContentInput = document.getElementById(
  "stampContent",
) as HTMLInputElement;

createStampForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = stampNameInput.value.trim();
  const content = stampContentInput.value.trim();

  if (!name || !content) {
    return;
  }

  //id is unique!
  const newTool: StampTool = {
    id: crypto.randomUUID(),
    name,
    content,
  };

  stampTools.push(newTool);

  renderStampPalette();

  stampNameInput.value = "";
  stampContentInput.value = "";
});

// PERMANENT BUTTONS (Canvas Functions, not Tools)
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
