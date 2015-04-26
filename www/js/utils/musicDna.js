/**
 * Copyright 2014 Google Inc. All Rights Reserved.
 * For licensing see http://lab.aerotwist.com/canvas/music-dna/LICENSE
 */

function MusicDNA() {

  var DATA_SIZE = 1024;

  var audioParser = new AudioParser(DATA_SIZE, onAudioDataParsed);
  var audioRenderer = new AudioRenderer();
  var audioData = new Uint8Array(DATA_SIZE);
  var audioDuration = 1;
  var audioTime = 0;
  var audioPlaying = false;
  var time = document.getElementById('time');
  var fileName = '';

  function onRenderComplete(imageData) {

    imageData = imageData.replace(/^data:image\/png;base64,/, '');

    var imageBinaryString = atob(imageData);
    var imageBinaryData = new Uint8Array(imageBinaryString.length);

    // Feels like there should be a nicer way to do this :-/
    for (var i = 0; i < imageBinaryString.length; i++)
      imageBinaryData[i] = imageBinaryString.charCodeAt(i);

    var blob = new Blob([imageBinaryData.buffer],{'type': 'image/png'});

    getDownload.classList.add('visible');
    getDownload.href = window.URL.createObjectURL(blob);
    getDownload.download = fileName;

    generateProgress.classList.remove('visible');
  }

  function onFileRead(evt) {
    audioParser.parseArrayBuffer(evt.target.result);
  }

  function onAudioDataParsed(buffer) {

    audioDuration = buffer.duration;
    audioPlaying = true;

    audioRenderer.clear();
  }

  function updateAndRender() {

    audioParser.getAnalyserAudioData(audioData);
    audioTime = audioParser.getTime() / audioDuration;

    if (audioPlaying) {
      audioRenderer.render(audioData, audioTime);
      time.style.width = (audioTime * 100).toFixed(1) + '%';

      if (audioTime >= 1) {
        saveAndDownload.classList.add('visible');
      } else {
        saveAndDownload.classList.remove('visible');
      }
    }

    requestAnimFrame(updateAndRender);
  }

  this.setName = function (name) {
    fileName = name;
  };

  this.parse = function (file) {
    var fileReader = new FileReader();
    fileReader.addEventListener('loadend', onFileRead);
    fileReader.readAsArrayBuffer(file);
  };

  requestAnimFrame(updateAndRender);
}
