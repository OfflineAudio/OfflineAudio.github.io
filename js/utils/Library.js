var PouchDB = require('pouchdb');
var id3 = require('id3js');
var Promise = require('bluebird');
var blobUtil = require('blob-util');
require('string.prototype.startswith'); // TODO: Figure out why this is needed as we use 6to5 for everything else...

var db = new PouchDB('offline-audiov42');

function generateDoc(tags) {
	let artist = tags.artist || "Unknown Artist";
	let album = tags.album || "Unknown Album";
	let title = tags.title || "Unknown Title - " + Date.now() + Math.random() * 100000000000000000;
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
	return ID3Tags(file).then(function(tags) {
		var doc = generateDoc(tags);

		return db.get(doc._id).then(function(data) {
			return true;
		}).catch(function(err) {
			if (err["status"] === 404) {
				return false;
			}
		});
	}).catch(function(err) {
		debugger;
	});
}

function stripFilesWhichExist(files) {
	// TODO: switch this out for Bluebird.filter
	let songsCheck = files.map((file) => songExists(file));
	return Promise.settle(songsCheck).then(function(songsExist) {
		// debugger; // use .isFulfilled && .value()
		return this.filter((file, index) => songsExist[index]._settledValue ? false : true)
	}.bind(files))
}

function addSongs(files) {
	return new Promise(function(resolve, reject) {
		window.performance.mark('mark_start_add_songs');
		let files = stripFilesWhichExist(this);
		files.then(songs => songs.map((song) => ID3Tags(song)))
		.then(tags => Promise.settle(tags))
		.then(results => results.map((result) => result.value()))
		.then(tags => tags.map((tag) => generateDoc(tag)))
		.then(docs => Promise.settle(docs))
		.then(results => results.map((doc) => doc.value()))
		.then(docs => files.value().map((file, index) => ({reader: new FileReader(), doc: docs[index] })))
		.then(function(docsWithReaders) {
			return docsWithReaders.map(function(docWithReader, index) {
				return new Promise(function(resolve, reject) {
					docWithReader.reader.onload = (function(file, doc) {
						return function (e) {
							console.debug("File read into memory. Converting into Blob.");
							// debugger;
							resolve({
								arrayBuffer: e.target.result,
								name: file.name,
								doc: doc
							});
						}
	        		})(files.value()[index], docWithReader.doc);
					docWithReader.reader.readAsArrayBuffer(files.value()[index])
				})
			})
		})
		.then(results => Promise.settle(results))
		.then(results => results.map((result) => result.value()))
		.then(function(results) {
			return results.map(function(result) {
				return new Promise(function(resolve, reject) {
					blobUtil.arrayBufferToBlob(result.arrayBuffer, 'audio/mpeg')
					.then(function(blob) {
						resolve({
							blob: blob,
							name: result.name,
							doc: result.doc
						})
					})
				})
			})
		})
		.then(results => Promise.settle(results))
		.then(results => results.map((result) => result.value()))
		.then(results => results.map(function(result) {
			result.doc["_attachments"] =  {
				[result.name]: {
					data: result.blob,
					content_type: 'audio/mpeg'
				}
			};

			return result.doc
		}))
		.then((results) => Promise.settle(results))
		.then((results) => results.map((result) => result.value()))
		.then(docs => db.bulkDocs(docs))
		.then(function(docs) {
			debugger;
			return db.allDocs({include_docs: true})
			.then((docs) => docs.rows)
			.then(docs => docs.map(doc => doc.doc))
			.then(function(docs) {
				window.performance.mark('mark_end_add_songs');
				var marks = window.performance.getEntriesByType('mark');
				console.log("Time taken to add songs:", marks[marks.length - 1].startTime - marks[marks.length - 2].startTime);
				return docs;
			})
			.then((docs) => resolve(docs))
			// return db.get(doc.id);
		})
		// .then((docs) => docs.rows)
		// .then((docs) => resolve(docs))
		// .then((doc) => db.get(doc._id))
		// .then((docs) => addAttachment(docs[0], files.value()[0]))
	}.bind(files)) //TODO: WTF IS THIS JAKE, SUCH A HACK
}


