/* global AudioContext */
import AppDispatcher from '../dispatcher/AppDispatcher'
import PlayerConstants from '../constants/PlayerConstants'
import LibraryConstants from '../constants/LibraryConstants'
import Library from '../utils/Library'
// TODO: Figure out which audio types the browser supports and restrict playback to those.
const audio = new AudioContext()

export const deleteTrack = (id, rev, artist, album, title) => {
  Library.deleteTrack(id, rev)
  .then(result => {
    AppDispatcher.handleAction({
      actionType: LibraryConstants.DELETE_TRACK,
      data: {id, rev, artist, album, title}
    })
  })
  // do something optimistic, also, handle error case
}

export const mute = () =>
  AppDispatcher.handleAction({
    actionType: PlayerConstants.MUTE
  })

export const stop = () =>
  AppDispatcher.handleAction({
    actionType: PlayerConstants.STOP
  })

export const emptyQueue = () =>
  AppDispatcher.handleAction({
    actionType: PlayerConstants.EMPTY_QUEUE
  })

export const addToQueue = (id, attachment) =>
  AppDispatcher.handleAction({
    actionType: PlayerConstants.ADD_TO_QUEUE,
    data: {id, attachment}
  })

export const shuffle = () =>
  AppDispatcher.handleAction({
    actionType: PlayerConstants.SHUFFLE
  })

export const repeat = () =>
  AppDispatcher.handleAction({
    actionType: PlayerConstants.REPEAT
  })

export const previousTrack = track =>
  Library.getAttachment(track.id, track.attachment)
  .then(buffer =>
    new Promise((resolve, reject) =>
      audio.decodeAudioData(buffer, buffer => resolve(buffer))
    )
  )
  .then(blob => {
    const {id, attachment} = track
    AppDispatcher.handleAction({
      actionType: PlayerConstants.PREVIOUS,
      data: {id, attachment, blob}
    })
    return track
  })

export const nextTrack = track =>
  Library.getAttachment(track.id, track.attachment)
  .then(buffer =>
    new Promise((resolve, reject) =>
      audio.decodeAudioData(buffer, buffer => resolve(buffer))
    )
  )
  .then(blob => {
    const {id, attachment} = track
    AppDispatcher.handleAction({
      actionType: PlayerConstants.NEXT,
      data: {id, attachment, blob}
    })
    return track
  })

export const playSong = (id, attachment) =>
  Library.getAttachment(id, attachment)
  .then(buffer =>
    new Promise((resolve, reject) =>
      audio.decodeAudioData(buffer, buffer => resolve(buffer))
    )
  )
  .then(blob =>
    AppDispatcher.handleAction({
      actionType: PlayerConstants.PLAY_SONG,
      data: {id, attachment, blob}
    })
  )

export const play = () =>
  AppDispatcher.handleAction({
    actionType: PlayerConstants.PLAY
  })

export const pause = () =>
  AppDispatcher.handleAction({
    actionType: PlayerConstants.PAUSE
  })

export const updateVolume = value =>
  AppDispatcher.handleAction({
    actionType: PlayerConstants.VOLUME,
    data: value
  })
