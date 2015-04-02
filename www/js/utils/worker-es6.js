/* global self */
self.importScripts('../../pouchdb.min.js')
self.importScripts('../../bluebird.min.js')
self.importScripts('../../id3js.min.js')
self.importScripts('../../blob-util.min.js')
self.importScripts('../../runtime.min.js')
self.importScripts('../../array-from.js')
// PouchDB.debug.enable('*')

const db = new self.PouchDB('offlineAudio-V4')
const readTags = Promise.promisify(self.id3js)

function readFile (file) {
  return new Promise(function (resolve, reject) {
    let reader = new self.FileReader()
    reader.onload = (function (file) {
      return function (e) {
        console.debug('File read into memory', Date(Date.now()))
        resolve(e.target.result)
      }
    })(file)
    reader.readAsArrayBuffer(file)
  })
}

function addBlobAsAttachment (doc, blob, name, type) {
  doc['_attachments'] = {
    [name]: {
      data: blob,
      content_type: type
    }
  }
  return doc
}

function addSong (file) {
  return new Promise(function (resolve, reject) {
    songExists(file).then(function (exists) {
      if (exists) {
        resolve()
      } else {
        const name = file.name
        const type = file.type
        const doc = generateDoc(file)
        const blob = readFile(file).then(arrayBuffer => self.blobUtil.arrayBufferToBlob(arrayBuffer, type))

        Promise.join(doc, blob, name, type, addBlobAsAttachment)
        .then(function (doc) {
          console.debug('Executing db.post', Date(Date.now()))
          return db.post(doc)
        })
        .then(function (doc) {
          console.debug('Executed db.post', Date(Date.now()))
          console.debug('Executing db.get', Date(Date.now()))
          return db.get(doc.id)
        })
        .then(function (song) {
          console.debug('Executed db.get', Date(Date.now()))
          self.postMessage(song)
          return resolve(file.size)
        })
          .catch(err => console.error(err))
      }
    })
  })
}

function generateDoc (file) {
  return readTags(file).then(function (tags) {
    const {album, title, year} = tags
    const {genre, track} = tags.v1
    let {artist} = tags

    artist = Array.from(artist || 'Unknown Artist').filter(function (c) {return c !== '\x00'}).join('')

    return {
      _id: [artist, album, title].join('-||-||-'),
      artist: artist,
      title: title || file.size + ' ' + file.name,
      album: album || 'Unknown Album',
      track: track || 0,
      genre: genre || 'Unknown Genre',
      year: year || 0,
      favourite: false,
      duration: 0 // Need to find a way to grab duration from file
    }
  })
}

function songExists (file) {
  return generateDoc(file)
  .then(doc => db.get(doc._id))
  .then(data => true)
  .catch(function (err) {
    if (err['status'] === 404) {
      return false
    } else {
      throw (err)
    }
  })
}

function read () {
  return db.allDocs({include_docs: true})
  .then(docs => self.postMessage(docs))
}

function getTracksByArtist (artist) {
  return db.allDocs()
    .then(function (response) {
      return response.rows.filter(function (doc) {
        return doc.id.split('-||-||-')[0] === artist
      })
    })
    .then(tracks => self.postMessage(tracks))
}

function getArtists () {
  return db.allDocs()
  .then(function (response) {
    console.log(response.rows.reduce(function (artists, doc) {
      let artist = doc.id.split('-||-||-')[0]
      artists.add(artist)
      return artists
    }, new Set()))
  })
}

function getAlbums () {
  return db.allDocs()
  .then(function (response) {
    console.log(response.rows.reduce(function (artists, doc) {
      let artist = doc.id.split('-||-||-')[1]
      artists.add(artist)
      return artists
    }, new Set()))
  })
}

function getTracks () {
  return db.allDocs()
  .then(function (response) {
    console.log(response.rows.reduce(function (artists, doc) {
      let artist = doc.id.split('-||-||-')[2]
      artists.add(artist)
      return artists
    }, new Set()))
  })
}

function getAttachment (id, attachment) {
  return db.getAttachment(id, attachment)
  .then(attachment => self.postMessage(attachment))
}

function deleteTrack (id, rev) {
  return db.remove(id, rev)
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

self.addEventListener('message', function (event) {
  const data = event.data
  switch (data.cmd) {
    case 'addSongs':
      importFiles(data.data)
      .then(() => self.close())
      break
    case 'read':
      read()
      .then(() => self.close())
      break
    case 'getArtists':
      getArtists()
      .then(() => self.close())
      break
    case 'getAlbums':
      getAlbums()
      .then(() => self.close())
      break
    case 'getTracks':
      getTracks()
      .then(() => self.close())
      break
    case 'getTracksByArtist':
      getTracksByArtist(data.data)
      .then(() => self.close())
      break
    case 'getAttachment':
      getAttachment(data.data.id, data.data.attachment)
      .then(() => self.close())
      break
    case 'deleteTrack':
      deleteTrack(data.data.id, data.data.rev)
      .then(() => self.close())
      break
  }
})
