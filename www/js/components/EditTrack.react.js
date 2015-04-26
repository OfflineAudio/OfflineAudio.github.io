const React = require('react')
const PlayerActions = require('../actions/PlayerActions')
const LibraryActions = require('../actions/LibraryActions')
const PureRenderMixin = require('react/addons').addons.PureRenderMixin
const PropCheckMixin = require('../mixins/PropCheckMixin')
const forms = require('newforms')

const TrackForm = forms.Form.extend({
  artist: forms.CharField(),
  album: forms.CharField(),
  title: forms.CharField(),
  genre: forms.CharField(),
  number: forms.IntegerField({minValue: 0}),
  year: forms.IntegerField()
})

const EditTrack = React.createClass({
  onSubmit (event) {
    if (this.refs.trackForm.form.validate()) {
      LibraryActions.updateTrack(this.refs.trackForm.form.data)
    }
    event.preventDefault()
  },
  render () {
    const track = this.props.track
    return (
      <form onSubmit={this.onSubmit}>
        <forms.RenderForm form={TrackForm} data={track} ref="trackForm"/>
        <div>
          <input type="submit" value="Submit"/>{'  '}
          <input type="button" value="Cancel" onClick={this.onCancel}/>
        </div>
      </form>
    )
  }
})

module.exports = EditTrack
