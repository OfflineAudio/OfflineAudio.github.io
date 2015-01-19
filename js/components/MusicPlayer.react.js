var React = require('react');
var LibraryStore = require('../stores/LibraryStore');
var FileUploader = require('./FileUploader.react');
var Library = require('./Library.react');
var LibraryActions = require('../actions/LibraryActions');

// Method to retrieve state from Stores
function getState() {
  return {
    artists: LibraryStore.getArtists(),
    library: LibraryStore.getLibrary()
  };
}

// Define main Controller View
var MusicPlayer = React.createClass({

  // Get initial state from stores
  getInitialState: function() {
    return getState();
  },

  // Add change listeners to stores
  componentDidMount: function() {
    LibraryStore.addChangeListener(this._onChange);
    LibraryActions.update();
  },

  // Remove change listers from stores
  componentWillUnmount: function() {
    LibraryStore.removeChangeListener(this._onChange);
  },

  // Render our child components, passing state via props
  render: function() {
    return (
      <div className="flux-musicplayer-app">
        <FileUploader />
        <Library library={this.state.library} />
      </div>
    );
  },

  // Method to setState based upon Store changes
  _onChange: function() {
    this.setState(getState());
  }

});

module.exports = MusicPlayer;