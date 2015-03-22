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

function switchFile (data) {
  _album = data.album
  _artist = data.artist
  _title = data.title
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

  getVolume: function () {
    return _volume
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
    case PlayerConstants.PLAY_FILE:
      switchFile(action.data)
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
