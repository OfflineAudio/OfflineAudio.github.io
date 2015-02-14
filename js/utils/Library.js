const PouchDB = require('pouchdb')
const Promise = require('bluebird')
PouchDB.debug.enable('*')

const db = new PouchDB('offlineAudio-V1')

function addSongs(files, cb) {
  const w = new Worker('./js/utils/worker.js')
  w.addEventListener('message', function (ev) {
    cb(null, ev.data)
  })

  w.postMessage(files) // send the worker a message
}

function read() {
  return db.allDocs({include_docs: true})
}

module.exports = {
  addSongs: addSongs,
  read: read
}