let AppDispatcher = require('../dispatcher/AppDispatcher')
let LibraryConstants = require('../constants/LibraryConstants')
let Library = require('../utils/Library')

function createLibrary (docs) {
  return docs.reduce(function(library, b) {
    let artist = library[b.artist] || (library[b.artist] = Object.create(null))
    let album = artist[b.album] || (artist[b.album] = Object.create(null))
    let track = album[b.title] || (album[b.title] = Object.create(null))
    track['id'] = b._id
    track['rev'] = b._rev
    return library
  }, Object.create(null))
}

function pluckDocs (data) {
  return data.rows.map(row => row.doc)
}

function dispatchSuccessUpdate(library) {
  AppDispatcher.handleAction({
    actionType: LibraryConstants.LIBRARY_UPDATE_SUCCESS,
    data: library
  })
}

function dispatchErrorUpdate(err) {
  console.error(err)
}

let LibraryActions = {
  update: function() {
    Library.read()
    .then(pluckDocs)
    .then(createLibrary)
    .then(dispatchSuccessUpdate)
    .catch(dispatchErrorUpdate)

    AppDispatcher.handleAction({
      actionType: LibraryConstants.LIBRARY_UPDATE,
      data: null
    })
  }
}

module.exports = LibraryActions
