const React = require('react')
const _ = require('lodash')
const Track = require('./Track.react')
const PureRenderMixin = require('react/addons').addons.PureRenderMixin
const PropCheckMixin = require('../mixins/PropCheckMixin')

const TrackList = React.createClass({
  mixins: [PureRenderMixin, PropCheckMixin],
  displayName: 'TrackList',
  propTypes: {
    tracks: React.PropTypes.array.isRequired
  },
  render () {
    const tracks = _.map(this.props.tracks, function (track) { return track[Object.keys(track)[0]] })
    const duration = '4:20' // FIXME, I can't work so switch to GENRE
    const playing = true

    const Tracks = _.map(tracks, function (track) {
      const file = Object.keys(track._attachments)[0]
      return <Track key={track.rev} rev={track.rev} id={track.id} artist={track.artist} album={track.album} title={track.title} trackNumber={track.number} duration={track.genre} playing={playing} favourite={track.favourite} attachment={file}/>
    })
    return (
      <ul className="list-block tracklist">
        {Tracks}
      </ul>
    )
  }
})

module.exports = TrackList
