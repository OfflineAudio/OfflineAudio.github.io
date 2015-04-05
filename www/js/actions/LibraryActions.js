const AppDispatcher = require('../dispatcher/AppDispatcher')
const LibraryConstants = require('../constants/LibraryConstants')
const Library = require('../utils/Library')

function createLibrary (docs) {
  return docs.reduce(function (library, b) {
    const artist = library[b.artist] || (library[b.artist] = Object.create(null))
    const album = artist[b.album] || (artist[b.album] = Object.create(null))
    const track = album[b.title] || (album[b.title] = Object.create(null))
    track['id'] = b._id
    track['rev'] = b._rev
    track['album'] = b.album
    track['artist'] = b.artist
    track['genre'] = b.genre
    track['title'] = b.title
    track['number'] = b.track
    track['year'] = b.year
    track['_attachments'] = b._attachments
    track['favourite'] = b.favourite
    return library
  }, Object.create(null))
}

function pluckDocs (data) {
  return data.rows.map(row => row.doc)
}

function dispatchSuccessUpdate (library) {
  AppDispatcher.handleAction({
    actionType: LibraryConstants.LIBRARY_UPDATE_SUCCESS,
    data: library
  })
}

function dispatchErrorUpdate (err) {
  console.error(err)
}

const LibraryActions = {
  update: function () {
    Library.read()
      .then(pluckDocs)
      .then(createLibrary)
      .then(dispatchSuccessUpdate)
      .catch(dispatchErrorUpdate)

    AppDispatcher.handleAction({
      actionType: LibraryConstants.LIBRARY_UPDATE,
      data: null
    })
  },
  favourite (id, rev, artist, album, title) {
    Library.favourite(id, rev)
    .then(result => {
      AppDispatcher.handleAction({
        actionType: LibraryConstants.FAVOURITE,
        data: {id, old_rev: rev, new_rev: result.rev, artist, album, title}
      })
    })
  },
}

module.exports = LibraryActions
