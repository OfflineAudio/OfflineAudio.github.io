const AppDispatcher = require('../dispatcher/AppDispatcher')
const EventEmitter = require('events').EventEmitter
const PlayerConstants = require('../constants/PlayerConstants')
const _ = require('lodash')

// Define initial data points
let _artist
let _album
let _title
let _playing
let _queue = []
let _index
let _shuffle
let _repeat
const audio = new Audio()

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

function switchFile (blob) {
  audio.src = URL.createObjectURL(blob)
  audio.load()
}

function play () {
  _playing = true
  audio.play()
}

function pause () {
  _playing = false
  audio.pause()
}

function stop () {
  pause()
  audio.currentTime = 0;
}

function updateVolume (value) {
  audio.volume = value
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
  addAudioEventListener: function (eventType, cb) {
    audio.addEventListener(eventType, cb)
  },

  getAlbum: function () {
    return _album
  },

  getArtist: function () {
    return _artist
  },

  getCurrentTime: function () {
    return audio.currentTime
  },

  getDuration: function () {
    return audio.duration
  },

  getTitle: function () {
    return _title
  },

  getProgress: function () {
    return (100 / audio.duration) * audio.currentTime
  },

  getPlaying: function () {
    return _playing
  },

  getQueue: function () {
    return _queue
  },

  getRepeat: function () {
    return _repeat
  },

  getShuffle: function () {
    return _shuffle
  },

  getVolume: function () {
    return audio.volume
  },

  getPrevSong: function () {
    if (_queue.length === 1) {
      return _queue[0]
    } else if (_repeat && _index === 0) {
      return _queue[_queue.length - 1]
    }
    return _queue[_index - 1]
  },

  getNextSong: function () {
    if (_queue.length === 1) {
      return _queue[0]
    } else if (_repeat && _index === _queue.length - 1) {
      return _queue[0]
    }
    return _queue[_index + 1]
  },

  hasNext: function () {
    if (_repeat && _index === _queue.length - 1) {
      return true
    } else {
      return _queue.length && _queue.length > _index + 1
    }
  },

  hasPrev: function() {
    if (_repeat && _index === 0) {
      return true
    } else {
      return _index > 0
    }
  },

  prev: function () {
    if (_repeat && _index === 0) {
      _index = _queue.length
      return _queue[--_index]
    } else if (this.hasPrev()) {
      return _queue[--_index]
    }
  },

  next: function () {
    if (_repeat && _index === _queue.length) {
      _index = 0
      return _queue[++_index]
    } else if (this.hasNext())
      return _queue[++_index]
  },

  // Emit Change event
  emitChange: function () {
    this.emit('change')
  },

  // Add change listener
  addChangeListener: function (callback) {
    this.on('change', callback)
  },

  // Remove change listener
  removeChangeListener: function (callback) {
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
    case PlayerConstants.NEXT:
      if (_repeat && _index === _queue.length - 1) {
        decrementIndex()
      } else {
        incrementIndex()
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
      if (_repeat && _index === 0) {
        incrementIndex()
      } else {
        decrementIndex()
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

audio.addEventListener('timeupdate', PlayerStore.emitChange.bind(PlayerStore))

module.exports = PlayerStore
