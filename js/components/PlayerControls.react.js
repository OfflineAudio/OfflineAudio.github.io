const React = require('react')
const PlayerActions = require('../actions/PlayerActions')
const PureRenderMixin = require('react/addons').addons.PureRenderMixin
const PropCheckMixin = require('../mixins/PropCheckMixin')

function secondsToMinutesAndSeconds (_seconds) {
  const minutes = parseInt(_seconds / 60, 10)
  const seconds = parseInt(_seconds % 60, 10)
  return minutes + ':' + ((seconds < 10) ? '0' + seconds : seconds)
}

function handlePause () {
  // debugger
  PlayerActions.pauseCurrentSong()
}

function handlePlay () {
  // debugger
  PlayerActions.playCurrentSong()
}

function handlePrev () {
  PlayerActions.playPrevSong()
}

function handldNext () {
  PlayerActions.playNextSong()
}

const PlayerControls = React.createClass({
  mixins: [PureRenderMixin, PropCheckMixin],
  displayName: 'PlayerControls',
  propTypes: {
    // An optional string prop named "description".
    artist: React.PropTypes.string.isRequired,
    currentTime: React.PropTypes.number.isRequired,
    title: React.PropTypes.string.isRequired,
    totalTime: React.PropTypes.number.isRequired,
    progresss: React.PropTypes.number.isRequired,
    playing: React.PropTypes.bool.isRequired
  },
  render () {
    const {artist, currentTime, title, totalTime, progresss, playing} = this.props
    let currentTimeDisplay = secondsToMinutesAndSeconds(currentTime)
    let totalTimeDisplay = secondsToMinutesAndSeconds(totalTime)
    let playButton
    if (playing) {
      playButton = <button className='btn player-button icon--pause alpha btn--light' onClick={handlePause}></button>
    } else {
      playButton = <button className='btn player-button icon--play alpha btn--light' onClick={handlePlay}></button>
    }

    return (
      <section className='play-controls'>
        <button className='btn player-button icon--fast-backward gamma btn--dark' onClick={handlePrev}></button>
        {playButton}
        <button className='btn player-button icon--fast-forward gamma btn--dark' onClick={handldNext}></button>
        <div className='play-controls__playback'>
          <span className='playback playback--title'>{artist} - {title}</span>
          <span className='playback playback--current-time'>{currentTimeDisplay}</span>
          <span className='playback playback--total-time'>{totalTimeDisplay}</span>
          <progress className='progress' max='100' value={progresss}></progress>
        </div>
        <div className='play-controls__secondary'>
          <button className='btn player-button icon--shuffle gamma btn--dark'></button>
          <button className='btn player-button icon--loop gamma btn--dark'></button>
        </div>
      </section>
    )
  }
})

module.exports = PlayerControls