function addSongsbak(files) {
	return new Promise(function(resolve, reject) {
		let files = stripFilesWhichExist(this);
		files.then(songs => songs.map((song) => ID3Tags(song)))
		.then(tags => Promise.settle(tags))
		.then(results => results.map((result) => result.value()))
		.then(tags => tags.map((tag) => generateDoc(tag)))
		.then(docs => Promise.settle(docs))
		.then(results => results.map((doc) => doc.value()))
		//TODO: read files her eand add with bulk docs, dont do all at onc ebecause MEMORY LimitS, do in batches
		.then(docs => db.bulkDocs(docs))
		.then(docs => files.value().map((file, index) => ({reader: new FileReader(), doc: docs[index] })))
		.then(function(docsWithReaders) {
			return docsWithReaders.map(function(docWithReader, index) {
				return new Promise(function(resolve, reject) {
					docWithReader.reader.onload = (function(file, doc) {
						return function (e) {
							console.debug("File read into memory. Converting into Blob.");
							// debugger;
							resolve({
								arrayBuffer: e.target.result,
								name: file.name,
								doc: doc
							});
						}
	        		})(files.value()[index], docWithReader.doc);
					docWithReader.reader.readAsArrayBuffer(files.value()[index])
				})
			})
		})
		.then(results => Promise.settle(results))
		.then(results => results.map((result) => result.value()))
		.then(function(results) {
			return results.map(function(result) {
				return new Promise(function(resolve, reject) {
					blobUtil.arrayBufferToBlob(result.arrayBuffer, 'audio/mpeg')
					.then(function(blob) {
						resolve({
							blob: blob,
							name: result.name,
							doc: result.doc
						})
					})
				})
			})
		})
		.then(results => Promise.settle(results))
		.then(results => results.map((result) => result.value()))
		.then(results => results.map((result) => ({blob: result.blob, name: result.name, doc: result.doc})))
		.then(function(results) {
			debugger;
			return new Promise(function(resolve, reject) {

			})
		})
		.then((results) => results.map((result) => db.putAttachment(result.doc.id, result.name, result.doc.rev, result.blob, 'audio/mpeg'))) //TODO: This line cuases issues whne uploading loads of songs at once
		.then((results) => Promise.settle(results))
		.then((results) => results.map((result) => result.value()))
		.then(function(docs) {
			// debugger;
			return db.allDocs({include_docs: true})
			// return db.get(doc.id);
		})
		.then((docs) => docs.rows)
		.then((docs) => resolve(docs))
		// .then((doc) => db.get(doc._id))
		// .then((docs) => addAttachment(docs[0], files.value()[0]))
	}.bind(files)) //TODO: WTF IS THIS JAKE, SUCH A HACK
}

function addAttachment(doc, file) {
	debugger;
	console.debug("Reading audio file into DB")
 	return new Promise(function(resolve, reject) {
 		var r = new FileReader();
 		r.onload = (function(file, doc, resolve, reject) {
        	return function(e) {
        		console.debug("File read into memory. Converting into Blob.");
        		blobUtil.arrayBufferToBlob(e.target.result, 'audio/mpeg').then(function(result){
        			// TODO accept more than mp3s
        			console.debug("File converted into Blob. Adding to DB as attachment to doc.");
        			db.putAttachment(doc._id, doc.title + ".mp3", doc._rev, result, 'audio/mpeg').then(function(resp){
        				// TODO: After file is loaded into DB, what shall we do?
        				// We could read the file back? db.getAttachment(resp.id, doc.title + ".mp3")
        				resolve(db.get(doc._id));
        			})
        		});
        	};
        })(file, doc, resolve, reject);

        r.readAsArrayBuffer(file);
	 	}).catch(function(err) {
			// debugger;
			console.error(err);
		});
}

function addSong(file) {
	return songExists(file).then(function(exists) {
		if (exists) {
			throw 'exists';
		} else {
			return ID3Tags(file).then(function(tags) {
				var doc = generateDoc(tags);
				return db.put(doc);
			}).then(function(doc){
				console.debug("Added song info to DB");
		      	return db.get(doc.id);
		    }).then(function(doc){
		    	console.debug("Reading audio file into DB")
		 	 	return new Promise(function(resolve, reject) {
		 	 		var r = new FileReader();
		 	 		r.onload = (function(file, doc, resolve, reject) {
			        	return function(e) {
			        		console.debug("File read into memory. Converting into Blob.");
			        		blobUtil.arrayBufferToBlob(e.target.result, 'audio/mpeg').then(function(result){
			        			// TODO accept more than mp3s
			        			console.debug("File converted into Blob. Adding to DB as attachment to doc.");
			        			db.putAttachment(doc._id, doc.title + ".mp3", doc._rev, result, 'audio/mpeg').then(function(resp){
			        				// TODO: After file is loaded into DB, what shall we do?
			        				// We could read the file back? db.getAttachment(resp.id, doc.title + ".mp3")
			        				resolve(db.get(doc._id));
			        			})
			        		});
			        	};
			        })(file, doc, resolve, reject);

			        r.readAsArrayBuffer(file);
		 	 	});
		    }).catch(function(err) {
				// debugger;
				console.error(err);
			});
		}
	})
}

function ID3Tags(file) {
	return new Promise(function(resolve, reject) {
		id3(file, function(err, tags) {
			if(err){
				reject(err);
			}
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
	read: read,
	addSongs: addSongs
}