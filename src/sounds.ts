// Returns an object with key as pathway and value as url
const soundsObject = import.meta.glob("./assets/sounds/*.wav", {
  eager: true,
  query: "?url",
});

// Makes an array of arrays containing each key value pair [[key, value], [key, value]]
const soundsArray = Object.entries(soundsObject);

export const sounds: { [key: string]: HTMLAudioElement } = {};

soundsArray.forEach((sound) => {
  // Remove filepath info and leave just file name
  let slicedSoundName = sound[0].slice(16);
  slicedSoundName = slicedSoundName.slice(0, -4);

  // Create sound HTML element
  const soundElement = document.createElement("AUDIO") as HTMLAudioElement;
  soundElement.src = sound[1];

  sounds[slicedSoundName] = soundElement;
});

export function playSound(soundName: string) {
  sounds[soundName].currentTime = 0;
  sounds[soundName].play();
}
