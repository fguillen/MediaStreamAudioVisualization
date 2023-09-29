/*
  Guided by: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
*/



let analyser;
let canvasContext;
let dataArray;
let canvasWidth;
let canvasHeight;
let bufferLength;
let startButton;
let pauseButton;
let resumeButton;
let drawVisual;

async function init() {
  startButton.classList.add("d-none");
  pauseButton.classList.remove("d-none");
  resumeButton.classList.add("d-none");

  await initMediaSource();
  initCanvas();
  draw();
}

function pause() {
  startButton.classList.add("d-none");
  pauseButton.classList.add("d-none");
  resumeButton.classList.remove("d-none");

  window.cancelAnimationFrame(drawVisual);

  for (let i = 0; i < bufferLength; i++) {
    console.log(dataArray[i] / 128.0);
  }

}

function resume() {
  startButton.classList.add("d-none");
  pauseButton.classList.remove("d-none");
  resumeButton.classList.add("d-none");

  draw();
}

function initButtons() {
  startButton = document.getElementById("start-button");
  startButton.addEventListener("click", init);

  pauseButton = document.getElementById("pause-button");
  pauseButton.addEventListener("click", pause);

  resumeButton = document.getElementById("resume-button");
  resumeButton.addEventListener("click", resume);
}

async function initMediaSource() {
  const audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();

  const micStream =
    await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

  const source = audioContext.createMediaStreamSource(micStream);
  source.connect(analyser);

  analyser.fftSize = 512; // use 2048 for more definition
  console.log("analyser.fftSize: ", analyser.fftSize);
  console.log("analyser.frequencyBinCount: ", analyser.frequencyBinCount);
  bufferLength = analyser.frequencyBinCount;
  // bufferLength = 1;
  dataArray = new Uint8Array(bufferLength);
}

function initCanvas() {
  const canvas = document.getElementById("audio-canvas");
  canvasContext = canvas.getContext("2d");
  canvasWidth = canvas.clientWidth;
  canvasHeight = canvas.clientHeight;

  console.log("canvasWidth: ", canvasWidth);
  console.log("canvasHeight: ", canvasHeight);

  canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
}


function draw() {
  drawVisual = requestAnimationFrame(draw);
  analyser.getByteTimeDomainData(dataArray);

  canvasContext.fillStyle = "rgb(33, 37, 41)";
  canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);

  canvasContext.lineWidth = 6;
  canvasContext.strokeStyle = "rgb(165, 42, 42)";
  canvasContext.beginPath();

  // Borders
  // canvasContext.moveTo(0, 0);
  // canvasContext.lineTo(canvasWidth, 0);
  // canvasContext.lineTo(canvasWidth, canvasHeight);
  // canvasContext.lineTo(0, canvasHeight);
  // canvasContext.lineTo(0, 0);

  const sliceWidth = (canvasWidth * 1.0) / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0; // half of 256 = unsigned 8 bit
    const y = v * (canvasHeight / 2.0);

    if (i === 0) {
      canvasContext.moveTo(x, y);
    } else {
      canvasContext.lineTo(x, y);
    }

    x += sliceWidth;
  }

  // canvasContext.lineTo(canvasWidth, canvasHeight / 2);
  canvasContext.stroke();
}

initButtons();
