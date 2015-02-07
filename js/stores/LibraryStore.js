var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var FileUploaderConstants = require('../constants/FileUploaderConstants');
var LibraryConstants = require('../constants/LibraryConstants');
var _ = require('underscore');

// Define initial data points
var _library = {}; // Artist -> Album -> Title

function artistExists(artist) {
  return !!_library[artist]
}

function albumExistsByArtist(artist, album) {
  return artistExists(artist) && !!_library[artist][album];
}

function trackExistsInAlbum(artist, album, track) {
  return albumExistsByArtist(artist, album) && !!_library[artist][album][track]
}

function update(library) {
  _library = library;
}

// Add songs to library
function add(files) {
  var tracks = files.map(function(file) {
    debugger;
    var artist = file.artist;
    var album = file.album;
    var title = file.title;
    var _id = file._id;
    var _rev = file._rev;
    if (artistExists(artist)) {
      if (albumExistsByArtist(artist, album)) {
        if (trackExistsInAlbum(artist, album, title)) {
          console.warn("What do?");
        } else {
          _library[artist][album][title] = {
            id: _id,
            rev: _rev
          };
        }
      } else {
        _library[artist][album] = {};
        _library[artist][album][title] = {
          id: _id,
          rev: _rev
        };
      }
    } else {
      _library[artist] = {};
      _library[artist][album]= {};
      _library[artist][album][title] = {
        id: _id,
        rev: _rev
      };
    }
  })

}

// Remove item from cart
function removeItem(sku) {
  delete _library[sku];
}

// Extend Cart Store with EventEmitter to add eventing capabilities
var LibraryStore = _.extend({}, EventEmitter.prototype, {

  // Return cart items
  getArtists: function() {
    return Object.keys(_library);
  },

  // Return # of items in cart
  getAlbums: function() {
    var albums = this.getArtists().map(function(artist) {
      return this.getAlbumsByArtist(artist)
    }).reduce(function(a,b) {
      return a.concat(b);
    });
    return albums;
  },

  // Return cart cost total
  getAlbumsByArtist: function(artist) {
    var albums = [];
    for(var album in _library[artist]){
      albums.push(album);
    }
    return albums;
  },

  getAlbumByArtist: function(artist, album) {
    if (albumExistsByArtist(artist, album)) {
      _library[artist][album]
    } else {
      console.warn("What do?!");
    }
  },

  getLibrary: function() {
    return _library;
  },

  // Emit Change event
  emitChange: function() {
    this.emit('change');
  },

  // Add change listener
  addChangeListener: function(callback) {
    this.on('change', callback);
  },

  // Remove change listener
  removeChangeListener: function(callback) {
    this.removeListener('change', callback);
  }

});

// Register callback with AppDispatcher
AppDispatcher.register(function(payload) {
  var action = payload.action;
  var text;

  switch(action.actionType) {

    // Respond to FILE_ADD_SUCCESS action
    case FileUploaderConstants.FILE_ADD_SUCCESS:
    debugger;
      add(action.data); // TODO
      break;
    case LibraryConstants.LIBRARY_UPDATE_SUCCESS:
      // debugger;
      update(action.data);
      break;
    default:
      return true;
  }

  // If action was responded to, emit change event
  LibraryStore.emitChange();

  return true;

});

module.exports = LibraryStore;