importScripts('../../pouchdb.js');
importScripts('../../bluebird.js');
importScripts('../../id3js.js');
importScripts('../../blob-util.js');
var db = new PouchDB('offline-audiov43');

function generateDoc(tags) {
	var artist = tags.artist || "Unknown Artist";
	var album = tags.album || "Unknown Album";
	var title = tags.title || "Unknown Title - " + Date.now() + Math.random() * 100000000000000000;
	var genre = tags.v1.genre || "Unknown Genre";
	var trackNumber = tags.v1.track || 0;
	var year = tags.year || 0;
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

function ID3Tags(file) {
	return new Promise(function(resolve, reject) {
		id3js(file, function(err, tags) {
			if(err){
				reject(err);
			}
			resolve(tags);
		})
	});
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
		console.log('here', err)
	});
}

function stripFilesWhichExist(files) {
	// TODO: switch this out for Bluebird.filter
	var songsCheck = files.map(function(file) {
		songExists(file)
	});

	return Promise.settle(songsCheck).then(function(songsExist) {
		// use .isFulfilled && .value()
		return this.filter(function(file, index) {
			return songsExist[index]._settledValue ? false : true
		})
	}.bind(files))
}



function generateDocs(tags) {
	return Promise.map(tags, function(tag) {
		return generateDoc(tag)
	})
}

function addSongs(files) {
	return new Promise(function(resolve, reject) {
		var files = stripFilesWhichExist(this);
		files.then(function songsToTags(songs) {
			return Promise.map(songs, function(song) {
				return ID3Tags(song)
			})
			.then(function(tags) {
				return Promise.settle(tags)
			})
			.then(function(results) {
				return results.map(function(result) {
					return result.value()
				})
			})
		})
		.then(generateDocs)
		.then(function(docs) {
			return files.value().map(function(file, index) {
				return {
					reader: new FileReader(),
					doc: docs[index]
				}
			})
		})
		.then(function(docsWithReaders) {
			return docsWithReaders.map(function(docWithReader, index) {
				return new Promise(function(resolve, reject) {
					docWithReader.reader.onload = (function(file, doc) {
						return function (e) {
							console.debug("File read into memory. Converting into Blob.");
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
		.then(function(results) {
			return Promise.settle(results)
		})
		.then(function(results) {
			return results.map(function(result) {
				return result.value()
			})
		})
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
		.then(function(results) {
			return Promise.settle(results)
		})
		.then(function(results) {
			return results.map(function(result) {
				return result.value()
			})
		})
		.then(function(results) {
			return results.map(function(result) {
				var $__Object$defineProperty = Object.defineProperty;
				var $__0;

				result.doc["_attachments"] =  ($__0 = {}, $__Object$defineProperty($__0, result.name, {
					value: {
						data: result.blob,
						content_type: 'audio/mpeg'
					},
					enumerable: true,
					configurable: true,
					writable: true
				}), $__0);

				return result.doc
			})
		})
		.then(function(docs) {
			return db.bulkDocs(docs)
		})
		.then(function(docs) {
			var ids = docs.map(function(doc) { return doc.id });
			return db.allDocs({
				include_docs: true,
				keys: ids
			})
			.then(function(docs) {
				return docs.rows
			})
			.then(function(docs) {
				return docs.map(function(doc) {
					return doc.doc
				})
			})
			.then(function(docs) {
				return docs;
			})
			.then(function(docs) {
				return resolve(docs)
			})
		})
	}.bind(files)) //TODO: WTF IS THIS JAKE, SUCH A HACK
}

self.addEventListener('message',function (ev){
    var files = ev.data;
    addSongs(files).then(function(songs){
    	self.postMessage(songs);
    })
});

