import React from 'react'
import LibraryStore from '../stores/LibraryStore'
import TrackList from './TrackList.react'
import PureComponent from './PureComponent.react'

export default class Artists extends PureComponent {
  render () {
    // TODO: Possible optimisation - Look into this - Should store getters be accessed inside the render function?
    const tracks = LibraryStore.getTracksByArtist(this.context.router.getCurrentParams().artist)

    let elem
    if (tracks.length > 0) {
      // show tracks
      elem = <TrackList tracks={tracks} />
    } else {
      // show error screen
      elem = <div> Error page </div>
    }
    return elem
  }
}
