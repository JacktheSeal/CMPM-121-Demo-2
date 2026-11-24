// Returns an object with key as pathway and value as url
const soundsObject = import.meta.glob("./assets/sounds/*.wav", {
  eager: true,
  query: "?url",
  import: "default",
});

// Makes an array of arrays containing each key value pair [[key, value], [key, value]]
const soundsArray = Object.entries(soundsObject);

const sounds: { [key: string]: HTMLAudioElement } = {};

// Create object with each key as file name without path, and value as audio HTML Element
soundsArray.forEach((sound) => {
  // Remove filepath info and leave just file name
  let slicedSoundName = sound[0].slice(16);
  slicedSoundName = slicedSoundName.slice(0, -4);

  // Create audio HTML element
  const soundElement = document.createElement("AUDIO") as HTMLAudioElement;
  soundElement.src = sound[1];

  sounds[slicedSoundName] = soundElement;
});

export function playSound(soundName: string, volume = 0.5) {
  if (sounds[soundName] === undefined) throw new Error("Sound does not exist");
  sounds[soundName].currentTime = 0;
  sounds[soundName].volume = volume;
  sounds[soundName].play();
}

export function playPenSound(continueLoop: boolean) {
  if (continueLoop) {
    sounds["Pen"].loop = true;
    playSound("Pen", 0.2);
  }
  if (!continueLoop) {
    sounds["Pen"].loop = false;
    sounds["Pen"].pause();
  }
}
