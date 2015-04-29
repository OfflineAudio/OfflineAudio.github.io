const React = require('react')
const { DragDropMixin, NativeDragItemTypes } = require('react-dnd')
const FileUploadActions = require('../actions/FileUploadActions')

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
            // MusicStore.saveSong(item.files)
            // console.log(item.files)
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

module.exports = FileUploader
