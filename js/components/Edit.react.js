import React from 'react'
import LibraryStore from '../stores/LibraryStore'
import EditTrack from './EditTrack.react'
import PureComponent from './PureComponent.react'

export default class Edit {
  constructor(props, context) {
    super(props);
    this.state = {
      id: context.router.getCurrentParams().id,
      track: LibraryStore.getTrackById(context.router.getCurrentParams().id)
    };
  }

  render () {
    let elem
    if (this.state.track) {
      elem = <EditTrack track={this.state.track} />
    } else {
      elem = <div>Error Page</div>
    }
    return elem
  }
}

Edit.contextTypes = {
  router: React.PropTypes.func.isRequired
}
