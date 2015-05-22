import React from 'react'
import LibraryStore from '../stores/LibraryStore'
import PlayerMenu from './PlayerMenu.react'
import PlayerControls from './PlayerControls.react'
import PlayerSideMenu from './PlayerSideMenu.react'
import * as LibraryActions from '../actions/LibraryActions'
import PlayerStore from '../stores/PlayerStore'
import {RouteHandler} from 'react-router'

// Method to retrieve state from Stores
function getState () {
  return {
    artists: LibraryStore.getArtists(),
    artist: PlayerStore.getArtist() || '',
    title: PlayerStore.getTitle() || '',
    currentTime: PlayerStore.getCurrentTime() || 0,
    duration: PlayerStore.getDuration() || 0,
    progress: PlayerStore.getProgress() || 0,
    playing: PlayerStore.getPlaying() || false,
    volume: PlayerStore.getVolume() || 0,
    repeat: PlayerStore.getRepeat() || false,
    shuffle: PlayerStore.getShuffle() || false,
    hasNext: PlayerStore.hasNext() || false,
    hasPrev: PlayerStore.hasPrev() || false,
    previousSong: PlayerStore.getPrevSong(),
    nextSong: PlayerStore.getNextSong(),
    isMuted: PlayerStore.isMuted()
  }
}

const MusicPlayer = React.createClass({
  displayName: 'MusicPlayer',

  getInitialState () {
    return getState()
  },

  componentDidMount () {
    LibraryStore.addChangeListener(this._onChange)
    PlayerStore.addChangeListener(this._onChange)
    LibraryActions.update()
  },

  componentWillUnmount () {
    LibraryStore.removeChangeListener(this._onChange)
    PlayerStore.removeChangeListener(this._onChange)
  },

  render () {
    return (
      <div>
        <PlayerMenu title='Offline Audio' volume={this.state.volume} muted={this.state.isMuted}/>

        <div className='main-container'>
          <PlayerSideMenu artists={this.state.artists}/>

          <section className='player-contents'>
            <RouteHandler/>
          </section>
        </div>

        <PlayerControls artist={this.state.artist} currentTime={this.state.currentTime} title={this.state.title} totalTime={this.state.duration} progresss={this.state.progress} playing={this.state.playing} repeat={this.state.repeat} shuffle={this.state.shuffle} hasNext={this.state.hasNext} hasPrev={this.state.hasPrev} previousSong={this.state.previousSong} nextSong={this.state.nextSong}/>
      </div>
    )
  },

  _onChange () {
    this.setState(getState())
  }

})

export default MusicPlayer
