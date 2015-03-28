const React = require('react')
const Router = require('react-router')

const Link = Router.Link

const Artist = React.createClass({
  displayName: 'Artist',
  propTypes: {
    // An optional string prop named "description".
    artist: React.PropTypes.string.isRequired
  },
  handleClick (event) {
  },
  render () {
    const {artist} = this.props

    return (
      <li className="filter__item">
      <Link className="btn filter__item__button filter__item--button" to="artist" params={{artist: artist}}>
        {artist}
      </Link>
      </li>
    )
  }
})

module.exports = Artist
