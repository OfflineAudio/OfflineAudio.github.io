let React = require('react');
let FileUploadActions = require('../actions/FileUploadActions');
let Artist = require('./Artist.react');
// let ArtistList = require('./ArtistList.react');

let Library = React.createClass({
  	render() {
      let showOnlyArtists = this.props.showOnlyArtists
      let artists = this.props.artists
      let library = this.props.library
      let Artists = artists.map(function(artist) { return <Artist name={artist} albums={library[artist]} showOnlyArtists={showOnlyArtists} />})

    	return (
        <ul>
          {Artists}
        </ul>
    	);
  	}
});

module.exports = Library;