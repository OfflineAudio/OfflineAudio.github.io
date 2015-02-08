"use strict";

importScripts("../../pouchdb.js");
importScripts("../../bluebird.js");
importScripts("../../id3js.js");
importScripts("../../blob-util.js");
importScripts("../../runtime.js");
// PouchDB.debug.enable('*');
var db = new PouchDB("offlineAudio-V1");

function async(makeGenerator) {
	return function () {
		var generator = makeGenerator.apply(this, arguments);

		function handle(result) {
			// { done: [Boolean], value: [Object] }
			if (result.done) return result.value;

			return result.value.then(function (res) {
				return handle(generator.next(res));
			}, function (err) {
				return handle(generator["throw"](err));
			});
		}

		return handle(generator.next());
	};
}

var a = async(regeneratorRuntime.mark(function chunkFiles(files) {
	var chunkedFiles, _iterator, _step, file;
	return regeneratorRuntime.wrap(function chunkFiles$(context$1$0) {
		while (1) switch (context$1$0.prev = context$1$0.next) {
			case 0:
				chunkedFiles = files.map(function (file) {
					return [file];
				});
				_iterator = chunkedFiles[Symbol.iterator]();
			case 2:
				if ((_step = _iterator.next()).done) {
					context$1$0.next = 8;
					break;
				}
				file = _step.value;
				context$1$0.next = 6;
				return addSongs(file);
			case 6:
				context$1$0.next = 2;
				break;
			case 8:
			case "end":
				return context$1$0.stop();
		}
	}, chunkFiles, this);
}));

function generateDoc(tags) {
	var artist = tags.artist || "Unknown Artist";
	var album = tags.album || "Unknown Album";
	var title = tags.title || "Unknown Title - " + Date.now() + Math.random() * 100000000000000000;
	var genre = tags.v1.genre || "Unknown Genre";
	var trackNumber = tags.v1.track || 0;
	var year = tags.year || 0;
	return {
		_id: [artist, album, title].join(" - "),
		artist: artist,
		title: title,
		album: album,
		track: trackNumber,
		genre: genre,
		year: year
	};
}

function ID3Tags(file) {
	return new Promise(function (resolve, reject) {
		id3js(file, function (err, tags) {
			if (err) {
				reject(err);
			}
			resolve(tags);
		});
	});
}

function songExists(file) {
	return ID3Tags(file).then(function (tags) {
		var doc = generateDoc(tags);

		return db.get(doc._id).then(function (data) {
			return true;
		})["catch"](function (err) {
			if (err.status === 404) {
				return false;
			}
		});
	})["catch"](function (err) {
		console.log("here", err);
	});
}

function stripFilesWhichExist(files) {
	// TODO: switch this out for Bluebird.filter
	var songsCheck = files.map(function (file) {
		songExists(file);
	});

	return Promise.settle(songsCheck).then((function (songsExist) {
		// use .isFulfilled && .value()
		return this.filter(function (file, index) {
			return songsExist[index]._settledValue ? false : true;
		});
	}).bind(files));
}

function generateDocs(tags) {
	return Promise.map(tags, function (tag) {
		return generateDoc(tag);
	});
}

function addSongs(files) {
	return new Promise((function (resolve, reject) {
		var files = stripFilesWhichExist(this);
		files.then(function songsToTags(songs) {
			return Promise.map(songs, function (song) {
				return ID3Tags(song);
			});
		}).then(generateDocs).then(function (docs) {
			return files.value().map(function (file, index) {
				return {
					reader: new FileReader(),
					doc: docs[index]
				};
			});
		}).then(function (docsWithReaders) {
			return Promise.map(docsWithReaders, function (docWithReader, index) {
				return new Promise(function (resolve, reject) {
					docWithReader.reader.onload = (function (file, doc) {
						return function (e) {
							console.debug("File read into memory. Converting into Blob.", Date(Date.now()));
							resolve({
								arrayBuffer: e.target.result,
								name: file.name,
								doc: doc
							});
						};
					})(files.value()[index], docWithReader.doc);
					docWithReader.reader.readAsArrayBuffer(files.value()[index]);
				});
			});
		}).then(function (results) {
			return Promise.map(results, function (result) {
				return new Promise(function (resolve, reject) {
					blobUtil.arrayBufferToBlob(result.arrayBuffer, "audio/mpeg").then(function (blob) {
						resolve({
							blob: blob,
							name: result.name,
							doc: result.doc
						});
					});
				});
			});
		}).then(function (results) {
			return results.map(function (result) {
				var $__Object$defineProperty = Object.defineProperty;
				var $__0;

				result.doc._attachments = ($__0 = {}, $__Object$defineProperty($__0, result.name, {
					value: {
						data: result.blob,
						content_type: "audio/mpeg"
					},
					enumerable: true,
					configurable: true,
					writable: true
				}), $__0);

				return result.doc;
			});
		}).then(function (docs) {
			console.debug("Executing bulkDocs", Date(Date.now()));
			return db.bulkDocs(docs);
		}).then(function (docs) {
			console.debug("Finished Executing bulkDocs", Date(Date.now()));
			var ids = docs.map(function (doc) {
				return doc.id;
			});
			return db.allDocs({
				include_docs: true,
				keys: ids
			}).then(function (docs) {
				return docs.rows;
			}).then(function (docs) {
				return docs.map(function (doc) {
					return doc.doc;
				});
			}).then(function (docs) {
				return docs;
			}).then(function (docs) {
				return docs;
			});
		}).then(function (songs) {
			self.postMessage(songs);
			resolve();
		})["catch"](function (err) {
			debugger;
			console.error(err);
		});
	}).bind(files)) //TODO: WTF IS THIS JAKE, SUCH A HACK
	;
}

self.addEventListener("message", function (ev) {
	var files = ev.data;
	a(files);
});
// .reduce(function(arr, file) {
//   if (!arr.length) {
//     arr.push([]);
//   }
//   if (arr[arr.length - 1].length === 10) {
//     arr.push([]);
//   }
//   arr[arr.length - 1].push(file);
//   return arr;
// }, []);
