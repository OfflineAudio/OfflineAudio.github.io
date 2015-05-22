import AppDispatcher from '../dispatcher/AppDispatcher'
import FileUploaderConstants from '../constants/FileUploaderConstants'
import Library from '../utils/Library'

export const uploadFiles = data =>
  Library.addSongs(data, function (err, data) {
    if (err) {
      AppDispatcher.handleAction({
        actionType: FileUploaderConstants.FILE_ADD_FAIL,
        data: data // err?
      })
    } else {
      AppDispatcher.handleAction({
        actionType: FileUploaderConstants.FILE_ADD_SUCCESS,
        data: data
      })
    }
  })
