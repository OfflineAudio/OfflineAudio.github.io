const React = require('react')
const PureRenderMixin = require('react/addons').addons.PureRenderMixin
const PropCheckMixin = require('../mixins/PropCheckMixin')

const Visualiser = React.createClass({
  mixins: [PureRenderMixin, PropCheckMixin],
  propTypes: {
  },
  render () {
    return (
      <canvas></canvas>
    )
  }
})

module.exports = Visualiser
