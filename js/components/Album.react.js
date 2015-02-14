const React = require('react')
const FileUploadActions = require('../actions/FileUploadActions')
const TrackList = require('./TrackList.react')

const Album = React.createClass({
  render() {
    return (
      <ul>
        <li>{this.props.name}</li>
        <TrackList tracks={this.props.tracks} />
      </ul>
    )
  }
})

module.exports = Album
