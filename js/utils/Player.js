/*eslint-env browser, es6 */
const audio = new Audio()

function addEndedEvent (event) {
  audio.addEventListener('ended', event)
}

function playFile (blob, cb) {
  var url = URL.createObjectURL(blob)
  audio.src = url
  audio.load()
  audio.play()
  audio.addEventListener('timeupdate', cb, false)
}

function playCurrentFile (cb) {
  audio.play()
  audio.addEventListener('timeupdate', cb, false)
}

function pauseCurrentFile (cb) {
  audio.pause()
  audio.addEventListener('timeupdate', cb, false)
}

function stop () {
  audio.pause();
  audio.currentTime = 0;
}

function updateVolume (value) {
  audio.volume = value / 100
}

module.exports = {
  playFile,
  playCurrentFile,
  pauseCurrentFile,
  updateVolume,
  addEndedEvent,
  stop
}
