const React = require('react')
const FileUploadActions = require('../actions/FileUploadActions')
const Artist = require('./Artist.react')

const Library = React.createClass({
	render() {
    let showOnlyArtists = this.props.showOnlyArtists
    let artists = this.props.artists
    let library = this.props.library
    let Artists = artists.map(function(artist) { return <Artist name={artist} albums={library[artist]} showOnlyArtists={showOnlyArtists} />})

  	return (
      <ul>
        {Artists}
      </ul>
  	)
	}
})

module.exports = Library
