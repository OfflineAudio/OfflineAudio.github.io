import AppDispatcher from '../dispatcher/AppDispatcher'
import {EventEmitter} from 'events'
import PlayerConstants from '../constants/PlayerConstants'
import _ from 'lodash'

// Define initial data points
let _artist
let _album
let _title
let _playing
let _queue = []
let _index
let _shuffle
let _repeat
let _previousVolume
let _stopped
let startTime
const audio = new AudioContext()
let source = audio.createBufferSource()
let gainNode = audio.createGain()
source.connect(gainNode)
gainNode.connect(audio.destination);

// const set = {} // all the setters

function decrementIndex() {
  --_index
}

function incrementIndex() {
  ++_index
}

function repeat () {
  _repeat = !_repeat
}

function shuffle () {
  if (_shuffle) {
    // reoder list somehow ?!
  }
  if (_queue.length && _index > -1) {
    const currentlyPlayingSong = _queue.splice(_index, 1)[0]
    _queue = _.shuffle(_queue)
    _queue.unshift(currentlyPlayingSong)
    _index = 0
  } else {
    _queue = _.shuffle(_queue)
  }
  _shuffle = !_shuffle
}

function switchFile (buffer) {
  let a = source.onended
  source.onended = null
  try {
    source.stop()
  } catch (e) {

  }
  source = audio.createBufferSource()
  source.onended = a
  source.connect(gainNode)
  source.buffer = buffer;
}

function play () {
  _playing = true
  if (_stopped) {
    _stopped = false
    let a = source.onended
    let buffer = source.buffer
    source = audio.createBufferSource()
    source.onended = a
    source.connect(gainNode)
    source.buffer = buffer
    startTime = audio.currentTime
    audio.resume()
    source.start()
  } else {
    switch (audio.state) {
      case "suspended":
        audio.resume()
        break
      default:
        startTime = audio.currentTime
        source.start()
        break
    }
  }
}

function pause () {
  _playing = false
  audio.suspend()
}

function stop () {
  pause()
  _stopped = true
}

function updateVolume (value) {
  _previousVolume = gainNode.gain.value
  gainNode.gain.value = value
}

function switchSong (id) {
  [_artist, _album, _title] = id.split('-||-||-')
}

function resetQueue () {
  _index = 0
  _queue.length = 0
}

function addToQueue(track) {
  _queue.push(track)
}

var PlayerStore = _.extend({}, EventEmitter.prototype, {
  endedEvent: function (cb) {
    source.onended = cb
  },

  getAlbum () {
    return _album
  },

  getArtist () {
    return _artist
  },

  getCurrentTime () {
    if (this.getPlaying) {
      return audio.currentTime - startTime
    } else {
      return 0
    }
  },

  getDuration () {
    try {
      return source.buffer.duration
    } catch (e) {
      return 0
    }
  },

  getTitle () {
    return _title
  },

  getProgress () {
    return (100 / this.getDuration()) * this.getCurrentTime()
  },

  getPlaying () {
    return _playing
  },

  getQueue () {
    return _queue
  },

  getRepeat () {
    return _repeat
  },

  getShuffle () {
    return _shuffle
  },

  getVolume () {
    return gainNode.gain.value
  },

  getPrevSong () {
    if (_queue.length === 1) {
      return _queue[0]
    } else if (_repeat && _index === 0) {
      return _queue[_queue.length - 1]
    }
    return _queue[_index - 1]
  },

  getNextSong () {
    if (_queue.length === 1) {
      return _queue[0]
    } else if (_repeat && _index === _queue.length - 1) {
      return _queue[0]
    }
    return _queue[_index + 1]
  },

  hasNext () {
    if (_repeat && _index === _queue.length - 1) {
      return true
    } else {
      return _queue.length && _queue.length > _index + 1
    }
  },

  hasPrev() {
    if (_repeat && _index === 0) {
      return true
    } else {
      return _index > 0
    }
  },

  isMuted () {
    return gainNode.gain.value == 0
  },

  prev () {
    if (_repeat && _index === 0) {
      _index = _queue.length
      return _queue[--_index]
    } else if (this.hasPrev()) {
      return _queue[--_index]
    }
  },

  next () {
    if (_repeat && _index === _queue.length) {
      _index = 0
      return _queue[++_index]
    } else if (this.hasNext())
      return _queue[++_index]
  },

  // Emit Change event
  emitChange () {
    this.emit('change')
  },

  // Add change listener
  addChangeListener (callback) {
    this.on('change', callback)
  },

  // Remove change listener
  removeChangeListener (callback) {
    this.removeListener('change', callback)
  }
})

// Register callback with AppDispatcher
AppDispatcher.register(function (payload) {
  var action = payload.action

  switch (action.actionType) {
    case PlayerConstants.ADD_TO_QUEUE:
      addToQueue(action.data)
    break
    case PlayerConstants.CURRENT_TIME:
      updateCurrentTime(action.data)
      updateProgress()
    break
    case PlayerConstants.DURATION:
      updateDuration(action.data)
    break
    case PlayerConstants.EMPTY_QUEUE:
      resetQueue()
      updateCurrentTime(0)
      updateProgress()
    break
    case PlayerConstants.MUTE:
      if (PlayerStore.isMuted()) {
        updateVolume(_previousVolume || 0.1)
      } else {
        _previousVolume = audio.volume
        updateVolume(0)
      }
    break
    case PlayerConstants.NEXT:
      if (!(_queue.length === 1)) {
        if (_repeat && _index === _queue.length - 1) {
          _index = 0
        } else {
          incrementIndex()
        }
      }
      switchFile(action.data.blob)
      switchSong(_queue[_index].id)
      if (_playing) {
        play()
      }
    break
    case PlayerConstants.PAUSE:
      pause()
    break
    case PlayerConstants.PLAY:
      play()
    break
    case PlayerConstants.PLAY_SONG:
      const trackData = {
        id: action.data.id,
        attachment: action.data.attachment
      }
      resetQueue()
      addToQueue(trackData)
      switchSong(action.data.id)
      switchFile(action.data.blob)
      play()
    break
    case PlayerConstants.PREVIOUS:
      if (!(_queue.length === 1)) {
        if (_repeat && _index === 0) {
          _index = _queue.length - 1
        } else {
          decrementIndex()
        }
      }
      switchFile(action.data.blob)
      switchSong(_queue[_index].id)
      if (_playing) {
        play()
      }
    break
    case PlayerConstants.REPEAT:
      repeat()
    break
    case PlayerConstants.SHUFFLE:
      shuffle()
    break
    case PlayerConstants.STOP:
      stop()
    break
    case PlayerConstants.VOLUME:
      updateVolume(action.data)
    break
    default:
      return true
  }

  PlayerStore.emitChange()

  return true
})

setInterval(PlayerStore.emitChange.bind(PlayerStore), 500)

export default PlayerStore
