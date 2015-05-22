/*eslint-env browser, es6 */
import PouchDB from 'pouchdb'
import Promise from 'bluebird'
PouchDB.debug.enable('*')

const db = new PouchDB('offlineAudio-V4')

const addSongs = (files, cb) => {
  const w = new Worker('/js/utils/worker.js')
  w.addEventListener('message', ev => cb(null, ev.data))
  w.postMessage({cmd: 'addSongs', data: files})
}

const read = () =>
  new Promise((resolve, reject) => {
    const w = new Worker('/js/utils/worker.js')
    w.addEventListener('message', ev => resolve(ev.data))
    w.postMessage({cmd: 'read'})
  })

const getAttachment = (id, attachment) =>
  new Promise((resolve, reject) => {
    const w = new Worker('/js/utils/worker.js')
    w.addEventListener('message', ev => resolve(ev.data))
    w.postMessage({cmd: 'getAttachment', data: {id: id, attachment: attachment}})
  })

const deleteTrack = (id, rev) =>
  new Promise((resolve, reject) => {
    const w = new Worker('/js/utils/worker.js')
    w.addEventListener('message', ev => resolve(ev.data))
    w.postMessage({cmd: 'deleteTrack', data: {id: id, rev: rev}})
  })

const favourite = (id, rev) =>
  new Promise((resolve, reject) => {
    const w = new Worker('/js/utils/worker.js')
    w.addEventListener('message', ev => resolve(ev.data))
    w.postMessage({cmd: 'toggleFavouriteTrack', data: {id: id, rev: rev}})
  })

const updateTrack = (id, rev, artist, album, title, genre, number, year) =>
  new Promise((resolve, reject) => {
    const w = new Worker('/js/utils/worker.js')
    w.addEventListener('message', ev => resolve(ev.data))
    w.postMessage({cmd: 'updateTrack', data: {id, rev, artist, album, title, genre, number, year}})
  })

const exportDb = () =>
  new Promise((resolve, reject) => {
    const w = new Worker('/js/utils/worker.js')
    w.addEventListener('message', ev => {
      download('test.txt', ev.data)
      resolve(ev.data)
    })
    w.postMessage({cmd: 'exportDb'})
  })

const download = (filename, text) => {
  const pom = self.document.createElement('a')
  pom.href = window.URL.createObjectURL(new Blob([text], {type: 'text/csv'}))
  pom.download = filename
  pom.click()
}

export default {
  addSongs,
  read,
  getAttachment,
  deleteTrack,
  favourite,
  updateTrack,
  exportDb
}
