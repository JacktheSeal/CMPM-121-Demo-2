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
function getCanvasContext(
  canvas: HTMLCanvasElement,
): CanvasRenderingContext2D {
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Failed to get 2d canvas context");
  }

  return context;
}
const context = getCanvasContext(canvas);

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

// shared data driven rendering
function renderDrawings(
  targetContext: CanvasRenderingContext2D,
  targetCanvas: HTMLCanvasElement,
  queuedDrawings: Drawing[],
  scale: number = 1,
) {
  //save context because export will adjust parameters
  targetContext.save();

  // clear target canvas completely
  targetContext.setTransform(1, 0, 0, 1, 0, 0);
  targetContext.clearRect(
    0,
    0,
    targetCanvas.width,
    targetCanvas.height,
  );

  // ensures that all drawables match the scale of the canvas
  targetContext.setTransform(scale, 0, 0, scale, 0, 0);

  // previously in redraw(), handles rendering of drawn objects
  for (const drawing of queuedDrawings) {
    if (drawing.type === "line") {
      if (drawing.points.length > 1) {
        targetContext.strokeStyle = drawing.color;
        targetContext.beginPath();

        const { x, y } = drawing.points[0];
        targetContext.moveTo(x, y);

        for (const { x, y } of drawing.points) {
          targetContext.lineTo(x, y);
        }

        targetContext.stroke();
      }
    }

    if (drawing.type === "imageStamp") {
      targetContext.drawImage(
        drawing.image,
        drawing.points.x,
        drawing.points.y,
        stampSize,
        stampSize,
      );
    }

    if (drawing.type === "textStamp") {
      targetContext.font = `${stampSize}px sans-serif`;
      targetContext.textAlign = "left";
      targetContext.textBaseline = "top";
      targetContext.fillStyle = "black";

      targetContext.fillText(
        drawing.content,
        drawing.points.x,
        drawing.points.y,
      );
    }
  }

  // restores the original context
  targetContext.restore();
}

// user canvas redraw
function redraw() {
  renderDrawings(context, canvas, drawings);
}

function exportPNG() {
  // we need a seperate canvas because it's going to be scaled
  const exportCanvas = createExportCanvas(2);

  const imageURL = exportCanvas.toDataURL("image/png");

  const link = document.createElement("a");
  link.href = imageURL;
  link.download = "strategy-map.png";

  link.click();
}

// helper function for creating scaled canvas for exports
function createExportCanvas(scale: number): HTMLCanvasElement {
  const exportCanvas = document.createElement("canvas");

  // scales the canvas to desired size
  exportCanvas.width = canvas.width * scale;
  exportCanvas.height = canvas.height * scale;

  const exportContext = getCanvasContext(exportCanvas);

  // filter out current line because it is incomplete
  const committedDrawings = drawings.filter(
    (drawing) => drawing !== currentLine,
  );

  renderDrawings(
    exportContext,
    exportCanvas,
    committedDrawings,
    scale,
  );

  return exportCanvas;
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

// lets you export canvas as png
const exportButton = document.getElementById("exportButton")!;

exportButton.addEventListener("click", () => {
  exportPNG();
});

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
