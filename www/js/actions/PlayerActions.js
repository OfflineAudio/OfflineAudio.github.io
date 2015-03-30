const AppDispatcher = require('../dispatcher/AppDispatcher')
const PlayerConstants = require('../constants/PlayerConstants')
const Library = require('../utils/Library')
const Player = require('../utils/Player')
const PlayerStore = require('../stores/PlayerStore')
const once = require('../utils/once')


const PlayerActions = {
  stop: function() {
    Player.stop()
    AppDispatcher.handleAction({
      actionType: PlayerConstants.STOP
    })
  },
  emptyQueue: function () {
    AppDispatcher.handleAction({
      actionType: PlayerConstants.EMPTY_QUEUE
    })
  },
  addToQueue: function (id, file) {
    AppDispatcher.handleAction({
      actionType: PlayerConstants.ADD_TO_QUEUE,
      data: {id, file}
    })
  },
  playPrevSong: function () {
    debugger;
    const track = PlayerStore.prev()
    if (track) {
      PlayerActions.playSong(track.id, track.attachment)
    } else {
      PlayerActions.stop()
    }
  },
  playNextSong: function () {
    if (PlayerStore.hasNext()) {
      const track = PlayerStore.next()
      PlayerActions.playSong(track.id, track.file)
    // } else if (PlayerStore.get('repeat')) {
      // PlayerStore.rewind()
      // @play()
    } else {
      PlayerActions.stop()
    }
  },
  playNewSong: function(id, attachment) {
    Library.getAttachment(id, attachment)
    .then(function (blob) {
      Player.playFile(blob, () => {
        const updateVolumeOnce = once((volume) => {
          AppDispatcher.handleAction({
            actionType: PlayerConstants.VOLUME,
            data: volume
          })
        })

        return function (event) {
          const duration = event.currentTarget.duration
          AppDispatcher.handleAction({
            actionType: PlayerConstants.DURATION,
            data: duration
          })

          const currentTime = event.currentTarget.currentTime
          AppDispatcher.handleAction({
            actionType: PlayerConstants.CURRENT_TIME,
            data: currentTime
          })

          updateVolumeOnce(event.currentTarget.volume * 100)
        }
      }())

      AppDispatcher.handleAction({
        actionType: PlayerConstants.PLAY_NEW_SONG,
        data: {id, attachment}
      })

      AppDispatcher.handleAction({
        actionType: PlayerConstants.PLAYING,
        data: true
      })
    })
  },
  playSong: function (id, attachment) {
    Library.getAttachment(id, attachment)
    .then(function (blob) {
      Player.playFile(blob, () => {
        const updateVolumeOnce = once((volume) => {
          AppDispatcher.handleAction({
            actionType: PlayerConstants.VOLUME,
            data: volume
          })
        })

        return function (event) {
          const duration = event.currentTarget.duration
          AppDispatcher.handleAction({
            actionType: PlayerConstants.DURATION,
            data: duration
          })

          const currentTime = event.currentTarget.currentTime
          AppDispatcher.handleAction({
            actionType: PlayerConstants.CURRENT_TIME,
            data: currentTime
          })

          updateVolumeOnce(event.currentTarget.volume * 100)
        }
      }())

      AppDispatcher.handleAction({
        actionType: PlayerConstants.PLAY_SONG,
        data: {id, attachment}
      })

      AppDispatcher.handleAction({
        actionType: PlayerConstants.PLAYING,
        data: true
      })
    })
  },
  playCurrentSong: function () {
    Player.playCurrentFile(function (event) {
        const duration = event.currentTarget.duration
        AppDispatcher.handleAction({
          actionType: PlayerConstants.DURATION,
          data: duration
        })

        const currentTime = event.currentTarget.currentTime
        AppDispatcher.handleAction({
          actionType: PlayerConstants.CURRENT_TIME,
          data: currentTime
        })
      })
    AppDispatcher.handleAction({
      actionType: PlayerConstants.PLAYING,
      data: true
    })
  },
  pauseCurrentSong: function () {
    Player.pauseCurrentFile(function (event) {
        const duration = event.currentTarget.duration
        AppDispatcher.handleAction({
          actionType: PlayerConstants.DURATION,
          data: duration
        })

        const currentTime = event.currentTarget.currentTime
        AppDispatcher.handleAction({
          actionType: PlayerConstants.CURRENT_TIME,
          data: currentTime
        })
      })
    AppDispatcher.handleAction({
      actionType: PlayerConstants.PLAYING,
      data: false
    })
  },
  updateVolume: function (value) {
    Player.updateVolume(value)
    AppDispatcher.handleAction({
      actionType: PlayerConstants.VOLUME,
      data: value
    })
  }
}

Player.addEndedEvent(PlayerActions.playNextSong)

module.exports = PlayerActions
