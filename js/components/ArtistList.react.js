const React = require('react');
var Router = require('react-router');

var Link = Router.Link;

const Artist = React.createClass({
	handleClick(event) {
		// debugger
	},
	render() {
		const {artist} = this.props

		return (
			<li className="filter__item">
		  	<Link className="btn filter__item__button filter__item--button" to="artist" params={{artist: artist}}>
		    	{artist}
		  	</Link>
			</li>
		)
	}
})

const ArtistList = React.createClass({
	render() {
		const {artists} = this.props

		const artistList = artists.map(function(artist) {
			return <Artist artist={artist}/>
		})

  	return (
      <ul className="list-block filter">
				<li className="filter__item filter__item--heading gamma">
			  	<Link to="artists">Artists</Link>
				</li>
				{artistList}
			</ul>
  	);
	}
});

module.exports = ArtistList;
