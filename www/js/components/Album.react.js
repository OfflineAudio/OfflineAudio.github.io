const React = require('react')
const FileUploadActions = require('../actions/FileUploadActions')
const TrackList = require('./TrackList.react')

const Album = React.createClass({
  render() {
    return (
      <TrackList tracks={this.props.tracks} />
    )
  }
})

module.exports = Album
