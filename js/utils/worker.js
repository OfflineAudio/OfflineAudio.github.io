"use strict";

var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); };

/* global self */
self.importScripts("../../pouchdb.min.js");
self.importScripts("../../bluebird.min.js");
self.importScripts("../../id3js.min.js");
self.importScripts("../../blob-util.min.js");
self.importScripts("../../runtime.min.js");
self.importScripts("../../array-from.js");
// PouchDB.debug.enable('*')

var db = new self.PouchDB("offlineAudio-V4");
var readTags = Promise.promisify(self.id3js);

function readFile(file) {
  return new Promise(function (resolve, reject) {
    var reader = new self.FileReader();
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
            return self.blobUtil.arrayBufferToBlob(arrayBuffer, type);
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
            self.postMessage(song);
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
  return readTags(file).then(function (tags) {
    var album = tags.album;
    var title = tags.title;
    var year = tags.year;
    var _tags$v1 = tags.v1;
    var genre = _tags$v1.genre;
    var track = _tags$v1.track;
    var artist = tags.artist;

    artist = Array.from(artist || "Unknown Artist").filter(function (c) {
      return c !== "\u0000";
    }).join("");

    return {
      _id: [artist, album, title].join("-||-||-"),
      artist: artist,
      title: title || file.size + " " + file.name,
      album: album || "Unknown Album",
      track: track || 0,
      genre: genre || "Unknown Genre",
      year: year || 0,
      favourite: false,
      duration: 0 // Need to find a way to grab duration from file
    };
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

function read() {
  return db.allDocs({ include_docs: true }).then(function (docs) {
    return self.postMessage(docs);
  });
}

function getTracksByArtist(artist) {
  return db.allDocs().then(function (response) {
    return response.rows.filter(function (doc) {
      return doc.id.split("-||-||-")[0] === artist;
    });
  }).then(function (tracks) {
    return self.postMessage(tracks);
  });
}

function getArtists() {
  return db.allDocs().then(function (response) {
    console.log(response.rows.reduce(function (artists, doc) {
      var artist = doc.id.split("-||-||-")[0];
      artists.add(artist);
      return artists;
    }, new Set()));
  });
}

function getAlbums() {
  return db.allDocs().then(function (response) {
    console.log(response.rows.reduce(function (artists, doc) {
      var artist = doc.id.split("-||-||-")[1];
      artists.add(artist);
      return artists;
    }, new Set()));
  });
}

function getTracks() {
  return db.allDocs().then(function (response) {
    console.log(response.rows.reduce(function (artists, doc) {
      var artist = doc.id.split("-||-||-")[2];
      artists.add(artist);
      return artists;
    }, new Set()));
  });
}

function getAttachment(id, attachment) {
  return db.getAttachment(id, attachment).then(function (attachment) {
    return self.postMessage(attachment);
  });
}

var importFiles = Promise.coroutine(regeneratorRuntime.mark(function chunkFiles(files) {
  var overallSize, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, file;

  return regeneratorRuntime.wrap(function chunkFiles$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        overallSize = 0;
        _iteratorNormalCompletion = true;
        _didIteratorError = false;
        _iteratorError = undefined;
        context$1$0.prev = 4;
        _iterator = files[Symbol.iterator]();

      case 6:
        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
          context$1$0.next = 14;
          break;
        }

        file = _step.value;
        context$1$0.next = 10;
        return addSong(file);

      case 10:
        overallSize += context$1$0.sent;

      case 11:
        _iteratorNormalCompletion = true;
        context$1$0.next = 6;
        break;

      case 14:
        context$1$0.next = 20;
        break;

      case 16:
        context$1$0.prev = 16;
        context$1$0.t0 = context$1$0["catch"](4);
        _didIteratorError = true;
        _iteratorError = context$1$0.t0;

      case 20:
        context$1$0.prev = 20;
        context$1$0.prev = 21;

        if (!_iteratorNormalCompletion && _iterator["return"]) {
          _iterator["return"]();
        }

      case 23:
        context$1$0.prev = 23;

        if (!_didIteratorError) {
          context$1$0.next = 26;
          break;
        }

        throw _iteratorError;

      case 26:
        return context$1$0.finish(23);

      case 27:
        return context$1$0.finish(20);

      case 28:
        console.debug("Imported size in bytes:", overallSize, "In MB:", overallSize / 1024 / 1024);

      case 29:
      case "end":
        return context$1$0.stop();
    }
  }, chunkFiles, this, [[4, 16, 20, 28], [21,, 23, 27]]);
}));

self.addEventListener("message", function (event) {
  var data = event.data;
  switch (data.cmd) {
    case "addSongs":
      importFiles(data.data).then(function () {
        return self.close();
      });
      break;
    case "read":
      read().then(function () {
        return self.close();
      });
      break;
    case "getArtists":
      getArtists().then(function () {
        return self.close();
      });
      break;
    case "getAlbums":
      getAlbums().then(function () {
        return self.close();
      });
      break;
    case "getTracks":
      getTracks().then(function () {
        return self.close();
      });
      break;
    case "getTracksByArtist":
      getTracksByArtist(data.data).then(function () {
        return self.close();
      });
      break;
    case "getAttachment":
      getAttachment(data.data.id, data.data.attachment).then(function () {
        return self.close();
      });
      break;
  }
});
