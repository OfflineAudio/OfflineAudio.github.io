const React = require('react')
const Artist = require('./Artist.react')
const Router = require('react-router')

const Library = React.createClass({
  displayName: 'Library',
  propTypes: {
    // An optional string prop named "description".
    artists: React.PropTypes.array.isRequired,
    library: React.PropTypes.object.isRequired,
    showOnlyArtists: React.PropTypes.bool.isRequired
  },
  mixins: [Router.State],
  render () {
    const showOnlyArtists = this.props.showOnlyArtists
    const artists = this.props.artists || this.getParams()
    const library = this.props.library
    const Artists = artists.map((artist) => <Artist name={artist} albums={library[artist]} showOnlyArtists={showOnlyArtists} />)

    return (
      <div>
        {Artists}
      </div>
    )
  }
})

module.exports = Library
