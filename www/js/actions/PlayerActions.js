const AppDispatcher = require('../dispatcher/AppDispatcher')
const PlayerConstants = require('../constants/PlayerConstants')
const Library = require('../utils/Library')
const Player = require('../utils/Player')

const PlayerActions = {
  // Receive initial product data
  playSong: function(id, attachment) {

    Library.getAttachment(id, attachment)
    .then(function(blob) {
      Player.playFile(blob, function(event) {
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

      const [artist, album, title] = id.split('-||-||-')
      const data = {
        album: album,
        artist: artist,
        title: title
      }
      AppDispatcher.handleAction({
        actionType: PlayerConstants.PLAY_FILE,
        data: data
      })

      AppDispatcher.handleAction({
          actionType: PlayerConstants.PLAYING,
          data: true
        })
    })
  },
  playCurrentSong: function() {
    Player.playCurrentFile(function(event) {
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
  pauseCurrentSong: function() {
    Player.pauseCurrentFile(function(event) {
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
  updateVolume: function(value) {
    Player.updateVolume(value)
    AppDispatcher.handleAction({
      actionType: PlayerConstants.PLAYING,
      data: value
    })
  }
}

module.exports = PlayerActions
