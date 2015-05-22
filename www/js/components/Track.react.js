import React from 'react'
import {Link} from 'react-router'
import * as PlayerActions from '../actions/PlayerActions'
import * as LibraryActions from '../actions/LibraryActions'
import PropCheckMixin from '../mixins/PropCheckMixin'
const PureRenderMixin = require('react/addons').addons.PureRenderMixin

const Track = React.createClass({
  mixins: [PureRenderMixin, PropCheckMixin],
  addToQueue (event) {
    const id = [this.props.artist, this.props.album, this.props.title].join('-||-||-')
    const attachment = this.props.attachment
    PlayerActions.addToQueue(id, attachment)
    event.stopPropagation()
  },
  delete (event) {
    const id = this.props.id
    const rev = this.props.rev
    const artist = this.props.artist
    const album = this.props.album
    const title = this.props.title
    PlayerActions.deleteTrack(id, rev, artist, album, title)
    event.stopPropagation()
  },
  editTrack (event) {
    event.stopPropagation()
  },
  displayName: 'Track',
  propTypes: {
    album: React.PropTypes.string.isRequired,
    artist: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
    attachment: React.PropTypes.string.isRequired,
    trackNumber: React.PropTypes.number.isRequired,
    duration: React.PropTypes.string.isRequired,
    playing: React.PropTypes.bool.isRequired,
    favourite: React.PropTypes.bool.isRequired,
    id: React.PropTypes.string.isRequired,
    rev: React.PropTypes.string.isRequired,
    genre: React.PropTypes.string.isRequired
  },
  handleFavourite (event) {
    const id = this.props.id
    const rev = this.props.rev
    const artist = this.props.artist
    const album = this.props.album
    const title = this.props.title
    LibraryActions.favourite(id, rev, artist, album, title)
    event.stopPropagation()
  },
  handleClick (event) {
    if (event.target.nodeName !== 'LABEL' && event.target.nodeName !== 'INPUT' && event.target.nodeName !== 'BUTTON') {
      const id = [this.props.artist, this.props.album, this.props.title].join('-||-||-')
      const attachment = this.props.attachment
      PlayerActions.playSong(id, attachment)
      event.stopPropagation()
    }
  },
  render () {
    const {trackNumber, duration, title, playing, favourite, rev, genre, id} = this.props
    let iconStyles = (/*playing*/ false) ? 'track-info track-info--current-track icon--dot track-info--current-track--active' : 'track-info track-info--current-track'

    return (
      <li className='tracklist__item' onDoubleClick={this.handleClick}>
        <div className='track-info track-info--number'>
            {trackNumber}
        </div>
        <div className={iconStyles}>
        </div>
        <div className='track-info track-info--title'>
            {title}
        </div>
        <div className='track-info track-info--total-time'>
            {genre}
        </div>
        <ul className='list-inline track-option track-option--horizontal'>
          <li className='track-option__item'>
            <button type='button' className='btn track-option__item__button icon--dot-2'></button>
            <ul className='list-inline track-option__sub-menu track-option__sub-menu--horizontal'>
              <li className='track-option__item'>
                <button type='button' className='btn track-option__item__button icon--trash' onClick={this.delete}></button>
              </li>
              <li className='track-option__item'>
                <button type='button' className='btn track-option__item__button icon--list-add' onClick={this.addToQueue}></button>
              </li>
              <li className='track-option__item'>
                <Link className='btn track-option__item__button icon--pencil' to='edits' params={{id}}></Link>
              </li>
            </ul>
          </li>
          <li className='track-option__item'>
            <input className='favourite-button__checkbox' type='checkbox' id={rev} checked={favourite} onChange={this.handleFavourite}/>
            <label className='btn track-option__item__button favourite-button__icon icon' htmlFor={rev} ></label>
          </li>
        </ul>
      </li>
    )
  }
})

export default Track
