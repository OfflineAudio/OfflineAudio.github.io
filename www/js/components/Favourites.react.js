import React from 'react'
import LibraryStore from '../stores/LibraryStore'
import TrackList from './TrackList.react'
import PureComponent from './PureComponent.react'

export default class Favourites extends PureComponent {
  render () {
    const favouritedTracks = LibraryStore.getFavouriteTracks()

    let elem
    if (favouritedTracks.length > 0) {
      // show tracks
      elem = <TrackList tracks={favouritedTracks} />
    } else {
      // show error screen
      elem = <div> Search returned no results </div>
    }
    return elem
  }
}
