const AppDispatcher = require('../dispatcher/AppDispatcher')
const EventEmitter = require('events').EventEmitter
const PlayerConstants = require('../constants/PlayerConstants')
const _ = require('lodash')

// Define initial data points
let _artist
let _album
let _title
let _currentTime
let _duration
let _progress
let _playing
let _volume
let _queue = []
let _index
let _shuffle
let _repeat

function repeat () {
  _repeat = !_repeat
}

function shuffle () {
  if (_queue.length && _index > -1) {
    const currentlyPlayingSong = _queue.splice(_index, 1)[0]
    _queue = _.shuffle(_queue)
    _queue.unshift(currentlyPlayingSong)
    _index = 0
  } else {
    _queue = _.shuffle(_queue)
  }
}

function switchSong (data) {
  [_artist, _album, _title] = data.id.split('-||-||-')
}

function resetQueue (data) {
  _index = 0
  _queue.length = 0
}

function updateCurrentTime (currentTime) {
  _currentTime = currentTime
}

function updateDuration (duration) {
  _duration = duration
}

function updateProgress () {
  _progress = (100 / _duration) * _currentTime
}

function updatePlaying (playing) {
  _playing = playing
}

function updateVolume (volume) {
  _volume = volume
}

function switchQueue (queue) {
  _queue = queue
}

function addToQueue(track) {
  _queue.push(track)
}

var PlayerStore = _.extend({}, EventEmitter.prototype, {
  getAlbum: function () {
    return _album
  },

  getArtist: function () {
    return _artist
  },

  getCurrentTime: function () {
    return _currentTime
  },

  getDuration: function () {
    return _duration
  },

  getTitle: function () {
    return _title
  },

  getProgress: function () {
    return _progress
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
    return _volume
  },

  hasNext: function () {
    return _queue.length && _queue.length > _index + 1
  },

  hasPrev: function() {
    return _index > 0
  },

  prev: function () {
    if (this.hasPrev()) {
      return _queue[--_index]
    }
  },

  next: function () {
    if (this.hasNext())
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
    case PlayerConstants.EMPTY_QUEUE:
      resetQueue()
      updateCurrentTime(0)
      updateProgress()
    break
    case PlayerConstants.PLAY_SONG:
      switchSong(action.data)
    break
    case PlayerConstants.PLAY_NEW_SONG:
      resetQueue(action.data)
      addToQueue(action.data)
      switchSong(action.data)
    break
    case PlayerConstants.CURRENT_TIME:
      updateCurrentTime(action.data)
      updateProgress()
    break
    case PlayerConstants.DURATION:
      updateDuration(action.data)
    break
    case PlayerConstants.PLAYING:
      updatePlaying(action.data)
    break
    case PlayerConstants.REPEAT:
      repeat()
    break
    case PlayerConstants.SHUFFLE:
      shuffle()
    break
    case PlayerConstants.STOP:
      updatePlaying(false)
      updateCurrentTime(0)
      updateProgress()
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

module.exports = PlayerStore
