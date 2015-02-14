const React = require('react');

const Track = React.createClass({
  	render() {
  		const {trackNumber, duration, title, playing, favourite} = this.props

    	return (
        <li>
          <div className="track_number">{trackNumber}</div>
          <div className="a">
            <div className="track_title">{title}</div>
            <div className="track_duration">{duration}</div>
          </div>
          <button className="menu">menu</button>
          <input type=checkbox className="fav" checked={favourite}></input>
      </li>
    	);
  	}
});

module.exports = Track;
