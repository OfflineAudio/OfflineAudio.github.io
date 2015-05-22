import React from 'react'
import * as LibraryActions from '../actions/LibraryActions'
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

export default Settings
