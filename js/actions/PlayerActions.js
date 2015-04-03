const AppDispatcher = require('../dispatcher/AppDispatcher')
const PlayerConstants = require('../constants/PlayerConstants')
const LibraryConstants = require('../constants/LibraryConstants')
const Library = require('../utils/Library')
const once = require('../utils/once')
const _ = require('lodash')

const PlayerActions = {
  delete (id, rev, artist, album, title) {
    Library.deleteTrack(id, rev)
    .then(result => {
      AppDispatcher.handleAction({
        actionType: LibraryConstants.DELETE_TRACK,
        data: {id, rev, artist, album, title}
      })
    })
    // do something optimistic, also, handle error case
  },
  mute () {
    AppDispatcher.handleAction({
      actionType: PlayerConstants.MUTE
    })
  },
  stop () {
    AppDispatcher.handleAction({
      actionType: PlayerConstants.STOP
    })
  },
  emptyQueue () {
    AppDispatcher.handleAction({
      actionType: PlayerConstants.EMPTY_QUEUE
    })
  },
  addToQueue (id, attachment) {
    AppDispatcher.handleAction({
      actionType: PlayerConstants.ADD_TO_QUEUE,
      data: {id, attachment}
    })
  },
  shuffle () {
    AppDispatcher.handleAction({
      actionType: PlayerConstants.SHUFFLE
    })
  },
  repeat () {
    AppDispatcher.handleAction({
      actionType: PlayerConstants.REPEAT
    })
  },
  previousTrack (track) {
    Library.getAttachment(track.id, track.attachment)
    .then(blob => {
      const {id, attachment} = track
      AppDispatcher.handleAction({
        actionType: PlayerConstants.PREVIOUS,
        data: {id, attachment, blob}
      })
    })
  },
  nextTrack (track) {
    Library.getAttachment(track.id, track.attachment)
    .then(blob => {
      const {id, attachment} = track
      AppDispatcher.handleAction({
        actionType: PlayerConstants.NEXT,
        data: {id, attachment, blob}
      })
    })
  },
  playSong(id, attachment) {
    Library.getAttachment(id, attachment)
    .then(blob => {
      AppDispatcher.handleAction({
        actionType: PlayerConstants.PLAY_SONG,
        data: {id, attachment, blob}
      })
    })
  },
  play () {
    AppDispatcher.handleAction({
      actionType: PlayerConstants.PLAY
    })
  },
  pause () {
    AppDispatcher.handleAction({
      actionType: PlayerConstants.PAUSE
    })
  },
  updateVolume (value) {
    AppDispatcher.handleAction({
      actionType: PlayerConstants.VOLUME,
      data: value
    })
  }
}

module.exports = PlayerActions
