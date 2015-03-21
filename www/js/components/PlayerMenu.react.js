const React = require('react')
const PlayerActions = require('../actions/PlayerActions')

const PlayerMenu = React.createClass({
  onChange(event) {
    PlayerActions.updateVolume(event.target.value)
  },
  render() {
    const {title, volume} = this.props

    return (
      <header className="player-menu">
        <div className="container">
          <span className="player-menu__app-title">
            {title}
          </span>
          <div className="player-menu__controls">
            <button className="btn menu-button icon--sound gamma btn--dark"></button>
            <div className="volume-slider-wrapper">
              <input className="volume-slider" type="range" tabIndex="1" onChange={this.onChange} />
            </div>
            <button className="btn menu-button icon--menu gamma btn--dark"></button>
            <button className="btn menu-button icon--layout gamma btn--dark"></button>
            <button className="btn menu-button icon--cog gamma btn--dark"></button>
          </div>
        </div>
      </header>
    );
  }
});

module.exports = PlayerMenu;
