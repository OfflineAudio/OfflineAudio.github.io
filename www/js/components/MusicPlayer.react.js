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
    // const library = LibraryStore.getLibrary()
    artists: LibraryStore.getArtists(),
    // const albums = LibraryStore.getAlbums()
    artist: PlayerStore.getArtist() || '',
    // const album = PlayerStore.getAlbum() || ''
    title: PlayerStore.getTitle() || '',
    currentTime: PlayerStore.getCurrentTime() || 0,
    duration: PlayerStore.getDuration() || 0,
    progress: PlayerStore.getProgress() || 0,
    playing: PlayerStore.getPlaying() || false,
    volume: PlayerStore.getVolume() || 0,
    repeat: PlayerStore.getRepeat() || false,
    shuffle: PlayerStore.getShuffle() || false,
    hasNext: PlayerStore.hasNext() || false,
    hasPrev: PlayerStore.hasPrev() || false,
    previousSong: PlayerStore.getPrevSong(),
    nextSong: PlayerStore.getNextSong(),
    isMuted: PlayerStore.isMuted()
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
    return (
      <div>
        <PlayerMenu title='Offline Audio' volume={this.state.volume} muted={this.state.isMuted}/>

        <div className='main-container'>
          <PlayerSideMenu artists={this.state.artists}/>

          <section className='player-contents'>
            <RouteHandler/>
          </section>
        </div>

        <PlayerControls artist={this.state.artist} currentTime={this.state.currentTime} title={this.state.title} totalTime={this.state.duration} progresss={this.state.progress} playing={this.state.playing} repeat={this.state.repeat} shuffle={this.state.shuffle} hasNext={this.state.hasNext} hasPrev={this.state.hasPrev} previousSong={this.state.previousSong} nextSong={this.state.nextSong}/>
      </div>
    )
  },

  // Method to setState based upon Store changes
  _onChange () {
    this.setState(getState())
  }

})

module.exports = MusicPlayer
