var PouchDB = require('pouchdb');
var id3 = require('id3js');
var Promise = require('es6-promise').Promise;
var blobUtil = require('blob-util');
require('string.prototype.startswith'); // TODO: Figure out why this is needed as we use 6to5 for everything else...

var db = new PouchDB('offline-audiov3');

function generateDoc(tags) {
	let artist = tags.artist || "Unknown Artist";
	let album = tags.album || "Unknown Album";
	let title = tags.title || "Unknown Title - " + Date.now();
	let genre = tags.v1.genre || "Unknown Genre";
	let trackNumber = tags.v1.track || 0;
	let year = tags.year || 0;
	return {
		"_id": [artist, album, title].join(' - '),
		"artist": artist,
		"title": title,
		"album": album,
		"track": trackNumber,
		"genre": genre,
		"year": year
	};
}

function songExists(file) {
	return ID3TagsFromFile(file).then(function(tags) {
		var doc = generateDoc(tags);

		return db.get(doc._id).then(function(data) {
			return true;
		}).catch(function(err) {
			if (err["status"] === 404) {
				return false;
			}
		});
	});
}

function addSong(files) {
	// Filter files so that only audio files are left
	let audioFiles = files.filter((file) => file.type.startsWith("audio/"));
	if (!audioFiles.length) { return new Promise((resolve,reject) => reject()); }
	// TODO: Make this work with multiple files being dropped at the same time
	return songExists(audioFiles[0]).then(function(exists) {
		if (exists) {
			throw 'exists';
		} else {
			debugger;
			return ID3TagsFromFile(audioFiles[0]).then(function(tags) {
				var doc = generateDoc(tags);

				return db.put(doc);
			}).then(function(doc){
		      	return db.get(doc.id);
		    }).then(function(doc){
		 	 	console.log(doc);
		 	 	return new Promise(function(resolve, reject) {
		 	 		var r = new FileReader();
		 	 		r.onload = (function(file, doc) {
			        	return function(e) {
			        		blobUtil.arrayBufferToBlob(e.target.result, 'audio/mpeg').then(function(result){
			        			// TODO accept more than mp3s
			        			db.putAttachment(doc._id, doc.title + ".mp3", doc._rev, result, 'audio/mpeg').then(function(resp){
			        				return db.getAttachment(resp.id, doc.title + ".mp3");
			        			})
			        		});
			        	};
			        })(audioFiles[0], doc);

			        r.readAsArrayBuffer(audioFiles[0]);
		 	 	});
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
	return db.allDocs({include_docs: true});
}

function findArtist(artist) {
	// return db.
}

function returnSong(id) {

}
module.exports = {
	addSong: addSong,
	read: read
}