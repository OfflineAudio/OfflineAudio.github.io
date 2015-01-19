var AppDispatcher = require('../dispatcher/AppDispatcher');
var FileUploaderConstants = require('../constants/FileUploaderConstants');
var Library = require('../utils/Library');

// Define actions object
var FileUploadActions = {

	// Receive initial product data
	uploadFiles: function(data) {
		Library.addSong(data).then(function(data) {
			// debugger;
			AppDispatcher.handleAction({
				actionType: FileUploaderConstants.FILE_ADD_SUCCESS,
				data: data
			});
		}).catch(function(err) {
			debugger;
			AppDispatcher.handleAction({
				actionType: FileUploaderConstants.FILE_ADD_FAIL,
				data: data
			});
		});
		AppDispatcher.handleAction({
			actionType: FileUploaderConstants.FILE_ADD,
			data: data
		});
	}
};

module.exports = FileUploadActions;