var React = require('react');
window.react = React;
var MusicPlayer = require('./components/MusicPlayer.react');

React.render(
  <MusicPlayer/>,
  document.getElementById('mount-point')
);