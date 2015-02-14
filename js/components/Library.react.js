const React = require('react')
const FileUploadActions = require('../actions/FileUploadActions')
const Artist = require('./Artist.react')

const Library = React.createClass({
	render() {
    const showOnlyArtists = this.props.showOnlyArtists
    const artists = this.props.artists
    const library = this.props.library
    const Artists = artists.map(function(artist) { return <Artist name={artist} albums={library[artist]} showOnlyArtists={showOnlyArtists} />})

  	return (
      <ul>
        {Artists}
      </ul>
  	)
	}
})

module.exports = Library
