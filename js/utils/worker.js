"use strict";

var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); };

/* global self */
self.importScripts("../../dist/worker-addons.min.js");
// PouchDB.debug.enable('*')
self.PouchDB.plugin(self.pouchdbReplicationStream.plugin);
self.PouchDB.adapter("writableStream", self.pouchdbReplicationStream.adapters.writableStream);

var db = new self.PouchDB("offlineAudio-V5");
var readTags = Promise.promisify(self.id3js);

var readFile = function (file) {
  return new Promise(function (resolve, reject) {
    var reader = new self.FileReader();
    reader.onload = (function (file) {
      return function (e) {
        return resolve(e.target.result);
      };
    })(file);
    reader.readAsArrayBuffer(file);
  });
};

var addBlobAsAttachment = function (doc, blob, name, type) {
  doc._attachments = _defineProperty({}, name, {
    data: blob,
    content_type: type
  });
  return doc;
};

var addSong = function (file) {
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
            return db.post(doc);
          }).then(function (doc) {
            return db.get(doc.id);
          }).then(function (song) {
            self.postMessage(song);
            return resolve(file.size);
          })["catch"](function (err) {
            return console.error(err);
          });
        })();
      }
    });
  });
};

var generateDoc = function (file) {
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
    }).join(""); // TODO: investigate into why artist names break

    return {
      _id: [artist, album, title].join("-||-||-"),
      artist: artist,
      title: title || file.size + " " + file.name,
      album: album || "Unknown Album",
      track: track || 0,
      genre: genre || "Unknown Genre",
      year: year || 0,
      favourite: false,
      duration: 0 // TODO: Need to find a way to grab duration from file. Only way so far is to buffer song completely.
    };
  });
};

var songExists = function (file) {
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
};

var read = function () {
  return db.allDocs({ include_docs: true }).then(function (docs) {
    return self.postMessage(docs);
  });
};

var getTracksByArtist = function (artist) {
  return db.allDocs().then(function (response) {
    return response.rows.filter(function (doc) {
      return doc.id.split("-||-||-")[0] === artist;
    });
  }).then(function (tracks) {
    return self.postMessage(tracks);
  });
};

var getArtists = function () {
  return db.allDocs().then(function (response) {
    response.rows.reduce(function (artists, doc) {
      var artist = doc.id.split("-||-||-")[0];
      artists.add(artist);
      return artists;
    }, new Set());
  });
};

var getAlbums = function () {
  return db.allDocs().then(function (response) {
    response.rows.reduce(function (artists, doc) {
      var artist = doc.id.split("-||-||-")[1];
      artists.add(artist);
      return artists;
    }, new Set());
  });
};

var getTracks = function () {
  return db.allDocs().then(function (respons) {
    response.rows.reduce(function (artists, doc) {
      var artist = doc.id.split("-||-||-")[2];
      artists.add(artist);
      return artists;
    }, new Set());
  });
};

var getAttachment = function (id, attachment) {
  return db.getAttachment(id, attachment).then(function (attachment) {
    return self.blobUtil.blobToArrayBuffer(attachment);
  }).then(function (attachment) {
    return self.postMessage(attachment);
  });
};

var deleteTrack = function (id, rev) {
  return db.remove(id, rev).then(function (result) {
    return self.postMessage(result);
  })["catch"](function (err) {
    return console.log(err);
  });
};

var toggleFavouriteTrack = function (id, rev) {
  return db.get(id, { rev: rev }).then(function (doc) {
    doc.favourite = !doc.favourite;
    return db.put(doc);
  }).then(function (result) {
    return self.postMessage(result);
  })["catch"](function (err) {
    return console.log(err);
  });
};

var updateTrack = function (id, rev, artist, album, title, genre, number, year) {
  var oldTrack = Promise.resolve(db.get(id, { rev: rev }));
  var newTrack = oldTrack.then(function (doc) {
    doc.id = createId(artist, album, title);
    doc.artist = artist;
    doc.album = album;
    doc.title = title;
    doc.genre = genre;
    doc.number = number;
    doc.year = year;
    return db.put(doc);
  });

  return newTrack.then(function (result) {
    if (result.ok) {
      if (oldTrack.value().id !== createId(artist, album, title)) {
        return db.remove(oldTrack.value());
      }
    }
    return result;
  }).then(function (result) {
    return newTrack.value();
  }).then(function (result) {
    return self.postMessage(result);
  })["catch"](function (err) {
    return console.log(err);
  });
};

var createId = function (artist, album, title) {
  return [artist, album, title].join("-||-||-");
};

var exportDb = function () {
  new Promise(function (resolve, reject) {
    var ws = new self.concatStream(function (data) {
      return resolve(data);
    });
    db.dump(ws).then(function (res) {
      return console.log(res);
    });
  }).then(function (result) {
    return self.postMessage(result);
  })["catch"](function (err) {
    return console.log(err);
  });
};

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

var close_thread = function () {
  return self.close();
};

self.addEventListener("message", function (event) {
  var data = event.data;
  switch (data.cmd) {
    case "addSongs":
      importFiles(data.data).then(close_thread);
      break;
    case "read":
      read().then(close_thread);
      break;
    case "getArtists":
      getArtists().then(close_thread);
      break;
    case "getAlbums":
      getAlbums().then(close_thread);
      break;
    case "getTracks":
      getTracks().then(close_thread);
      break;
    case "getTracksByArtist":
      getTracksByArtist(data.data).then(close_thread);
      break;
    case "getAttachment":
      getAttachment(data.data.id, data.data.attachment).then(close_thread);
      break;
    case "deleteTrack":
      deleteTrack(data.data.id, data.data.rev).then(close_thread);
      break;
    case "toggleFavouriteTrack":
      toggleFavouriteTrack(data.data.id, data.data.rev).then(close_thread);
      break;
    case "updateTrack":
      updateTrack(data.data.id, data.data.rev, data.data.artist, data.data.album, data.data.title, data.data.genre, data.data.number, data.data.year).then(close_thread);
      break;
    case "exportDb":
      exportDb().then(close_thread);
  }
});
