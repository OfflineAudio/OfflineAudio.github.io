window['__onGCastApiAvailable'] = function(loaded, errorInfo) {
  if (loaded) {
    initializeCastApi();
  } else {
    console.log(errorInfo);
  }
}

initializeCastApi = function() {
  var sessionRequest = new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
  var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
    function(){console.log('session listener cb')},
    function(e){if( e === chrome.cast.ReceiverAvailability.AVAILABLE) {
      console.log('cast devices available');
      chrome.cast.requestSession(onRequestSessionSuccess, onLaunchError);
  }});
  chrome.cast.initialize(apiConfig, onInitSuccess, onError);
};

function onInitSuccess(e) { console.log('init successs cb');}
function onError(e) { console.log('on error cb');}
function onRequestSessionSuccess(e) {
    isBroadcaster = true;
    //TODO: instantiate playey object
    session = e;
 }

function onLaunchError (e) {
    isBroadcaster = false;
    broadcasterChkBox.checked = false;
    console.log(e);
}

function onMediaDiscovered(how, media) {
//    currentMedia = media;
//    play();
}

function onMediaError(e){console.log(e)}



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
    ProcessFile(files[0])
//  for (var i = 0, f; f = files[i]; i++) {
//    ParseMp3(f);
//  }

}

function ProcessFile(file){
    return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        
        // Closure to capture the file information.
        reader.onload = (function(theFile) {
            return function(e) {
                var mediaInfo = new chrome.cast.media.MediaInfo(e.target.result, 'video/webm');
                var request = new chrome.cast.media.LoadRequest(mediaInfo);
                session.loadMedia(request, onMediaDiscovered.bind(this, 'loadMedia'), onMediaError);
                // Render thumbnail.
//                var span = document.createElement('span');
//                span.innerHTML = ['<img class="thumb" src="', e.target.result,
//                            '" title="', escape(theFile.name), '"/>'].join('');
//                document.getElementById('list').insertBefore(span, null);
            };
        })(file);
        
        reader.readAsDataURL(file);
    })
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