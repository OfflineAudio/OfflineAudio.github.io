import keyMirror from 'react/lib/keyMirror'

// Define action constants
const FileUploaderConstants = keyMirror({
  FILE_ADD: null,       // Adds file to library
  FILE_ADD_SUCCESS: null, // Added file to library
  FILE_ADD_FAIL: null // Failed to add file to library
})

export default FileUploaderConstants
