import "./styles.css";

const app = document.querySelector<HTMLElement>("#app")!;

const heading = document.createElement("h1");
heading.textContent = "D2 project";

const message = document.createElement("p");
message.textContent = "Your project starts here.";

//canvas setup
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;

const context = canvas.getContext("2d");

if (!context) {
  throw new Error("Failed to get 2d canvas context");
}

const cursor = { active: false, x: 0, y: 0 };

canvas.addEventListener("pointerdown", (e) => {
  console.log("Pointer down");
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
});

canvas.addEventListener("pointerup", () => {
  cursor.active = false;
});

canvas.addEventListener("pointermove", (e) => {
  if (cursor.active) {
    context.beginPath();
    context.moveTo(cursor.x, cursor.y);
    context.lineTo(e.offsetX, e.offsetY);
    context.stroke();
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
  }
});

//adds ability to clear canvas
const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
document.body.append(clearButton);
clearButton.addEventListener("click", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
});

app.append(heading, message, canvas);
