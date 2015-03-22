const React = require('react')
const FileUploadActions = require('../actions/FileUploadActions')
const Album = require('./Album.react')

const Artist = React.createClass({
	render() {
		const name = this.props.name
    const showOnlyArtists = this.props.showOnlyArtists
    const albums = this.props.albums
    const albumNames = Object.keys(albums)
    let Albums

    if (!showOnlyArtists) {
      Albums = albumNames.map(function(album) {
        return <Album name={album} tracks={albums[album]} />
      })
    }

  	return (
  		<div>
  			{Albums}
  		</div>
  	)
	}
})

module.exports = Artist