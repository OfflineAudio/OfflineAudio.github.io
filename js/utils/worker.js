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
	var overallSize, _iterator, _step, file;
	return regeneratorRuntime.wrap(function chunkFiles$(context$1$0) {
		while (1) switch (context$1$0.prev = context$1$0.next) {
			case 0:
				overallSize = 0;
				_iterator = files[Symbol.iterator]();
			case 2:
				if ((_step = _iterator.next()).done) {
					context$1$0.next = 9;
					break;
				}
				file = _step.value;
				context$1$0.next = 6;
				return addSong(file);
			case 6:
				overallSize += context$1$0.sent;
			case 7:
				context$1$0.next = 2;
				break;
			case 9:
				console.debug("Imported size in bytes:", overallSize, "In MB:", overallSize / 1024 / 1024);
			case 10:
			case "end":
				return context$1$0.stop();
		}
	}, chunkFiles, this);
}));

function readFile(file) {
	return new Promise(function (resolve, reject) {
		var reader = new FileReader();
		reader.onload = (function (file) {
			return function (e) {
				console.debug("File read into memory", Date(Date.now()));
				resolve(e.target.result);
			};
		})(file);
		reader.readAsArrayBuffer(file);
	});
}

function addBlobAsAttachment(doc, blob, name, type) {
	doc._attachments = _defineProperty({}, name, {
		data: blob,
		content_type: type
	});
	return doc;
}

function addSong(file) {
	return new Promise(function (resolve, reject) {
		songExists(file).then(function (exists) {
			if (exists) {
				resolve();
			} else {
				(function () {
					var name = file.name;
					var type = file.type;
					var doc = generateDoc(file);
					var blob = readFile(file).then(function (arrayBuffer) {
						return blobUtil.arrayBufferToBlob(arrayBuffer, type);
					});

					Promise.join(doc, blob, name, type, addBlobAsAttachment).then(function (doc) {
						console.debug("Executing db.post", Date(Date.now()));
						return db.post(doc);
					}).then(function (doc) {
						console.debug("Executed db.post", Date(Date.now()));
						console.debug("Executing db.get", Date(Date.now()));
						return db.get(doc.id);
					}).then(function (song) {
						console.debug("Executed db.get", Date(Date.now()));
						self.postMessage([song]);
						return resolve(file.size);
					})["catch"](function (err) {
						return console.error(err);
					});
				})();
			}
		});
	});
}

function generateDoc(file) {
	return ID3Tags(file).then(function (tags) {
		var artist = tags.artist || "Unknown Artist";
		var album = tags.album || "Unknown Album";
		var title = tags.title || file.size + " " + file.name;
		var genre = tags.v1.genre || "Unknown Genre";
		var trackNumber = tags.v1.track || 0;
		var year = tags.year || 0;

		return {
			_id: [artist, album, title].join("-||-||-"),
			artist: artist,
			title: title,
			album: album,
			track: trackNumber,
			genre: genre,
			year: year
		};
	});
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
	return generateDoc(file).then(function (doc) {
		return db.get(doc._id);
	}).then(function (data) {
		return true;
	})["catch"](function (err) {
		if (err.status === 404) {
			return false;
		} else {
			throw err;
		}
	});
}

self.addEventListener("message", function (ev) {
	var files = ev.data;
	a(files);
});
