import keyMirror from 'react/lib/keyMirror'

// Define action constants
const PlayerConstants = keyMirror({
  ADD_TO_QUEUE: null,
  CURRENT_TIME: null,
  DURATION: null,
  EMPTY_QUEUE: null,
  MUTE: null,
  NEXT: null,
  PAUSE: null,
  PLAY: null,
  PLAY_SONG: null,
  PLAYING: null,
  PREVIOUS: null,
  REPEAT: null,
  SHUFFLE: null,
  STOP: null,
  VOLUME: null
})

export default PlayerConstants
