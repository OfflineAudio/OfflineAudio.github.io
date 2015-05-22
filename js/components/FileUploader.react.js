import React from 'react'
import { DragDropMixin, NativeDragItemTypes } from 'react-dnd'
import * as FileUploadActions from '../actions/FileUploadActions'

// Using a mixin for functionality so still using createClass
const FileUploader = React.createClass({
  displayName: 'FileUploader',
  mixins: [DragDropMixin],
  statics: {
    configureDragDrop (register) {
      register(NativeDragItemTypes.FILE, {
        dropTarget: {
          acceptDrop (component, item) {
            const audioFiles = item.files.filter((file) => file.type.startsWith('audio/'))
            if (audioFiles.length) {
              FileUploadActions.uploadFiles(audioFiles)
            }
          }
        }
      })
    }
  },

  render () {
    return (
      <div className='upload-field icon--upload'
        {...this.dropTargetFor(NativeDragItemTypes.FILE)}>
      </div>
    )
  }
})

export default FileUploader
