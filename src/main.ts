import "./style.css";

const IMAGE_WIDTH = 250;
const MONOSPACE_FONT_ASPECT_RATIO = 0.6;

function convertDecimalToASCII(decimal: number): string {
  const asciiChars = " .:-=o*#$@";
  const asciiCharsLength = asciiChars.length;
  const index = Math.min(
    Math.floor((decimal / 255) * asciiCharsLength),
    asciiCharsLength - 1
  );

  return asciiChars[index];
}

function convertImageDataToAscii(imageData: ImageData) {
  let asciiString = "";

  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    const avg = (r + g + b) / 3;
    asciiString += convertDecimalToASCII(avg);

    if ((i / 4) % IMAGE_WIDTH === 0) {
      asciiString += "\n";
    }
  }

  return asciiString;
}

function getVideoFrame(video: HTMLVideoElement): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = IMAGE_WIDTH;
  canvas.height =
    video.videoHeight *
    (IMAGE_WIDTH / video.videoWidth) *
    MONOSPACE_FONT_ASPECT_RATIO;

  const ctx = canvas.getContext("2d");

  ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
  return ctx!.getImageData(0, 0, canvas.width, canvas.height);
}

let animationFrameId: number | null = null;
let isPlaying = false;

function playVideoInAscii(videoUrl: string, outputElement: HTMLPreElement) {
  const video = document.getElementById("videoOutput") as HTMLVideoElement;
  const corsProxy = "https://cors-anywhere.herokuapp.com/";
  video.src = `${corsProxy}${videoUrl}`;
  video.width = IMAGE_WIDTH;
  video.crossOrigin = "anonymous";
  video.style.display = "none";

  video.onloadedmetadata = () => {
    isPlaying = true;
    playPauseVideo();
  };
}

function playPauseVideo() {
  const video = document.getElementById("videoOutput") as HTMLVideoElement;

  if (isPlaying) {
    video.play();
    updateAsciiFrame();
  } else {
    video.pause();
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }
  }
}

function updateAsciiFrame() {
  const video = document.getElementById("videoOutput") as HTMLVideoElement;
  const asciiOutput = document.querySelector<HTMLPreElement>("#asciiOutput");

  if (asciiOutput) {
    const frame = getVideoFrame(video);
    const asciiFrame = convertImageDataToAscii(frame);
    asciiOutput.textContent = asciiFrame;
  }

  if (isPlaying) {
    animationFrameId = requestAnimationFrame(updateAsciiFrame);
  }
}

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <div id="controls">
      <input type="text" id="videoInput" placeholder="Enter Video URL" class="width:100%;display:block;">
      <button id="playButton">Play</button>
      <button id="pauseButton">Pause</button>
    </div>
    <pre id="asciiOutput" style="font-family: monospace; font-size: 8px; line-height: 8px; background-color: black; color: white; padding: 10px;"></pre>
    <video id="videoOutput" style="display: none;"></video>
`;

document
  .querySelector<HTMLButtonElement>("#playButton")
  ?.addEventListener("click", () => {
    const asciiOutput = document.querySelector<HTMLPreElement>("#asciiOutput");
    const videoInput = document.querySelector<HTMLInputElement>("#videoInput");

    if (asciiOutput && videoInput) {
      const videoId = videoInput.value;
      playVideoInAscii(videoId, asciiOutput);
    }
  });

document
  .querySelector<HTMLButtonElement>("#pauseButton")
  ?.addEventListener("click", () => {
    isPlaying = !isPlaying;
    playPauseVideo();
  });
