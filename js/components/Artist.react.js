import React from 'react'
import {Link} from 'react-router'
import PureComponent from './PureComponent.react'

export default class Artist extends PureComponent {
  render () {
    const {artist} = this.props

    return (
      <li className='filter__item'>
      <Link className='btn filter__item__button filter__item--button' to='artist' params={{artist: artist}}>
        {artist}
      </Link>
      </li>
    )
  }
}
