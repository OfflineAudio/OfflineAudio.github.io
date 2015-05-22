import React from 'react'
import * as PlayerActions from '../actions/PlayerActions'
import * as LibraryActions from '../actions/LibraryActions'
// import PropCheckMixin from '../mixins/PropCheckMixin' //TODO: Figure out how to nicely use Mixins in ES6 Classes - decorator?
import forms from 'newforms'
import PureComponent from './PureComponent.react'
import Router from 'react-router'

const TrackForm = forms.Form.extend({
  artist: forms.CharField(),
  album: forms.CharField(),
  title: forms.CharField(),
  genre: forms.CharField(),
  number: forms.IntegerField({minValue: 0}),
  year: forms.IntegerField()
})

export default class EditTrack {
  onSubmit (event) {
    if (this.refs.trackForm.form.validate()) {
      LibraryActions.updateTrack(this.refs.trackForm.form.data)
      .then(() => Router.Navigation.transitionTo('app'))
    }

    event.preventDefault()
  }

  render () {
    const track = this.props.track
    return (
      <form onSubmit={this.onSubmit.bind(this)}>
        <forms.RenderForm form={TrackForm} data={track} ref='trackForm'/>
        <div>
          <input type='submit' value='Submit'/>
        </div>
      </form>
    )
  }
}
