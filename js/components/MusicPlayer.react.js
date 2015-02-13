var React = require('react')
var LibraryStore = require('../stores/LibraryStore')
var FileUploader = require('./FileUploader.react')
var Library = require('./Library.react')
var LibraryActions = require('../actions/LibraryActions')

// Method to retrieve state from Stores
function getState() {
  return {
    showOnlyArtists: false
  }
}

// Define main Controller View
var MusicPlayer = React.createClass({

  // Get initial state from stores
  getInitialState: function() {
    return getState()
  },

  handleClick: function() {
    this.setState({showOnlyArtists: true})
  },

  // Add change listeners to stores
  componentDidMount: function() {
    LibraryStore.addChangeListener(this._onChange)
    LibraryActions.update()
  },

  // Remove change listers from stores
  componentWillUnmount: function() {
    LibraryStore.removeChangeListener(this._onChange)
  },

  // Render our child components, passing state via props
  render: function() {
    let library = LibraryStore.getLibrary()
    let artists = LibraryStore.getArtists()
    let albums = LibraryStore.getAlbums()

    return (
      <div className="flux-musicplayer-app">
        <button onClick={this.handleClick}>Show only artists</button>
        <FileUploader />
        <Library library={library} artists={artists} showOnlyArtists = {this.state.showOnlyArtists} />
      </div>
    )
  },

  // Method to setState based upon Store changes
  _onChange: function() {
    this.setState(getState())
  }

})

module.exports = MusicPlayer
