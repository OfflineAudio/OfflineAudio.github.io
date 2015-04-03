/*eslint-env browser, es6 */
const PouchDB = require('pouchdb')
const Promise = require('bluebird')
PouchDB.debug.enable('*')

const db = new PouchDB('offlineAudio-V4')

function addSongs (files, cb) {
  const w = new Worker('/js/utils/worker.js')
  w.addEventListener('message', function (ev) {
    cb(null, ev.data)
  })

  w.postMessage({cmd: 'addSongs', data: files}) // send the worker a message
}

function read () {
  return new Promise(function (resolve, reject) {
      const w = new Worker('/js/utils/worker.js')
      w.addEventListener('message', function (ev) {
        resolve(ev.data)
      })
      w.postMessage({cmd: 'read'})
    })
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
  return new Promise(function (resolve, reject) {
    const w = new Worker('/js/utils/worker.js')
    w.addEventListener('message', function (ev) {
      resolve(ev.data)
    })
    w.postMessage({cmd: 'getAttachment', data: {id: id, attachment: attachment}})
  })
}

function deleteTrack (id, rev) {
  return new Promise(function (resolve, reject) {
    const w = new Worker('/js/utils/worker.js')
    w.addEventListener('message', function (ev) {
      resolve(ev.data)
    })
    w.postMessage({cmd: 'deleteTrack', data: {id: id, rev: rev}})
  })
}

module.exports = {
  addSongs,
  read,
  getAttachment,
  getArtists,
  getTracks,
  getAlbums,
  deleteTrack
}
