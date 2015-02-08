var PouchDB = require('pouchdb');
var Promise = require('bluebird');

var db = new PouchDB('offline-audiov43');

function addSongs(files, cb) {
	let w = new Worker('./js/utils/worker.js');
	w.addEventListener('message', function (ev) {
	    cb(null, ev.data);
	});

	w.postMessage(files); // send the worker a message
}

function read() {
	return db.allDocs({include_docs: true});
}

module.exports = {
	addSongs: addSongs,
	read: read
}