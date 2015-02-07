var React = require('react');
var { DragDropMixin, NativeDragItemTypes } = require('react-dnd');
var FileUploadActions = require('../actions/FileUploadActions');

var FileUploader = React.createClass({
	mixins: [DragDropMixin],

	configureDragDrop(registerType) {
    	registerType(NativeDragItemTypes.FILE, {
      		dropTarget: {
        		acceptDrop(item) {
              let audioFiles = item.files.filter((file) => file.type.startsWith("audio/"));
              if (audioFiles.length) {
        			  FileUploadActions.uploadFiles(audioFiles);
              }
          			// MusicStore.saveSong(item.files);
          			// console.log(item.files);
        		}
      		}
    	});
  	},

  	render() {
    	var fileDropState = this.getDropState(NativeDragItemTypes.FILE);

    	return (
      		<div {...this.dropTargetFor(NativeDragItemTypes.FILE)}>
        		{fileDropState.isDragging && !fileDropState.isHovering &&
          			<p>Drag file here</p>
        		}
        		{!fileDropState.isHovering && !fileDropState.isDragging &&
          			<p>Default</p>
        		}
        		{fileDropState.isHovering &&
          			<p>Release to upload a file</p>
        		}
      		</div>
    	);
  	}
});

module.exports = FileUploader;