const keyMirror = require('react/lib/keyMirror')

// Define action constants
module.exports = keyMirror({
  ADD_TO_QUEUE: null,
  CURRENT_TIME: null,
  DURATION: null,
  EMPTY_QUEUE: null,
  NEXT: null,
  PAUSE: null,
  PLAY: null,
  PLAY_SONG: null,
  PLAY_NEW_SONG: null,
  PLAYING: null,
  PREVIOUS: null,
  REPEAT: null,
  SHUFFLE: null,
  STOP: null,
  VOLUME: null
})
