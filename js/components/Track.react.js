const React = require('react')
const PlayerActions = require('../actions/PlayerActions')

const Track = React.createClass({
  addToQueue (event) {
    const id = [this.props.artist, this.props.album, this.props.title].join('-||-||-')
    const file = this.props.file
    PlayerActions.addToQueue(id, file)
    event.stopPropagation()
  },
  displayName: 'Track',
  propTypes: {
    // An optional string prop named "description".
    album: React.PropTypes.string.isRequired,
    artist: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
    file: React.PropTypes.string.isRequired,
    trackNumber: React.PropTypes.string.isRequired,
    duration: React.PropTypes.string.isRequired,
    playing: React.PropTypes.string.isRequired,
    favourite: React.PropTypes.string.isRequired
  },
  handleFavourite (event) {
    // debugger
    // update track in db with new favourite value
  },
  handleClick (event) {
    if (event.target.nodeName !== 'LABEL') {
      const id = [this.props.artist, this.props.album, this.props.title].join('-||-||-')
      const file = this.props.file
      PlayerActions.playNewSong(id, file)
      event.stopPropagation()
    }
  },
  render () {
    const {trackNumber, duration, title, playing, favourite} = this.props
    let iconStyles = (/*playing*/ false) ? 'track-info track-info--current-track icon--dot track-info--current-track--active' : 'track-info track-info--current-track'

    return (
      <li className="tracklist__item" onClick={this.handleClick}>
        <div className="track-info track-info--number">
            {trackNumber}
        </div>
        <div className={iconStyles}>
        </div>
        <div className="track-info track-info--title">
            {title}
        </div>
        <div className="track-info track-info--total-time">
            {duration}
        </div>
        <ul className="list-inline track-option track-option--horizontal">
          <li className="track-option__item">
            <button type="button" className="btn track-option__item__button icon--dot-2"></button>
            <ul className="list-inline track-option__sub-menu track-option__sub-menu--horizontal">
              <li className="track-option__item">
                <button type="button" className="btn track-option__item__button icon--trash"></button>
              </li>
              <li className="track-option__item">
                <button type="button" className="btn track-option__item__button icon--pencil" onClick={this.addToQueue}></button>
              </li>
            </ul>
          </li>
          <li className="track-option__item">
            <input className="favourite-button__checkbox" type="checkbox" id="my-track-2" checked={favourite} onChange={this.handleFavourite}/>
            <label className="btn track-option__item__button favourite-button__icon icon" htmlFor="my-track-2" ></label>
          </li>
        </ul>
      </li>
    )
  }
})

module.exports = Track
