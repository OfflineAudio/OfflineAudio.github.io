const React = require('react')
const LibraryStore = require('../stores/LibraryStore')
const PlayerMenu = require('./PlayerMenu.react')
const PlayerControls = require('./PlayerControls.react')
const PlayerSideMenu = require('./PlayerSideMenu.react')
const Library = require('./Library.react')
const LibraryActions = require('../actions/LibraryActions')
const PlayerStore = require('../stores/PlayerStore')
const Router = require('react-router');
const RouteHandler = Router.RouteHandler;

// Method to retrieve state from Stores
function getState() {
  return {
  }
}

// Define main Controller View
const MusicPlayer = React.createClass({

  // Get initial state from stores
  getInitialState: function() {
    return getState()
  },

  // Add change listeners to stores
  componentDidMount: function() {
    LibraryStore.addChangeListener(this._onChange)
    PlayerStore.addChangeListener(this._onChange)
    LibraryActions.update()
  },

  // Remove change listers from stores
  componentWillUnmount: function() {
    LibraryStore.removeChangeListener(this._onChange)
    PlayerStore.removeChangeListener(this._onChange)
  },

  // Render our child components, passing state via props
  render: function() {
    const library = LibraryStore.getLibrary()
    const artists = LibraryStore.getArtists()
    const albums = LibraryStore.getAlbums()
    const artist = PlayerStore.getArtist() || ""
    const album = PlayerStore.getAlbum() || ""
    const title = PlayerStore.getTitle() || ""
    const currentTime = PlayerStore.getCurrentTime() || ""
    const duration = PlayerStore.getDuration() || ""
    const progress = PlayerStore.getProgress() || ""
    const playing = PlayerStore.getPlaying() || false

    return (
      <div>
      <PlayerMenu title="Offline Audio"/>

      <div className="main-container">
        <PlayerSideMenu artists={artists}/>

        <section className="player-contents">
          <RouteHandler/>
        </section>
      </div>

      <PlayerControls artist={artist} currentTime={currentTime} title={title} totalTime={duration} progresss={progress} playing={playing}/>
      </div>
    )
  },

  // Method to setState based upon Store changes
  _onChange: function() {
    this.setState(getState())
  }

})

module.exports = MusicPlayer
