import React from 'react'
import LibraryStore from '../stores/LibraryStore'
import TrackList from './TrackList.react'

const Results = React.createClass({
  displayName: 'Results',
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },
  render () {
    const tracks = LibraryStore.getTracks()
    const searchTerm = this.context.router.getCurrentParams().search
    const tracksWithSearchTerm =  _.filter(tracks, function(track) {
      return track[Object.keys(track)[0]].title.toLowerCase().includes(searchTerm.toLowerCase())
        || track[Object.keys(track)[0]].artist.toLowerCase().includes(searchTerm.toLowerCase())
        || track[Object.keys(track)[0]].album.toLowerCase().includes(searchTerm.toLowerCase())
    })

    let elem
    if (tracksWithSearchTerm.length > 0) {
      // show tracks
      elem = <TrackList tracks={tracksWithSearchTerm} />
    } else {
      // show error screen
      elem = <div> Search returned no results </div>
    }
    return elem
  }
})

export default Results
