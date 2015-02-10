var AppDispatcher = require('../dispatcher/AppDispatcher');
var LibraryConstants = require('../constants/LibraryConstants');
var Library = require('../utils/Library');

var LibraryActions = {
	update: function() {
		Library.read()
		.then(function(data) {
			debugger;
			data = data.rows.map(function(row) {
			  return row.doc
			})
			.reduce(function(library, b) {
			  var artist = library[b.artist] || (library[b.artist] = Object.create(null));
			  var album = artist[b.album] || (artist[b.album] = Object.create(null));
			  var track = album[b.title] || (album[b.title] = Object.create(null));
			  track["id"] = b._id;
			  track["rev"] = b._rev;
			  return library;
			}, Object.create(null))

			AppDispatcher.handleAction({
				actionType: LibraryConstants.LIBRARY_UPDATE_SUCCESS,
				data: data
			});
		})
		.catch(function(err) {
			debugger;
		});

		AppDispatcher.handleAction({
			actionType: LibraryConstants.LIBRARY_UPDATE,
			data: null
		});
	}
};

module.exports = LibraryActions;