const React = require('react')
const FileUploader = require('./FileUploader.react')
const ArtistList = require('./ArtistList.react')
const PureRenderMixin = require('react/addons').addons.PureRenderMixin
const PropCheckMixin = require('../mixins/PropCheckMixin')

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
        <ArtistList artists={artists}/>
      </section>
    )
  }
})

module.exports = PlayerSideMenu
