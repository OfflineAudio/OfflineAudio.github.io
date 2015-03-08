const React = require('react')
const _ = require('lodash')
const Track = require('./Track.react')

const TrackList = React.createClass({
	render() {
    const tracks = _.map(this.props.tracks, function(track) { return track[Object.keys(track)[0]] })
    const duration = "4:20"
    const playing = false
    const favourite = false

    const Tracks = _.map(tracks, function(track) {
      console.log(tracks[0])
      console.log(track)
      debugger
      const file = Object.keys(track._attachments)[0]
      return <Track key={track.rev} artist={track.artist} album={track.album} title={track.title} trackNumber={track.number} duration={track.genre} playing={playing} favourite={favourite} file={file}/>
    })
  	return (
  		<ul className="list-block tracklist">
  			{Tracks}
  		</ul>
  	);
	}
});

module.exports = TrackList;
