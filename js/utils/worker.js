"use strict";

var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); };

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
					return file;
				});
				_iterator = chunkedFiles[Symbol.iterator]();
			case 2:
				if ((_step = _iterator.next()).done) {
					context$1$0.next = 8;
					break;
				}
				file = _step.value;
				context$1$0.next = 6;
				return addSong(file);
			case 6:
				context$1$0.next = 2;
				break;
			case 8:
			case "end":
				return context$1$0.stop();
		}
	}, chunkFiles, this);
}));

function addSong(file) {
	return new Promise((function (resolve, reject) {
		var file = this;
		songExists(file).then(function (exists) {
			if (exists) {
				resolve();
			} else {
				ID3Tags(file).then(generateDoc).then(function (doc) {
					return new Promise(function (resolve, reject) {
						var reader = new FileReader();
						reader.onload = (function (file, doc) {
							return function (e) {
								console.debug("File read into memory. Converting into Blob.", Date(Date.now()));
								resolve({
									arrayBuffer: e.target.result,
									name: file.name,
									doc: doc
								});
							};
						})(file, doc);
						reader.readAsArrayBuffer(file);
					});
				}).then(function (result) {
					return blobUtil.arrayBufferToBlob(result.arrayBuffer, "audio/mpeg").then(function (blob) {
						return {
							blob: blob,
							name: result.name,
							doc: result.doc
						};
					});
				}).then(function (result) {
					result.doc._attachments = _defineProperty({}, result.name, {
						data: result.blob,
						content_type: "audio/mpeg"
					});
					return result.doc;
				}).then(function (doc) {
					console.debug("Executing db.post", Date(Date.now()));
					return db.post(doc);
				}).then(function (doc) {
					console.debug("Executed db.post", Date(Date.now()));
					return db.get(doc.id);
				}).then(function (song) {
					self.postMessage([song]);
					resolve();
				})["catch"](function (err) {
					console.error(err);
				});
			}
		});
	}).bind(file)) //TODO: WTF IS THIS JAKE, SUCH A HACK
	;
}


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

self.addEventListener("message", function (ev) {
	var files = ev.data;
	a(files);
});
