import React, { useState, useEffect } from "react";
import discoveryService from "./services/discoveryService";
import MusicItem from "./components/MusicItem";
import SearchContainer from "./components/SearchContainer";
import AuthModal from "./components/AuthModal"
import { authenticateUser, getAuthorizationHeader } from "./services/authService"
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";

const App = () => {
  const [newPlaylistSearch, setNewPlaylistSearch] = useState("")
  const [newArtistSearch, setNewArtistSearch] = useState("");
  const [newSongSearch, setNewSongSearch] = useState("");

  const [artists, setArtists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);

  const [playlistCreated, setPlaylistCreated] = useState(false);

  const [header, setHeader] = useState(null);

  const [isMainMenuVisible, setMainMenuVisibility] = useState(true);
  const [isArtistPageVisible, setArtistPageVisibility] = useState(false);
  const [isSongPageVisible, setSongPageVisibility] = useState(false);
  const [isPlaylistPageVisible, setPlaylistPageVisibility] = useState(false);
  const [isAuthModalVisible, setAuthOpenVisibility] = useState(true);

  const handlePlaylistSearch = event => {
    setNewPlaylistSearch(event.target.value)
  }

  const handleArtistSearch = event => {
    setNewArtistSearch(event.target.value);
  };

  const handleSongSearch = event => {
    setNewSongSearch(event.target.value);
  };

  const toggleMainMenu = () => {
    setMainMenuVisibility(!isMainMenuVisible);
  };

  const togglePlaylistPage = () => {
    setPlaylistPageVisibility(!isPlaylistPageVisible);
  };

  const toggleArtistPage = () => {
    setArtistPageVisibility(!isArtistPageVisible);
  };

  const toggleSongPage = () => {
    setSongPageVisibility(!isSongPageVisible);
  };

  const handleAuthClose = () => {
    setAuthOpenVisibility(false)
  }

  useEffect(() => {
    getAuthorizationHeader(setHeader);
    if(window.location.href !== "https://alexndesousa.github.io/simple-discovery/") {
        handleAuthClose()
    }
  }, []);

  const createPlaylistFromPlaylist_Artist = id => {
    discoveryService.createPlaylistFromPlaylist_ArtistBased(id, header, setPlaylistCreated)
  }

  const createPlaylistWithSimilarArtists = id => {
    discoveryService.createPlaylistWithSimilarArtists(id, header, setPlaylistCreated)
  }

  const createPlaylistWithSimilarSongs = (id, songID) => {
    discoveryService.createPlaylistWithSimilarSongs(id, songID, header, setPlaylistCreated)
  }

  const listOfPlaylists = userPlaylists.filter(playlist => {
    return playlist.name.toUpperCase().includes(newPlaylistSearch.toUpperCase())
  }).map(info => (
    <MusicItem
      key={info.id}
      id={[info.id]}
      image={info.image}
      name={info.name}
      functionToExecute={createPlaylistFromPlaylist_Artist}
      isPlaylistCreated={playlistCreated}
      setPlaylistCreated={setPlaylistCreated}
    />
  ))

  const listOfArtists = artists.map(info => (
    <MusicItem
      key={info.id}
      id={[info.id]}
      image={info.image}
      name={info.name}
      functionToExecute={createPlaylistWithSimilarArtists}
      isPlaylistCreated={playlistCreated}
      setPlaylistCreated={setPlaylistCreated}
    />
  ));

  const listOfSongs = songs.map(info => (
    <MusicItem
      key={info.id}
      id={[info.artist_id, info.id]}
      image={info.image}
      name={`${info.name} - ${info.artist}`}
      functionToExecute={createPlaylistWithSimilarSongs}
      isPlaylistCreated={playlistCreated}
      setPlaylistCreated={setPlaylistCreated}
    />
  ));

  const MainMenu = (
    <>
      {isMainMenuVisible ? (
        <Grid
          container
          direction="column"
          justify="center"
          alignItems="center"
          spacing={2}
          style={{ minHeight: "80vh", margin: "0", width: "100%" }}
        >
          <h2>Select an option from the list below</h2>
          <Grid item>
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                togglePlaylistPage();
                toggleMainMenu();
              }}
            >
              import playlist
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                toggleArtistPage();
                toggleMainMenu();
              }}
            >
              search artist
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                toggleSongPage();
                toggleMainMenu();
              }}
            >
              search song
            </Button>
          </Grid>
        </Grid>
      ) : null}
    </>
  );

  const PlaylistPage = (
    <>
      <SearchContainer
        isPageVisible={isPlaylistPageVisible}
        togglePage={togglePlaylistPage}
        toggleMainMenu={toggleMainMenu}
        searchLabel="Playlist name"
        newSearch={newPlaylistSearch}
        handleSearch={handlePlaylistSearch}
        header={header}
        setValues={setUserPlaylists}
        type="playlist"
        musicItems={listOfPlaylists}
      />
    </>
  )

  const ArtistPage = (
    <div>
      <SearchContainer
        isPageVisible={isArtistPageVisible}
        togglePage={toggleArtistPage}
        toggleMainMenu={toggleMainMenu}
        searchLabel="Artist name"
        newSearch={newArtistSearch}
        handleSearch={handleArtistSearch}
        header={header}
        setValues={setArtists}
        type="artist"
        musicItems={listOfArtists}
      />
    </div>
  )

  const SongPage = (
    <div>
      <SearchContainer
        isPageVisible={isSongPageVisible}
        togglePage={toggleSongPage}
        toggleMainMenu={toggleMainMenu}
        searchLabel="Song name"
        newSearch={newSongSearch}
        handleSearch={handleSongSearch}
        header={header}
        setValues={setSongs}
        type="song"
        musicItems={listOfSongs}
      />
    </div>
  )

  return (
    <div>
      <AuthModal open={isAuthModalVisible} handleClose={handleAuthClose} authFunction={authenticateUser}/>
      {/* {isLoginVisible ? (
        <button onClick={() => authenticateUser()}>authenticate</button>
      ) : null} */}

      {MainMenu}
      {PlaylistPage}
      {ArtistPage}
      {SongPage}
    </div>
  );
};

export default App;
