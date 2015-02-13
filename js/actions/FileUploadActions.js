var AppDispatcher = require('../dispatcher/AppDispatcher')
var FileUploaderConstants = require('../constants/FileUploaderConstants')
var Library = require('../utils/Library')

// Define actions object
var FileUploadActions = {
  // Receive initial product data
  uploadFiles: function(data) {
    Library.addSongs(data, function(err, data) {
      if (err) {
        AppDispatcher.handleAction({
          actionType: FileUploaderConstants.FILE_ADD_FAIL,
          data: data // err?
        })
      } else {
        data.forEach(function(data) {
          console.log(data)
          AppDispatcher.handleAction({
            actionType: FileUploaderConstants.FILE_ADD_SUCCESS,
            data: data
          })
        })
      }
    })
  }
}

module.exports = FileUploadActions
