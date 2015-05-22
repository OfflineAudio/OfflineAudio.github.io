import React from 'react'
import LibraryStore from '../stores/LibraryStore'
import EditTrack from './EditTrack.react'
import PureComponent from './PureComponent.react'

export default class Edit extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      id: this.context.router.getCurrentParams().id,
      track: LibraryStore.getTrackById(id)
    };
  }

  render () {
    const track = LibraryStore.getTrackById(this.state.id)
    let elem
    if (track) {
      elem = <EditTrack track={track} />
    } else {
      elem = <div>Error Page</div>
    }
    return elem
  }
}

Edit.contextTypes = {
  router: React.PropTypes.func.isRequired
}
