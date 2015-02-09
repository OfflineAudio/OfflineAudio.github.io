importScripts('../../pouchdb.js');
importScripts('../../bluebird.js');
importScripts('../../id3js.js');
importScripts('../../blob-util.js');
importScripts("../../runtime.js");
// PouchDB.debug.enable('*');
var db = new PouchDB('offlineAudio-V1');

function async(makeGenerator){
  return function (){
    var generator = makeGenerator.apply(this, arguments);

    function handle(result){ // { done: [Boolean], value: [Object] }
      if (result.done) return result.value;

      return result.value.then(function (res){
        return handle(generator.next(res));
      }, function (err){
        return handle(generator.throw(err));
      });
    }

    return handle(generator.next());
  };
}

let a = async(function* chunkFiles(files) {
  let chunkedFiles = files.map(file => file)

  for (let file of chunkedFiles) {
    yield addSong(file);
  }
});

function readFile(file) {
	return new Promise(function(resolve, reject) {
		let reader = new FileReader()
		reader.onload = (function(file) {
			return function (e) {
				console.debug("File read into memory", Date(Date.now()))
				resolve(e.target.result)
			}
		})(file)
		reader.readAsArrayBuffer(file)
	})
}

function addBlobAsAttachment(doc, blob, name, type) {
	doc["_attachments"] = {
		[name]: {
			data: blob,
			content_type: type
		}
	}
	return doc
}

function addSong(file) {
	return new Promise(function(resolve, reject) {
		songExists(file).then(function(exists) {
			if (exists) {
				resolve()
			} else {
				let name = file.name
				let type = file.type
				let doc = ID3Tags(file).then(generateDoc)
				let blob = readFile(file).then(arrayBuffer => blobUtil.arrayBufferToBlob(arrayBuffer, type))

				Promise.join(doc, blob, name, type, addBlobAsAttachment)
				.then(function(doc) {
					console.debug("Executing db.post", Date(Date.now()))
					return db.post(doc)
				})
				.then(function(doc) {
					console.debug("Executed db.post", Date(Date.now()))
					console.debug("Executing db.get", Date(Date.now()))
					return db.get(doc.id)
				})
				.then(function(song) {
					console.debug("Executed db.get", Date(Date.now()))
					return resolve(self.postMessage([song]))
				})
		    	.catch(err => console.error(err))
			}
		})
	})
}

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

self.addEventListener('message',function (ev){
    var files = ev.data;
    a(files)
});

