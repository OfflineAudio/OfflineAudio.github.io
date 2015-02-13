const AppDispatcher = require('../dispatcher/AppDispatcher')
const FileUploaderConstants = require('../constants/FileUploaderConstants')
const Library = require('../utils/Library')

// Define actions object
const FileUploadActions = {
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
