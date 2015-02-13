const React = require('react');

const ListItemWrapper = React.createClass({
  render: function() {
    return <li>{this.props.text}</li>;
  }
});

const TrackList = React.createClass({
  	render() {
  		var tracks = this.props.tracks
  		var trackNames = Object.keys(tracks);
  		var Tracks = trackNames.map(function(track) {
			return <ListItemWrapper key={track} text={track} />
		});
    	return (
      		<ul>
      			{Tracks}
      		</ul>
    	);
  	}
});

module.exports = TrackList;
