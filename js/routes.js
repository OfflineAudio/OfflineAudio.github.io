import React from 'react';
import {DefaultRoute, Route} from 'react-router'
import _ from 'lodash'

import MusicPlayer from './components/MusicPlayer.react'
import TrackList from './components/TrackList.react'
import EditTrack from './components/EditTrack.react'
import Settings from './components/Settings.react'
import StartSplash from './components/StartSplash.react'
import AllArtists from './components/AllArtists.react'
import Favourites from './components/Favourites.react'
import Results from './components/Results.react'
import Edit from './components/Edit.react'
import Artists from './components/Artists.react'

const routes = (
  <Route name="app" path="/" handler={MusicPlayer}>
    <Route name="search" path="search/:search" handler={Results}/>
    <Route name="edits" path="edit/:id" handler={Edit}/>
    <Route name="artist" path="artist/:artist" handler={Artists}/>
    <Route name="favourites" path="favourites" handler={Favourites}/>
    <Route name="artists" handler={AllArtists}/>
    <Route name="settings" path="/settings/export" handler={Settings}/>
    <DefaultRoute handler={StartSplash}/>
  </Route>
)

export default routes
