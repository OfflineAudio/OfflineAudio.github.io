import React from 'react'
import {Link} from 'react-router'
import * as PlayerActions from '../actions/PlayerActions'
import PropCheckMixin from '../mixins/PropCheckMixin'
const PureRenderMixin = require('react/addons').addons.PureRenderMixin

const PlayerMenu = React.createClass({
  mixins: [PureRenderMixin, PropCheckMixin],
  displayName: 'PlayerMenu',
  propTypes: {
    // An optional string prop named "description".
    muted: React.PropTypes.bool.isRequired,
    volume: React.PropTypes.number.isRequired,
    title: React.PropTypes.string.isRequired
  },
  onChange (event) {
    PlayerActions.updateVolume(event.target.value)
  },
  handleMuteClick (event) {
    PlayerActions.mute()
  },
  render () {
    const {muted, title, volume} = this.props

    let muteButton
    if (muted) {
      muteButton = <button className="btn menu-button icon--sound gamma btn--dark btn--toggled" onClick={this.handleMuteClick}></button>
    } else {
      muteButton = <button className="btn menu-button icon--sound gamma btn--dark" onClick={this.handleMuteClick}></button>
    }

    return (
      <header className="player-menu">
        <div className="container">
          <span className="player-menu__app-title">
            {title}
          </span>
          <div className="player-menu__controls">
            {muteButton}
            <div className="volume-slider-wrapper">
              <input className="volume-slider" type="range" tabIndex="1" onChange={this.onChange} value={volume} max="1" step="0.01"/>
            </div>
            <button className="btn menu-button icon--menu gamma btn--dark"></button>
            <button className="btn menu-button icon--layout gamma btn--dark"></button>
            <Link className="btn menu-button icon--cog gamma btn--dark" to="settings"></Link>
          </div>
        </div>
      </header>
    )
  }
})

export default PlayerMenu
