/* global self */
self.importScripts('../../dist/worker-addons.min.js')
// PouchDB.debug.enable('*')
self.PouchDB.plugin(self.pouchdbReplicationStream.plugin)
self.PouchDB.adapter('writableStream', self.pouchdbReplicationStream.adapters.writableStream);

const db = new self.PouchDB('offlineAudio-V5')
const readTags = Promise.promisify(self.id3js)

const readFile = file =>
  new Promise((resolve, reject) => {
    const reader = new self.FileReader()
    reader.onload = (file => e => resolve(e.target.result))(file)
    reader.readAsArrayBuffer(file)
  })

const addBlobAsAttachment = (doc, blob, name, type) => {
  doc['_attachments'] = {
    [name]: {
      data: blob,
      content_type: type
    }
  }
  return doc
}

const addSong = file =>
  new Promise((resolve, reject) => {
    songExists(file).then(exists => {
      if (exists) {
        resolve()
      } else {
        const name = file.name
        const type = file.type
        const doc = generateDoc(file)
        const blob = readFile(file).then(arrayBuffer => self.blobUtil.arrayBufferToBlob(arrayBuffer, type))

        Promise.join(doc, blob, name, type, addBlobAsAttachment)
        .then(doc => db.post(doc))
        .then(doc => db.get(doc.id))
        .then(song => {
          self.postMessage(song)
          return resolve(file.size)
        })
        .catch(err => console.error(err))
      }
    })
  })

const generateDoc = file =>
  readTags(file).then(tags => {
    const {album, title, year} = tags
    const {genre, track} = tags.v1
    let {artist} = tags

    artist = Array.from(artist || 'Unknown Artist').filter(c => c !== '\x00').join('') // TODO: investigate into why artist names break

    return {
      _id: [artist, album, title].join('-||-||-'),
      artist: artist,
      title: title || file.size + ' ' + file.name,
      album: album || 'Unknown Album',
      track: track || 0,
      genre: genre || 'Unknown Genre',
      year: year || 0,
      favourite: false,
      duration: 0 // TODO: Need to find a way to grab duration from file. Only way so far is to buffer song completely.
    }
  })

const songExists = file =>
  generateDoc(file)
  .then(doc => db.get(doc._id))
  .then(data => true)
  .catch(err => {
    if (err['status'] === 404) {
      return false
    } else {
      throw (err)
    }
  })

const read = () =>
  db.allDocs({include_docs: true})
  .then(docs => self.postMessage(docs))

const getTracksByArtist = artist =>
  db.allDocs()
  .then(response => response.rows.filter(doc => doc.id.split('-||-||-')[0] === artist))
  .then(tracks => self.postMessage(tracks))

const getArtists = () =>
  db.allDocs()
  .then(response => {
    response.rows.reduce((artists, doc) => {
      let artist = doc.id.split('-||-||-')[0]
      artists.add(artist)
      return artists
    }, new Set())
  })

const getAlbums = () =>
  db.allDocs()
  .then(response => {
    response.rows.reduce((artists, doc) => {
      let artist = doc.id.split('-||-||-')[1]
      artists.add(artist)
      return artists
    }, new Set())
  })

const getTracks = () =>
  db.allDocs()
  .then(respons => {
    response.rows.reduce((artists, doc) => {
      let artist = doc.id.split('-||-||-')[2]
      artists.add(artist)
      return artists
    }, new Set())
  })

const getAttachment = (id, attachment) =>
  db.getAttachment(id, attachment)
  .then(attachment => self.blobUtil.blobToArrayBuffer(attachment))
  .then(attachment => self.postMessage(attachment))

const deleteTrack = (id, rev) =>
  db.remove(id, rev)
  .then(result => self.postMessage(result))
  .catch(err => console.log(err))

const toggleFavouriteTrack = (id, rev) =>
  db.get(id, {rev})
  .then((doc) => {
    doc.favourite = !doc.favourite
    return db.put(doc);
  })
  .then(result => self.postMessage(result))
  .catch(err => console.log(err))

const updateTrack = (id, rev, artist, album, title, genre, number, year) => {
  const oldTrack = Promise.resolve(db.get(id, {rev}))
  const newTrack = oldTrack.then(doc => {
    doc.id = createId(artist, album, title)
    doc.artist = artist
    doc.album = album
    doc.title = title
    doc.genre = genre
    doc.number = number
    doc.year = year
    return db.put(doc);
  })

  return newTrack.then(result => {
    if (result.ok) {
      if (oldTrack.value().id !== createId(artist, album, title)) {
        return db.remove(oldTrack.value())
      }
    }
    return result
  })
  .then(result => newTrack.value())
  .then(result => self.postMessage(result))
  .catch(err => console.log(err))
}

const createId = (artist, album, title) => [artist, album, title].join('-||-||-')

const exportDb = () => {
  new Promise((resolve, reject) => {
    var ws = new self.concatStream((data) => resolve(data))
    db.dump(ws).then(res => console.log(res))
  })
  .then(result => self.postMessage(result))
  .catch(err => console.log(err))
}

const importFiles = Promise.coroutine(function * chunkFiles (files) {
  let overallSize = 0
  for (let file of files) {
    overallSize += yield addSong(file)
  }
  console.debug('Imported size in bytes:', overallSize, 'In MB:', overallSize / 1024 / 1024)
})

const close_thread = () => self.close()

self.addEventListener('message', event => {
  const data = event.data
  switch (data.cmd) {
    case 'addSongs':
      importFiles(data.data)
      .then(close_thread)
      break
    case 'read':
      read()
      .then(close_thread)
      break
    case 'getArtists':
      getArtists()
      .then(close_thread)
      break
    case 'getAlbums':
      getAlbums()
      .then(close_thread)
      break
    case 'getTracks':
      getTracks()
      .then(close_thread)
      break
    case 'getTracksByArtist':
      getTracksByArtist(data.data)
      .then(close_thread)
      break
    case 'getAttachment':
      getAttachment(data.data.id, data.data.attachment)
      .then(close_thread)
      break
    case 'deleteTrack':
      deleteTrack(data.data.id, data.data.rev)
      .then(close_thread)
      break
    case 'toggleFavouriteTrack':
      toggleFavouriteTrack(data.data.id, data.data.rev)
      .then(close_thread)
      break
    case 'updateTrack':
      updateTrack(data.data.id, data.data.rev, data.data.artist, data.data.album, data.data.title, data.data.genre, data.data.number, data.data.year)
      .then(close_thread)
      break
    case 'exportDb':
      exportDb()
      .then(close_thread)
  }
})
