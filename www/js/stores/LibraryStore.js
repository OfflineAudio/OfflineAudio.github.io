const AppDispatcher = require('../dispatcher/AppDispatcher')
const EventEmitter = require('events').EventEmitter
const FileUploaderConstants = require('../constants/FileUploaderConstants')
const LibraryConstants = require('../constants/LibraryConstants')
const _ = require('lodash')

// Define initial data points
var _library = {} // Artist -> Album -> Title

function artistExists (artist) {
  return !!_library[artist]
}

function albumExistsByArtist (artist, album) {
  return artistExists(artist) && !!_library[artist][album]
}

function trackExistsInAlbum (artist, album, track) {
  return albumExistsByArtist(artist, album) && !!_library[artist][album][track]
}

function update (library) {
  _library = library
}

// Add songs to library
function addSong (file) {
  debugger
  const {_id, _rev, album, artist, genre, title, track, year, _attachments, favourite} = file
  if (artistExists(artist)) {
    if (albumExistsByArtist(artist, album)) {
      if (trackExistsInAlbum(artist, album, title)) {
        console.warn('What do?')
        // _library[artist][album][title] = {
        //   id: _id,
        //   rev: _rev
        // }
      } else {
        _library[artist][album][title] = {
          id: _id,
          rev: _rev,
          album: album,
          artist: artist,
          genre: genre,
          title: title,
          number: track,
          year: year,
          _attachments: _attachments,
          favourite: favourite
        }
      }
    } else {
      _library[artist][album] = {}
      _library[artist][album][title] = {
        id: _id,
        rev: _rev,
        album: album,
        artist: artist,
        genre: genre,
        title: title,
        number: track,
        year: year,
        _attachments: _attachments,
        favourite: favourite
      }
    }
  } else {
    _library[artist] = {}
    _library[artist][album] = {}
    _library[artist][album][title] = {
      id: _id,
      rev: _rev,
      album: album,
      artist: artist,
      genre: genre,
      title: title,
      number: track,
      year: year,
      _attachments: _attachments,
      favourite: favourite
    }
  }
}

function deleteSong (song) {
  if (_library[song.artist][song.album][song.title].id == song.id && _library[song.artist][song.album][song.title].rev == song.rev) {
    delete _library[song.artist][song.album][song.title]
    if (isEmpty(_library[song.artist][song.album])) {
      delete _library[song.artist][song.album]
      if (isEmpty(_library[song.artist])) {
        delete _library[song.artist]
      }
    }
  }
}

function toggleFavourite(song) {
  if (_library[song.artist][song.album][song.title].id == song.id && _library[song.artist][song.album][song.title].rev == song.old_rev) {
    _library[song.artist][song.album][song.title].rev = song.new_rev
    _library[song.artist][song.album][song.title].favourite = !_library[song.artist][song.album][song.title].favourite
  }
}

function isEmpty(obj){
    return (Object.getOwnPropertyNames(obj).length === 0);
}

var LibraryStore = _.extend({}, EventEmitter.prototype, {

  getArtists () {
    return Object.keys(_library)
  },

  getTracks () {
    return _.flattenDeep(_.map(this.getArtists(), artist => _.map(this.getAlbumsByArtist(artist, true), this.getTracksOfAlbums), this))
  },

  getTracksOfAlbums (album) {
    return _.map(album, function (doc, trackName) {
      return {[trackName]: doc}
    })
  },

  getTracksByArtist (artist) {
    return _.flatten(_.map(this.getAlbumsByArtist(artist, true), this.getTracksOfAlbums))
  },

  getAlbums () {
    return _.flatten(this.getAllAlbumsSortedByArtist())
  },

  getAllAlbumsSortedByArtist () {
    return _.map(this.getArtists(), this.getAlbumsByArtist)
  },

  // Return cart cost total
  getAlbumsByArtist (artist, include_tracks) {
    if (include_tracks) {
      return _library[artist]
    } else {
      return Object.keys(_library[artist])
    }
  },

  getAlbumByArtist (artist, album) {
    if (albumExistsByArtist(artist, album)) {
      return _library[artist][album]
    } else {
      console.warn('What do?!')
    }
  },

  getFavouriteTracks () {
    return _.filter(this.getTracks(), track => track[Object.keys(track)[0]].favourite)
  },

  getLibrary () {
    return _library
  },

  // Emit Change event
  emitChange () {
    this.emit('change')
  },

  // Add change listener
  addChangeListener (callback) {
    this.on('change', callback)
  },

  // Remove change listener
  removeChangeListener (callback) {
    this.removeListener('change', callback)
  }

})

// Register callback with AppDispatcher
AppDispatcher.register(function (payload) {
  var action = payload.action

  switch (action.actionType) {
    case LibraryConstants.DELETE_TRACK:
      deleteSong(action.data)
    break
    // Respond to FILE_ADD_SUCCESS action
    case FileUploaderConstants.FILE_ADD_SUCCESS:
      addSong(action.data) // TODO
      break
    case LibraryConstants.LIBRARY_UPDATE_SUCCESS:
      update(action.data)
      break
    case LibraryConstants.FAVOURITE:
      toggleFavourite(action.data)
      break
    default:
      return true
  }

  // If action was responded to, emit change event
  LibraryStore.emitChange()

  return true
})

module.exports = LibraryStore
