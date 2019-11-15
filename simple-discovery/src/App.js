import React, { useState, useEffect } from "react";
import UserInfo from "./components/UserInfo";
import discoveryService from "./services/discoveryService";
import MusicItem from "./components/MusicItem";
import MusicContainer from "./components/MusicContainer";
import SearchContainer from "./components/SearchContainer";
import { generateRandomString } from "./utils/utils";

import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";

//hash parameters will get the parameters in the url
//need to figureo ut how to get them after a redirect

const App = () => {
  const [newArtistSearch, setNewArtistSearch] = useState("");
  const [newSongSearch, setNewSongSearch] = useState("");

  const [artists, setArtists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);

  const [playlistCreated, setPlaylistCreated] = useState(false);

  const [header, setHeader] = useState(null);
  const [state, setState] = useState("");

  const [isLoginVisible, setLoginVisible] = useState(true);
  const [isMainMenuVisible, setMainMenuVisibility] = useState(true);
  const [isArtistPageVisible, setArtistPageVisibility] = useState(false);
  const [isSongPageVisible, setSongPageVisibility] = useState(false);
  const [isPlaylistPageVisible, setPlaylistPageVisibility] = useState(false);

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

  //redirects the user to spotify so they can authenticate themselves.
  //they are then sent back to the redirect uri (in this case localhost)
  const authenticateUser = () => {
    const client_id = "a4e259d0257745afb6d9bc995d65808d";
    const redirect_uri = "http://localhost:3000/";
    const scope =
      "user-top-read user-read-private user-read-email playlist-modify-public playlist-read-private";

    //whenever I make an api call, ensure that the state is the same as this one
    const state = generateRandomString(16);
    const url =
      "https://accounts.spotify.com/authorize?response_type=token" +
      "&client_id=" +
      encodeURIComponent(client_id) +
      "&scope=" +
      encodeURIComponent(scope) +
      "&redirect_uri=" +
      encodeURIComponent(redirect_uri) +
      "&state=" +
      encodeURIComponent(state);
    setState(state);
    setLoginVisible(false);
    window.location = url;
  };

  //I should merge the next two functions into one, it seems unecessary that I have to press
  //the get data button, it should just work once the user is authenticated

  //grabs the url parameters and puts them into an object (then returns it)
  const decodeURLParameters = () => {
    const queryString = window.location.hash.substring(1);
    let query = {};
    let pairs = queryString.split("&");
    for (let i = 0; i < pairs.length; i++) {
      let pair = pairs[i].split("=");
      query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
    return query;
  };
  //returns an object with all the information that i need from the url
  const getAuthorizationHeader = () => {
    const authInfo = decodeURLParameters();
    const newHeader = {
      Authorization: " " + authInfo.token_type + " " + authInfo.access_token
    };
    setHeader(newHeader);
  };

  //i also wanna check the url here. If it contains the access_token, get rid of the authenticate
  //this can be done with the same method from earlier where it just extracted the token from the url params
  useEffect(() => {
    console.log("hello from the useEffect thingy mabob");
    getAuthorizationHeader();
    //something like below could work, but it isnt exactly the most optimal way of doing it.
    //what happens if a user puts something after the forward slash, theres no way for them
    //to know what went wrong

    // if(window.location !== "http://localhost:3000") {
    //     console.log('window location', window.location)
    //     setLoginVisible(false)
    // }
  }, []);

  const useStyles = makeStyles({
    root: {
      flexgrow: 1
    },
    card: {
      maxWidth: 345
    },
    media: {
      height: 140
    },
    back_button: {
      left: "10%"
    }
  });

  const classes = useStyles();

  const createPlaylistFromPlaylist_Artist = id => {
    discoveryService.createPlaylistFromPlaylist_ArtistBased(id, header, setPlaylistCreated)
  }

  //NEED TO PRESENT THE USER WITH A BUTTON LINKING TO THEIR NEWLY CREATED PLAYLIST

  const createPlaylistWithSimilarArtists = id => {
    discoveryService.createPlaylistWithSimilarArtists(id, header, setPlaylistCreated)
  }

  const createPlaylistWithSimilarSongs = (id, songID) => {
    discoveryService.createPlaylistWithSimilarSongs(id, songID, header, setPlaylistCreated)
  }

  const listOfPlaylists = userPlaylists.map(info => (
    <MusicItem
      key={info.id}
      id={[info.id]}
      image={info.image}
      name={info.name}
      functionToExecute={createPlaylistFromPlaylist_Artist}
      isPlaylistCreated={playlistCreated}
    />
  ));

  const listOfArtists = artists.map(info => (
    <MusicItem
      key={info.id}
      id={[info.id]}
      image={info.image}
      name={info.name}
      functionToExecute={createPlaylistWithSimilarArtists}
      isPlaylistCreated={playlistCreated}
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
      {isPlaylistPageVisible ? (
        <div>
          <IconButton
            className={classes.back_button}
            onClick={() => {
              togglePlaylistPage();
              toggleMainMenu();
            }}
          >
            <ArrowBackIcon fontSize="large" />
          </IconButton>
          <UserInfo
            header={header}
            setUserPlaylists={setUserPlaylists}
          ></UserInfo>
          <MusicContainer musicItems={listOfPlaylists} />
        </div>
      ) : null}
    </>
  );

  return (
    <div>
      {isLoginVisible ? (
        <button onClick={() => authenticateUser()}>authenticate</button>
      ) : null}
      {/* {isLoginVisible ? <button onClick={() => toggleMainMenu()} >authenticate</button> : null} */}

      {MainMenu}
      {PlaylistPage}
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
  );
};

export default App;
