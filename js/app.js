/* global React, Route, DefaultRoute */
const React = require('react')
const Router = require('react-router')
const DefaultRoute = Router.DefaultRoute
const Link = Router.Link
const Route = Router.Route
const MusicPlayer = require('./components/MusicPlayer.react')
const TrackList = require('./components/TrackList.react')
const LibraryStore = require('./stores/LibraryStore')
const _ = require('lodash')
// const a11y = require('react-a11y')
// a11y()

const StartSplash = React.createClass({
  displayName: 'StartSplash',
  render () {
    return (
      <div className="yell">
        <div className="yell__container">
          <span className="yell__icon icon--note-beamed"></span>
        </div>
      </div>
    )
  }
})

const AllArtists = React.createClass({
  displayName: 'AllArtists',
  render () {
    return (
      <div>
        <header>
          This will the all artists view
        </header>
      </div>
    )
  }
})

const Artists = React.createClass({
  displayName: 'Artists',
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },
  render () {
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
})

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

const Favourites = React.createClass({
  displayName: 'Favourites',
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
})

const routes = (
  <Route name="app" path="/" handler={MusicPlayer}>
    <Route name="search" path="search/:search" handler={Results}/>
    <Route name="artist" path="artist/:artist" handler={Artists}/>
    <Route name="favourites" path="favourites" handler={Favourites}/>
    <Route name="artists" handler={AllArtists}/>
    <DefaultRoute handler={StartSplash}/>
  </Route>
)

Router.run(routes, Router.HistoryLocation, function (Handler) {
  React.render(<Handler/>, document.body)
})
