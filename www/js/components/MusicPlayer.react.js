const React = require('react')
const LibraryStore = require('../stores/LibraryStore')
const PlayerMenu = require('./PlayerMenu.react')
const PlayerControls = require('./PlayerControls.react')
const PlayerSideMenu = require('./PlayerSideMenu.react')
const LibraryActions = require('../actions/LibraryActions')
const PlayerStore = require('../stores/PlayerStore')
const Router = require('react-router')
const RouteHandler = Router.RouteHandler

// Method to retrieve state from Stores
function getState () {
  return {
  }
}

// Define main Controller View
const MusicPlayer = React.createClass({
  displayName: 'MusicPlayer',

  // Get initial state from stores
  getInitialState () {
    return getState()
  },

  // Add change listeners to stores
  componentDidMount () {
    LibraryStore.addChangeListener(this._onChange)
    PlayerStore.addChangeListener(this._onChange)
    LibraryActions.update()
  },

  // Remove change listers from stores
  componentWillUnmount () {
    LibraryStore.removeChangeListener(this._onChange)
    PlayerStore.removeChangeListener(this._onChange)
  },

  // Render our child components, passing state via props
  render () {
    // const library = LibraryStore.getLibrary()
    const artists = LibraryStore.getArtists()
    // const albums = LibraryStore.getAlbums()
    const artist = PlayerStore.getArtist() || ''
    // const album = PlayerStore.getAlbum() || ''
    const title = PlayerStore.getTitle() || ''
    const currentTime = PlayerStore.getCurrentTime() || 0
    const duration = PlayerStore.getDuration() || 0
    const progress = PlayerStore.getProgress() || 0
    const playing = PlayerStore.getPlaying() || false
    const volume = PlayerStore.getVolume() || 0
    const repeat = PlayerStore.getRepeat() || false
    const shuffle = PlayerStore.getShuffle() || false
    const hasNext = PlayerStore.hasNext() || false
    const hasPrev = PlayerStore.hasPrev() || false
    const previousSong = PlayerStore.getPrevSong()
    const nextSong = PlayerStore.getNextSong()
    const isMuted = PlayerStore.isMuted()

    return (
      <div>
      <PlayerMenu title='Offline Audio' volume={volume} muted={isMuted}/>

      <div className='main-container'>
        <PlayerSideMenu artists={artists}/>

        <section className='player-contents'>
          <RouteHandler/>
        </section>
      </div>

      <PlayerControls artist={artist} currentTime={currentTime} title={title} totalTime={duration} progresss={progress} playing={playing} repeat={repeat} shuffle={shuffle} hasNext={hasNext} hasPrev={hasPrev} previousSong={previousSong} nextSong={nextSong}/>
      </div>
    )
  },

  // Method to setState based upon Store changes
  _onChange () {
    this.setState(getState())
  }

})

module.exports = MusicPlayer
