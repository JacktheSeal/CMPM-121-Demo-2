import "./styles.css";

const app = document.querySelector<HTMLElement>("#app")!;

const heading = document.createElement("h1");
heading.textContent = "D2 project";

const message = document.createElement("p");
message.textContent = "Your project starts here.";

const canvas = document.createElement("canvas");

app.append(heading, message, canvas);

let isDrawing = false;

canvas.addEventListener("pointerdown", () => {
  console.log("Pointer down");
  isDrawing = true;
});

canvas.addEventListener("pointerup", () => {
  console.log("Pointer up");
  isDrawing = false;
});

canvas.addEventListener("pointermove", () => {
  if (isDrawing) {
    // Draw
  }
});
