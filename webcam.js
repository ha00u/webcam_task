const captureButton = document.getElementById('captureButton');
const recordButton = document.getElementById('recordButton');
const stopButton = document.getElementById('stopButton');
const pauseButton = document.getElementById('pauseButton');
const playButton = document.getElementById('playButton');
const webcamVideo = document.getElementById('webcamVideo');

let mediaStream;
let mediaRecorder;
let recordedChunks = [];

captureButton.addEventListener('click', openWebcam);
recordButton.addEventListener('click', startRecording);
stopButton.addEventListener('click', stopWebcam);
pauseButton.addEventListener('click', pauseRecording);
playButton.addEventListener('click', playRecording);

function openWebcam() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      mediaStream = stream;
      webcamVideo.srcObject = stream;
    })
    .catch((error) => {
      console.error('Error accessing webcam:', error);
    });
}

function startRecording() {
  if (mediaStream) {
    mediaRecorder = new MediaRecorder(mediaStream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      recordedChunks = [];
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    };

    mediaRecorder.start();
    recordButton.disabled = true;
    stopButton.disabled = false;
    pauseButton.disabled = false;
  }
}

function stopWebcam() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
    webcamVideo.srcObject = null;
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      recordButton.disabled = false;
      stopButton.disabled = true;
      pauseButton.disabled = true;
    }
  }
}

function pauseRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.pause();
    pauseButton.innerText = 'Resume';
  } else if (mediaRecorder && mediaRecorder.state === 'paused') {
    mediaRecorder.resume();
    pauseButton.innerText = 'Pause';
  }
}

function playRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    const superBuffer = new Blob(recordedChunks, { type: 'video/webm' });
    webcamVideo.src = null;
    webcamVideo.srcObject = null;
    webcamVideo.src = window.URL.createObjectURL(superBuffer);
    webcamVideo.controls = true;
    webcamVideo.play();
  }
}
