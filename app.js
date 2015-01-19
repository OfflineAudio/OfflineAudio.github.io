var db = new PouchDB('offline-audiov1');

// output information
function Output(msg) {
  var m = document.getElementById("messages");
  m.innerHTML = msg + m.innerHTML;
}

// file drag hover
function FileDragHover(e) {
  e.stopPropagation();
  e.preventDefault();
  e.target.className = (e.type == "dragover" ? "hover" : "");
}

// file selection
function FileSelectHandler(e) {

  // cancel event and hover styling
  FileDragHover(e);

  // fetch FileList object
  var files = e.target.files || e.dataTransfer.files;

  // process all File objects
  for (var i = 0, f; f = files[i]; i++) {
    ParseMp3(f);
  }

}

function ParseMp3(file) {
  loadUrl(file.urn || file.name, FileAPIReader(file), file);
}

function loadTags(url, reader) {
  return new Promise(function(resolve, reject) {
    ID3.loadTags(url, function() {
      resolve(ID3.getAllTags(url));
    },
    {tags: ["artist", "title", "album", "year", "comment", "track", "genre", "lyrics", "picture"],
    dataReader: reader});
  });
}

function loadUrl(url, reader, file) {
    loadTags(url, reader).then(function(tags){
      var doc = {
        "_id": new Date().toJSON(),
        "artist": tags.artist,
        "title": tags.title,
        "album": tags.album
      };
      if( "picture" in tags ) {
        var image = tags.picture;
        var base64String = "";
        for (var i = 0; i < image.data.length; i++) {
          base64String += String.fromCharCode(image.data[i]);
        }

        Output("<img src='data:" + image.format + ";base64," + window.btoa(base64String) + "' >");
      }
      return db.put(doc);
    }).then(function(doc){
      return db.get(doc.id);
    }).then(function(doc){
      console.log(doc);
      var r = new FileReader();

      r.onload = (function(theFile, doc) {
        return function(e) {
          blobUtil.arrayBufferToBlob(e.target.result, 'audio/mpeg').then(function(result){
            console.log('hu', typeof result)
            console.log(result)
            db.putAttachment(doc._id, doc.title + ".mp3", doc._rev, result, 'audio/mpeg').then(function(resp){
              return db.getAttachment(resp.id, doc.title + ".mp3");
            }).then(function (blob) {
              var reader = new FileReader();
              reader.onload = function(e) {

                Output(['<audio controls="controls" src="', e.target.result, '"/>'].join(''));
              };
              reader.readAsDataURL(blob);
            });
          });
        };
      })(file, doc);

      r.readAsArrayBuffer(file);
    });
}

function Init() {
  var filedrag = document.getElementById("filedrag");
  filedrag.addEventListener("dragover", FileDragHover, false);
  filedrag.addEventListener("dragleave", FileDragHover, false);
  filedrag.addEventListener("drop", FileSelectHandler, false);
  filedrag.style.display = "block";
}

Init();