import React from 'react'
import Artist from './Artist.react'
import Router from 'react-router'
// import PropCheckMixin from '../mixins/PropCheckMixin' //TODO: Figure out how to nicely use Mixins in ES6 Classes - decorator?
import PureComponent from './PureComponent.react'

export default class Library extends PureComponent {
  propTypes: {
    artists: React.PropTypes.array.isRequired,
    library: React.PropTypes.object.isRequired,
    showOnlyArtists: React.PropTypes.bool.isRequired
  }

  render () {
    const showOnlyArtists = this.props.showOnlyArtists
    const artists = this.props.artists || this.context.router.getCurrentParams()
    const library = this.props.library
    const Artists = artists.map((artist) => <Artist name={artist} albums={library[artist]} showOnlyArtists={showOnlyArtists} />)

    return (
      <div>
        {Artists}
      </div>
    )
  }
}

Library.contextTypes = {
  router: React.PropTypes.func.isRequired
}

