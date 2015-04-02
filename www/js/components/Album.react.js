const React = require('react')
const TrackList = require('./TrackList.react')

const Album = React.createClass({
  displayName: 'Album',
  propTypes: {
    // An optional string prop named "description".
    tracks: React.PropTypes.array.isRequired
  },
  render () {
    return (
      <TrackList tracks={this.props.tracks} />
    )
  }
})

module.exports = Album
