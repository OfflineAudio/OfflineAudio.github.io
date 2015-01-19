var React = require('react');
var FileUploadActions = require('../actions/FileUploadActions');
var Artist = require('./Artist.react');

var Library = React.createClass({
  	render() {
      var library = this.props.library
      var artists = Object.keys(library);
      var Artists = artists.map(function(artist) {
            return <Artist name={artist} albums={library[artist]} />
          });
    	return (
      		<ul>
            {Artists}
      		</ul>
    	);
  	}
});

module.exports = Library;