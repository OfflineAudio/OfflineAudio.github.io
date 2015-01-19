var PouchDB = require('pouchdb');
var id3 = require('id3js');
var Promise = require('es6-promise').Promise;

var db = new PouchDB('offline-audiov2');

function songExists(file) {
	return ID3TagsFromFile(file[0]).then(function(tags) {
		var doc = {
			"_id": [tags.artist, tags.album, tags.title].join('-'),
		};

		return db.get(doc._id).then(function(data) {
			return true;
		}).catch(function(err) {
			if (err["status"] === 404) {
				return false;
			}
		});
	});
}

function addSong(file) {
	return songExists(file).then(function(exists) {
		if (exists) {
			throw 'exists';
		} else {
			return ID3TagsFromFile(file[0]).then(function(tags) {
				var doc = {
					"_id": [tags.artist, tags.album, tags.title].join('-'),
					"artist": tags.artist,
					"title": tags.title,
					"album": tags.album
				};

				return db.put(doc);
			}).then(function(doc) {
				return db.get(doc.id);
			}).catch(function(err) {
				debugger;
				console.error(err);
			});
		}
	})
}

function ID3TagsFromFile(file) {
	return new Promise(function(resolve, reject) {
		id3(file, function(err, tags) {
			if(err) reject(err);
			resolve(tags);
		})
	});
}

function read() {
	// debugger;
	return db.allDocs({include_docs: true});
}

module.exports = {
	addSong: addSong,
	read: read
}