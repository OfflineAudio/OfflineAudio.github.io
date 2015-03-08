const React = require('react');

const PlayerMenu = React.createClass({
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
              <div className="volume-slider">
                <div className="volume-slider__range"></div>
              </div>
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
