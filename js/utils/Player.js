const Promise = require('bluebird')
const blobUtil = require('blob-util')
const audio = new Audio();

function playFile(blob, cb) {
  var url = URL.createObjectURL(blob);
  audio.src = url
  audio.load()
  audio.play()
  audio.addEventListener('timeupdate', cb, false)
}

module.exports = {
  playFile: playFile
}
