import React from 'react'
import _ from 'lodash'
import Track from './Track.react'
import PureComponent from './PureComponent.react'
// import PropCheckMixin from '../mixins/PropCheckMixin'

export default class TrackList extends PureComponent {
  render () {
    const tracks = _.map(this.props.tracks, function (track) { return track[Object.keys(track)[0]] })
    const playing = true

    const Tracks = _.map(tracks, function (track) {
      const file = Object.keys(track._attachments)[0]
      return <Track key={track.rev} rev={track.rev} id={track.id} artist={track.artist} album={track.album} title={track.title} trackNumber={track.number} duration={track.genre} playing={playing} favourite={track.favourite} attachment={file} genre={track.genre}/>
    })
    return (
      <ul className='list-block tracklist'>
        {Tracks}
      </ul>
    )
  }
}
