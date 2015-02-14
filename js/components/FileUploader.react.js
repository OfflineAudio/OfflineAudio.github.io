const React = require('react')
const { DragDropMixin, NativeDragItemTypes } = require('react-dnd')
const FileUploadActions = require('../actions/FileUploadActions')
require('string.prototype.startswith') // TODO: Figure out why this is needed as we use 6to5 for everything else...

const FileUploader = React.createClass({
	mixins: [DragDropMixin],

	configureDragDrop(registerType) {
  	registerType(NativeDragItemTypes.FILE, {
  		dropTarget: {
    		acceptDrop(item) {
          const audioFiles = item.files.filter((file) => file.type.startsWith("audio/"))
          if (audioFiles.length) {
    			  FileUploadActions.uploadFiles(audioFiles)
          }
    			// MusicStore.saveSong(item.files)
    			// console.log(item.files)
    		}
  		}
  	})
	},

	render() {
  	var fileDropState = this.getDropState(NativeDragItemTypes.FILE)

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
  	)
	}
})

module.exports = FileUploader
