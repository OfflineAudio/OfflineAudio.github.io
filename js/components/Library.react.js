const React = require('react')
const FileUploadActions = require('../actions/FileUploadActions')
const Artist = require('./Artist.react')
const Router = require('react-router')

const Library = React.createClass({
  mixins: [Router.State],
	render() {
    const showOnlyArtists = this.props.showOnlyArtists
    const artists = this.props.artists || this.getParams()
    const library = this.props.library
    const Artists = artists.map(function(artist) { return <Artist name={artist} albums={library[artist]} showOnlyArtists={showOnlyArtists} />})

  	return (
      <div>
        {Artists}
      </div>
  	)
	}
})

module.exports = Library
