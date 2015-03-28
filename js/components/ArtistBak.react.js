const React = require('react')
const Album = require('./Album.react')

const Artist = React.createClass({
  displayName: 'Artist',
  propTypes: {
    albums: React.PropTypes.object.isRequired,
    name: React.PropTypes.string.isRequired,
    showOnlyArtists: React.PropTypes.bool.isRequired,
    tracks: React.PropTypes.array.isRequired
  },
  render () {
    const name = this.props.name
    const showOnlyArtists = this.props.showOnlyArtists
    const albums = this.props.albums
    const albumNames = Object.keys(albums)
    let Albums

    if (!showOnlyArtists) {
      Albums = albumNames.map(function (album) {
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
