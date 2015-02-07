var AppDispatcher = require('../dispatcher/AppDispatcher');
var FileUploaderConstants = require('../constants/FileUploaderConstants');
var Library = require('../utils/Library');
var Bluebird = require('bluebird');

// Define actions object
var FileUploadActions = {

	// Receive initial product data
	uploadFiles: function(data) {
		// debugger;
		Library.addSongs(data)
		.then(function(data) {
			debugger;
			console.log(data);
			AppDispatcher.handleAction({
				actionType: FileUploaderConstants.FILE_ADD_SUCCESS,
				data: data
			});
		}).catch(function(err) {
			// debugger;
			AppDispatcher.handleAction({
				actionType: FileUploaderConstants.FILE_ADD_FAIL,
				data: data
			});
		});
		// let songs = Library.addSongs(data);
		// Bluebird.settle(songs)
		// .then(function(data) {
		// 	debugger;
		// 	console.log(data);
		// 	AppDispatcher.handleAction({
		// 		actionType: FileUploaderConstants.FILE_ADD_SUCCESS,
		// 		data: data
		// 	});
		// }).catch(function(err) {
		// 	debugger;
		// 	AppDispatcher.handleAction({
		// 		actionType: FileUploaderConstants.FILE_ADD_FAIL,
		// 		data: data
		// 	});
		// });
		//TODO: show progress indicator when adding songs?
		// AppDispatcher.handleAction({
		// 	actionType: FileUploaderConstants.FILE_ADD,
		// 	data: data
		// });
	}
};

module.exports = FileUploadActions;