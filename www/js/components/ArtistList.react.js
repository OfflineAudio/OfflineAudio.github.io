import React from 'react'
import {Link} from 'react-router'
import Artist from './Artist.react'
import PureComponent from './PureComponent.react'

export default class ArtistList extends PureComponent {
  render () {
    const {artists} = this.props

    const artistList = artists.map(function (artist, index) {
      return <Artist artist={artist} key={index}/>
    })

    return (
      <ul className='list-block filter'>
        <li className='filter__item filter__item--heading gamma'>
          <Link to='artists'>Artists</Link>
        </li>
        {artistList}
      </ul>
    )
  }
}
