const React = require('react')
window.react = React
const Router = require('react-router');
const DefaultRoute = Router.DefaultRoute;
const Link = Router.Link;
const Route = Router.Route;
const MusicPlayer = require('./components/MusicPlayer.react')
const Library = require('./components/Library.react')
const TrackList = require('./components/TrackList.react')
const LibraryStore = require('./stores/LibraryStore')

const StartSplash = React.createClass({
  render() {
    return (
      <div className="yell">
        <div className="yell__container">
          <span className="yell__icon icon--note-beamed"></span>
        </div><!-- .yell__container -->
      </div><!-- .yell -->
    );
  }
});

const AllArtists = React.createClass({
  render() {
    return (
      <div>
        <header>
          This will the all artists view
        </header>
      </div>
    );
  }
});

const Artists = React.createClass({
  mixins: [Router.State],
  render() {
    const tracks = LibraryStore.getTracksByArtist(this.getParams().artist)

    let elem
    if (tracks.length > 0) {
      // show tracks
      elem =  <TrackList tracks={tracks} />
    } else {
      // show error screen
      elem = <div> Error page </div>
    }
    return elem;
  }
})

const routes = (
  <Route name="app" path="/" handler={MusicPlayer}>
    <Route name="artist" path="artist/:artist" handler={Artists}/>
    <Route name="artists" handler={AllArtists}/>
    <DefaultRoute handler={StartSplash}/>
  </Route>
);

Router.run(routes, Router.HistoryLocation, function (Handler) {
  React.render(<Handler/>, document.body);
});
