import React from 'react'
import FileUploader from './FileUploader.react'
import ArtistList from './ArtistList.react'
import PropCheckMixin from '../mixins/PropCheckMixin'
import {Link} from 'react-router'
const PureRenderMixin = require('react/addons').addons.PureRenderMixin

const PlayerSideMenu = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },
  mixins: [PureRenderMixin, PropCheckMixin],
  displayName: 'PlayerSideMenu',
  propTypes: {
    artists: React.PropTypes.array.isRequired
  },
  search (event) {
    if (event.target.value) {
      this.context.router.transitionTo('/search/' + event.target.value);
    } else {
      this.context.router.transitionTo('/');
    }
  },
  render () {
    const {artists} = this.props

    return (
      <section className="side-menu">
        <FileUploader/>
        <input type="search" className="search-field" placeholder="Search" onChange={this.search}/>
        <ul className="list-block filter">
          <li className="filter__item filter__item--heading gamma">
            <Link to="favourites">Favourites</Link>
          </li>
        </ul>
        <ArtistList artists={artists}/>
      </section>
    )
  }
})

export default PlayerSideMenu
