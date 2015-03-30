const React = require('react')
const Router = require('react-router')
const Artist = require('./Artist.react')

const Link = Router.Link

const ArtistList = React.createClass({
  displayName: 'ArtistList',
  propTypes: {
    // An optional string prop named "description".
    artists: React.PropTypes.array.isRequired
  },
  render () {
    const {artists} = this.props

    const artistList = artists.map(function (artist, index) {
      return <Artist artist={artist} key={index}/>
    })

    return (
      <ul className="list-block filter">
        <li className="filter__item filter__item--heading gamma">
          <Link to="artists">Artists</Link>
        </li>
        {artistList}
      </ul>
    )
  }
})

module.exports = ArtistList
