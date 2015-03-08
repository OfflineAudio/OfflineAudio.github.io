const React = require('react');

function secondsToMinutesAndSeconds(_seconds) {
  const minutes = parseInt(_seconds / 60)
  const seconds = parseInt(_seconds % 60)
  return minutes + ':' + ((seconds < 10) ? "0" + seconds : seconds)
}

const PlayerControls = React.createClass({
  render() {
    const {artist, currentTime, title, totalTime, progresss} = this.props
    let currentTimeDisplay = secondsToMinutesAndSeconds(currentTime)
    let totalTimeDisplay = secondsToMinutesAndSeconds(totalTime)

    return (
      <section className="play-controls">
        <button className="btn player-button icon--fast-backward gamma btn--dark"></button>
        <button className="btn player-button icon--play alpha btn--light"></button>
        <button className="btn player-button icon--pause alpha btn--light player-button--hidden"></button>
        <button className="btn player-button icon--fast-forward gamma btn--dark"></button>
        <div className="play-controls__playback">
          <span className="playback playback--title">{artist} - {title}</span>
          <span className="playback playback--current-time">{currentTimeDisplay}</span>
          <span className="playback playback--total-time">{totalTimeDisplay}</span>
          <progress className="progress" max="100" value={progresss}></progress>
        </div>
        <div className="play-controls__secondary">
          <button className="btn player-button icon--shuffle gamma btn--dark"></button>
          <button className="btn player-button icon--loop gamma btn--dark"></button>
        </div>
      </section>
    );
  }
});

module.exports = PlayerControls;
