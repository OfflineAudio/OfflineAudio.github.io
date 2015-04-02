const React = require('react')
const PlayerActions = require('../actions/PlayerActions')
const PureRenderMixin = require('react/addons').addons.PureRenderMixin
const PropCheckMixin = require('../mixins/PropCheckMixin')
const PlayerStore = require('../stores/PlayerStore')

function secondsToMinutesAndSeconds (_seconds) {
  const minutes = parseInt(_seconds / 60, 10)
  const seconds = parseInt(_seconds % 60, 10)
  return minutes + ':' + ((seconds < 10) ? '0' + seconds : seconds)
}

function handlePause () {
  PlayerActions.pause()
}

function handlePlay () {
  PlayerActions.play()
}

function handleShuffle () {
  PlayerActions.shuffle()
}

function handleRepeat () {
  PlayerActions.repeat()
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
    playing: React.PropTypes.bool.isRequired,
    repeat: React.PropTypes.bool.isRequired,
    hasNext: React.PropTypes.bool.isRequired,
    hasPrev: React.PropTypes.bool.isRequired,
    shuffle: React.PropTypes.bool.isRequired,
    previousSong: React.PropTypes.object.isRequired,
    nextSong: React.PropTypes.object.isRequired
  },
  componentDidMount () {
    PlayerStore.addAudioEventListener('ended', () => {
      if (this.props.hasNext) {
        PlayerActions.nextTrack(this.props.nextSong)
      } else {
        PlayerActions.stop()
      }
    }.bind(this))
  },
  handleNext () {
    PlayerActions.nextTrack(this.props.nextSong)
  },
  handlePrev () {
    PlayerActions.previousTrack(this.props.previousSong)
  },
  render () {
    const {artist, currentTime, title, totalTime, progresss, playing, repeat, shuffle, hasNext, hasPrev} = this.props
    let currentTimeDisplay = secondsToMinutesAndSeconds(currentTime)
    let totalTimeDisplay = secondsToMinutesAndSeconds(totalTime)
    let playButton
    if (playing) {
      playButton = <button className='btn player-button icon--pause alpha btn--light' onClick={handlePause}></button>
    } else {
      playButton = <button className='btn player-button icon--play alpha btn--light' onClick={handlePlay}></button>
    }

    let repeatButton
    if (repeat) {
      repeatButton = <button className='btn player-button icon--loop gamma btn--dark repeating' onClick={handleRepeat}></button>
    } else {
      repeatButton = <button className='btn player-button icon--loop gamma btn--dark' onClick={handleRepeat}></button>
    }

    let prevButton
    if (hasPrev) {
      prevButton = <button className='btn player-button icon--fast-backward gamma btn--dark' onClick={this.handlePrev}></button>
    } else {
      prevButton = <button className='btn player-button icon--fast-backward gamma btn--dark' onClick={this.handlePrev} disabled ></button>
    }

    let nextButton
    if (hasNext) {
      nextButton = <button className='btn player-button icon--fast-forward gamma btn--dark' onClick={this.handleNext}></button>
    } else {
      nextButton = <button className='btn player-button icon--fast-forward gamma btn--dark' onClick={this.handleNext} disabled ></button>
    }

    return (
      <section className='play-controls'>
        {prevButton}
        {playButton}
        {nextButton}
        <div className='play-controls__playback'>
          <span className='playback playback--title'>{artist} - {title}</span>
          <span className='playback playback--current-time'>{currentTimeDisplay}</span>
          <span className='playback playback--total-time'>{totalTimeDisplay}</span>
          <progress className='progress' max='100' value={progresss}></progress>
        </div>
        <div className='play-controls__secondary'>
          <button className='btn player-button icon--shuffle gamma btn--dark' onClick={handleShuffle}></button>
          {repeatButton}
        </div>
      </section>
    )
  }
})

module.exports = PlayerControls
