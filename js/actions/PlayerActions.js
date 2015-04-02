const AppDispatcher = require('../dispatcher/AppDispatcher')
const PlayerConstants = require('../constants/PlayerConstants')
const Library = require('../utils/Library')
const once = require('../utils/once')
const _ = require('lodash')

const PlayerActions = {
  stop: function() {
    AppDispatcher.handleAction({
      actionType: PlayerConstants.STOP
    })
  },
  emptyQueue: function () {
    AppDispatcher.handleAction({
      actionType: PlayerConstants.EMPTY_QUEUE
    })
  },
  addToQueue: function (id, attachment) {
    AppDispatcher.handleAction({
      actionType: PlayerConstants.ADD_TO_QUEUE,
      data: {id, attachment}
    })
  },
  shuffle: function() {
    AppDispatcher.handleAction({
      actionType: PlayerConstants.SHUFFLE
    })
  },
  repeat: function () {
    AppDispatcher.handleAction({
      actionType: PlayerConstants.REPEAT
    })
  },
  previousTrack: function (track) {
    Library.getAttachment(track.id, track.attachment)
    .then(blob => {
      AppDispatcher.handleAction({
        actionType: PlayerConstants.PREVIOUS,
        data: blob
      })
    })
  },
  nextTrack: function (track) {
    Library.getAttachment(track.id, track.attachment)
    .then(blob => {
      AppDispatcher.handleAction({
        actionType: PlayerConstants.NEXT,
        data: blob
      })
    })
  },
  playSong: function(id, attachment) {
    Library.getAttachment(id, attachment)
    .then(blob => {
      AppDispatcher.handleAction({
        actionType: PlayerConstants.PLAY_NEW_SONG,
        data: {id, attachment, blob}
      })
    })
  },
  play: function () {
    AppDispatcher.handleAction({
      actionType: PlayerConstants.PLAY
    })
  },
  pause: function () {
    AppDispatcher.handleAction({
      actionType: PlayerConstants.PAUSE
    })
  },
  updateVolume: function (value) {
    AppDispatcher.handleAction({
      actionType: PlayerConstants.VOLUME,
      data: value
    })
  }
}

module.exports = PlayerActions
