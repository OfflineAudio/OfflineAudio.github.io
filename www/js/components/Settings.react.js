const React = require('react')
const LibraryActions = require('../actions/LibraryActions')
const PureRenderMixin = require('react/addons').addons.PureRenderMixin

const Settings = React.createClass({
  mixins: [PureRenderMixin],
  onClick (event) {
    LibraryActions.exportDb()
  },
  render () {
    return (
      <button onClick={this.onClick}>Export Library</button>
    )
  }
})

module.exports = Settings
