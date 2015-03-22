/*eslint-env browser, es6 */
const audio = new Audio()

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

function updateVolume (value) {
  audio.volume = value / 100
}

module.exports = {
  playFile: playFile,
  playCurrentFile: playCurrentFile,
  pauseCurrentFile: pauseCurrentFile,
  updateVolume: updateVolume
}
