importScripts('../../pouchdb.min.js')
importScripts('../../bluebird.min.js')
importScripts('../../id3js.min.js')
importScripts('../../blob-util.min.js')
importScripts("../../runtime.min.js")
// PouchDB.debug.enable('*')

const db = new PouchDB('offlineAudio-V1')
const readTags = Promise.promisify(id3js)

function readFile(file) {
  return new Promise(function(resolve, reject) {
    let reader = new FileReader()
    reader.onload = (function(file) {
      return function (e) {
        console.debug("File read into memory", Date(Date.now()))
        resolve(e.target.result)
      }
    })(file)
    reader.readAsArrayBuffer(file)
  })
}

function addBlobAsAttachment(doc, blob, name, type) {
  doc["_attachments"] = {
    [name]: {
      data: blob,
      content_type: type
    }
  }
  return doc
}

function addSong(file) {
  return new Promise(function(resolve, reject) {
    songExists(file).then(function(exists) {
      if (exists) {
        resolve()
      } else {
        const name = file.name
        const type = file.type
        const doc = generateDoc(file)
        const blob = readFile(file).then(arrayBuffer => blobUtil.arrayBufferToBlob(arrayBuffer, type))

        Promise.join(doc, blob, name, type, addBlobAsAttachment)
        .then(function(doc) {
          console.debug("Executing db.post", Date(Date.now()))
          return db.post(doc)
        })
        .then(function(doc) {
          console.debug("Executed db.post", Date(Date.now()))
          console.debug("Executing db.get", Date(Date.now()))
          return db.get(doc.id)
        })
        .then(function(song) {
          console.debug("Executed db.get", Date(Date.now()))
          self.postMessage([song])
          return resolve(file.size)
        })
          .catch(err => console.error(err))
      }
    })
  })
}

function generateDoc(file) {
  return readTags(file).then(function(tags) {
    const {artist, album, title, year} = tags
    const {genre, track} = tags.v1

    return {
      "_id": [artist, album, title].join('-||-||-'),
      "artist": artist || "Unknown Artist",
      "title": title || file.size + ' ' + file.name,
      "album": album || "Unknown Album",
      "track": track || 0,
      "genre": genre || "Unknown Genre",
      "year": year || 0
    }
  })
}

function songExists(file) {
  return generateDoc(file)
  .then(doc => db.get(doc._id))
  .then(data => true)
  .catch(function(err) {
    if (err["status"] === 404) {
      return false
    } else {
      throw(err)
    }
  })
}

const importFiles = Promise.coroutine(function* chunkFiles(files) {
  let overallSize = 0;
  for (let file of files) {
    overallSize += yield addSong(file)
  }
  console.debug("Imported size in bytes:", overallSize, "In MB:", overallSize / 1024 / 1024)
})

self.addEventListener('message',function (event){
  const files = event.data;
  importFiles(files)
})
