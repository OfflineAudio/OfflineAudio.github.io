const React = require('react')
const FileUploader = require('./FileUploader.react')
const ArtistList = require('./ArtistList.react')
const PureRenderMixin = require('react/addons').addons.PureRenderMixin
const PropCheckMixin = require('../mixins/PropCheckMixin')

const PlayerSideMenu = React.createClass({
  mixins: [PureRenderMixin, PropCheckMixin],
  displayName: 'PlayerSideMenu',
  propTypes: {
    artists: React.PropTypes.array.isRequired
  },
  render () {
    const {artists} = this.props

    return (
      <section className="side-menu">
        <FileUploader/>
        <input type="search" className="search-field" placeholder="Search" />
        <ArtistList artists={artists}/>
      </section>
    )
  }
})

module.exports = PlayerSideMenu
