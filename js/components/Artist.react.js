const React = require('react')
const FileUploadActions = require('../actions/FileUploadActions')
const Album = require('./Album.react')

const Artist = React.createClass({
	render() {
		let name = this.props.name
    let showOnlyArtists = this.props.showOnlyArtists
    let albums = this.props.albums
    let albumNames = Object.keys(albums)
    let Albums

    if (!showOnlyArtists) {
      Albums = albumNames.map(function(album) {
        return <Album name={album} tracks={albums[album]} />
      })
    }

  	return (
  		<ul>
  			<li>{name}</li>
  			{Albums}
  		</ul>
  	)
	}
})

module.exports = Artist
