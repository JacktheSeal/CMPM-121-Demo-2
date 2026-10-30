# Splatoon Strategizer

## Link to Working Page

<https://jacktheseal.github.io/CMPM-121-Demo-2/>

## What is it?

This app is a tool which is intended to allow professional teams who play the game Splatoon to easily draw up strategic plans and share them with their team before matches. There are different colors to coordinate between enemy and team strategies, and also several default stickers to portray different elements of a game state like deaths and objectives. Coaches and players can also add their own stamps to display custom information like player names among other things.

## How to Operate

The app runs off a GitHub pages deployment. If you want to be able to work on the project and play offline, see below in "Run/Build Instructions". There are multiple tools at your disposal including different line drawing options, as well as several premade stamps. The app also gives users the ability to create their own text or emoji stamps for personal use. When finished working on the app, the user can export their work as a PNG using the Export button.

## Run/Build Instructions

This is a minimal TypeScript/Vite browser app with Deno checks and GitHub Pages deployment. To run this project locally, you MUST have deno and vite installed. Start by creating a copy of the repo using the template function on Github, then clone it locally onto your machine. Inside the project, you can then run "deno task setup" to configure deno to your repo, then use "deno task dev" in your terminal targeted at the project location. This should open a web page which will display the game locally. Once you get to this point, you can work offline if you want. To build the game for the web, navigate to Actions-> Deploy to GitHub Pages-> Run workflow-> then select "Use workflow from: main" (or another branch if you're working on it), then click Run workflow again. This should take a few seconds/minutes, and should display a green checkmark when successfully complete. Afterwards, a link to your playable web game should become available if you click on the job.

## Developer Example: Adding a Rectangle Tool

For future developers of this project, this is an example of how you might add a new feature. In this case rectangles are not yet implemented, but walking through the process helps demonstrate how to follow the app's data-driven drawable architecture.

The project's data driven design functions around this drawing type:

`type Drawing = Line | ImageStamp | TextStamp;`

### Define the New Drawing Type in main.ts

As you can see, the kinds of drawables are the different types of drawings. So, if you wanted to add a new type of drawing like a rectangle, you'd first have to define a rectangle type, and add it as a type of drawing. You'll also want to add rectangle as an option for currentTool for later use.

### Add the tool and its interface to index.html and main.ts

Next, you'd want to create a rectangle tool button inside of `index.html`. You can copy the structure of the current color buttons to do so. Once you have a button, you'd then want to create an EventListener in `main.ts` that updates current tool to the rectangle one when your button is pressed.

PLEASE NOTE: For both methods you'll also need to update index.html since we have the functionality of buttons and the appearance of buttons split across index and main in accordance with Adam Smith's in-class advice.

### Handle user input onto the canvas

After adding the tool, you'll want to find the portion of code which listens to the user's pointer actions. In particular you'll want to add a rectangle option inside of pointerdown, pointermove, and pointerup. Pointerdown would start the rectangle, pointermove would update the dimensions of the rectangle as the user continued drawing, and then pointerup would finish the rectangle.

### Add rectangle drawing to renderer

The `renderDrawings` function is responsible for drawing all of the objects on screen. It works by checking the type of drawing that is being given to it, then rendering it with its given parameters. Thus, you have to add another conditional which works with rectangles and their parameters. Don't worry about having to also add this in the export function, as the export function simply calls `renderDrawings` using our data-driven behavior!

### Existing Undo, Redo, and Export Functionality

The existing undo and redo functionality should work on its own, provided rectangles are stored as drawings. Undo moves the most recent drawing from `drawings` into `redoDrawings`, while redo restores it.

PNG exporting should also work without additional changes. The `exportPNG()` function uses `createExportCanvas()`, which calls `renderDrawings()` to render drawing objects. Thus, once rectangle rendering is implemented in `renderDrawings()`, rectangles should automatically work in exports.

### Important Distinction

Pointerdown and the other pointer listeners handle creating and updating drawing data, while renderDrawings() handles displaying that data. Keeping these responsibilities separate allows new drawable types to work consistently across the canvas, undo/redo, and export systems.

## Credits

Made by Jack Seales and Charlotte Boren

Tooling adapted from the [CMPM 121 Fall 2026 D1 starter](https://github.com/ucsc-cmpm-121-f26/d1-starter/tree/d949e744b0f9fb7c133a5316f86f2b7fe54529ad), derived from the [S01 starter](https://github.com/ucsc-cmpm-121-f26/s01-starter/tree/8974888efb6537be82e8eb069db139ea885039da). Those repositories have no explicit repository license; no new license is assigned to that material. The D2 scaffold was authored with OpenCode/OpenAI GPT-6.1 Sol assistance. Dependencies retain their respective licenses.
