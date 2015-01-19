var React = require('react');
var FileUploadActions = require('../actions/FileUploadActions');
var Album = require('./Album.react');

var Artist = React.createClass({
  	render() {
  		var albums = this.props.albums
  		var albumNames = Object.keys(albums);
  		var Albums = albumNames.map(function(album) {
			return <Album name={album} tracks={albums[album]} />
		});
		var name = this.props.name;
    	return (
      		<ul>
      			<li>{name}</li>
      			{Albums}
      		</ul>
    	);
  	}
});

module.exports = Artist;