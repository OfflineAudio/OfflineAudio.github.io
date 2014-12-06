[POC-OfflineAudio](http://www.5minfork.com/JakeChampion/POC-OfflineAudio)
=======

Proof of concept application that shows it is possible for an audio file to be read in to a web page, have it's meta-data extracted and stored into a database and have the audio file stored alongside as an attachment to the record. The audio file is stored as a blob outside of the database for performance reasons.

This POC makes use of [PouchDB](https://github.com/pouchdb/pouchdb) and [Javascript-ID3-Reader](https://github.com/aadsm/JavaScript-ID3-Reader)
