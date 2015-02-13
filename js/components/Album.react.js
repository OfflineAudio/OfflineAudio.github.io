var React = require('react')
var FileUploadActions = require('../actions/FileUploadActions')
var TrackList = require('./TrackList.react')

var Album = React.createClass({
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
