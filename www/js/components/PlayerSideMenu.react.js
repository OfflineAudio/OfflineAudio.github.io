const React = require('react');
const FileUploader = require('./FileUploader.react')
const ArtistList = require('./ArtistList.react')

const PlayerSideMenu = React.createClass({
  render() {
    const {artists} = this.props

    return (
      <section className="side-menu">
			  <FileUploader/>
			  <input type="search" className="search-field" placeholder="Search" />
			  <ArtistList artists={artists}/>
			</section>
    );
  }
});

module.exports = PlayerSideMenu;