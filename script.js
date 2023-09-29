/*
  Author Fernando Guillen
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
const padding = 12;

async function init() {
  startButton.classList.add("d-none");
  pauseButton.classList.remove("d-none");
  resumeButton.classList.add("d-none");

  await initMediaSource();
  draw();
}

function pause() {
  startButton.classList.add("d-none");
  pauseButton.classList.add("d-none");
  resumeButton.classList.remove("d-none");

  window.cancelAnimationFrame(drawVisual);

  // log output the buffer values
  // for (let i = 0; i < bufferLength; i++) {
  //   console.log(dataArray[i] / 128.0);
  // }

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
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
}

function initCanvas() {
  const canvas = document.getElementById("audio-canvas");
  canvasContext = canvas.getContext("2d");
  canvasWidth = canvas.clientWidth;
  canvasHeight = canvas.clientHeight;

  canvasContext.fillStyle = "rgb(33, 37, 41)";
  canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);

  canvasContext.lineWidth = 6;
  canvasContext.strokeStyle = "rgb(165, 42, 42)";
  canvasContext.beginPath();
  canvasContext.moveTo(0, canvasHeight / 2);
  canvasContext.lineTo(canvasWidth, canvasHeight / 2);
  canvasContext.stroke();

  drawCircle(padding, canvasHeight / 2);
  drawCircle(canvasWidth - padding, canvasHeight / 2);
}


function draw() {
  drawVisual = requestAnimationFrame(draw);
  analyser.getByteTimeDomainData(dataArray);

  canvasContext.fillStyle = "rgb(33, 37, 41)";
  canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);

  canvasContext.lineWidth = 6;
  canvasContext.strokeStyle = "rgb(165, 42, 42)";
  canvasContext.beginPath();

  const sliceWidth = (canvasWidth - (padding * 2)) / bufferLength;
  let x = padding;
  const circlePoints = [];

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0; // half of 256 = unsigned 8 bit
    const y = v * (canvasHeight / 2.0);

    if (i === 0) {
      canvasContext.moveTo(x, y);
      circlePoints.push([x, y]);
    } else {
      canvasContext.lineTo(x, y);
    }

    if (i == bufferLength - 1) {
      circlePoints.push([x, y]);
    }

    x += sliceWidth;
  }

  canvasContext.stroke();

  // Draw circles in the line ends
  circlePoints.forEach((point) => { drawCircle(point[0], point[1]) })
}

function drawCircle(x, y) {
  canvasContext.beginPath();
  canvasContext.arc(x, y, 10, 0, 2 * Math.PI, false);
  canvasContext.fillStyle = "rgb(165, 42, 42)";
  canvasContext.fill();
  canvasContext.stroke();
}

initButtons();
initCanvas();
