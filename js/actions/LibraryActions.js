import AppDispatcher from '../dispatcher/AppDispatcher'
import LibraryConstants from '../constants/LibraryConstants'
import Library from '../utils/Library'

export const createLibrary = docs =>
  docs.reduce(function (library, b) {
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

const pluckDocs = data => data.rows.map(row => row.doc)

const dispatchSuccessUpdate = library =>
  AppDispatcher.handleAction({
    actionType: LibraryConstants.LIBRARY_UPDATE_SUCCESS,
    data: library
  })

const dispatchErrorUpdate = err => console.error(err)

export const exportDb = () => Library.exportDb()

export const update = () => {
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
export const favourite = (id, rev, artist, album, title) =>
  Library.favourite(id, rev)
  .then(result => {
    AppDispatcher.handleAction({
      actionType: LibraryConstants.FAVOURITE,
      data: {id, old_rev: rev, new_rev: result.rev, artist, album, title}
    })
  })

export const updateTrack = track =>
  Library.updateTrack(track.id, track.rev, track.artist, track.album, track.title, track.genre, track.number, track.year)
  .then(result => {
    if (result.ok) {
      const oldTrackId = track.id
      const oldTrackRev = track.rev
      track.id = result.id
      track.rev = result.rev
      AppDispatcher.handleAction({
        actionType: LibraryConstants.UPDATE_TRACK,
        data: {oldTrackId, oldTrackRev, track}
      })
    }
  })
