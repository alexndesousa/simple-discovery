import React, { useState, useEffect } from "react";
import UserInfo from "./components/UserInfo";
import SearchForm from "./components/SearchForm";
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
  const [userData, setUserData] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);

  const [createdPlaylistId, setCreatedPlaylistId] = useState("");
  const [allRelatedSongs, setAllRelatedSongs] = useState([]);

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
    discoveryService
      .getNumberOfTracksInPlaylist(id, header)
      .then(numberOfTracks => {
        discoveryService
          .getPlaylistsArtists(id, numberOfTracks, header)
          .then(artistIDs => {
            console.log("artistIDs ", artistIDs);
            discoveryService
              .getMultipleSimilarArtists(artistIDs, header)
              .then(relatedArtists => {
                discoveryService
                  .getArtistsTopSongs(
                    relatedArtists,
                    header,
                    setAllRelatedSongs
                  )
                  .then(allSongs => {
                    discoveryService
                      .createPlaylist(header, setCreatedPlaylistId)
                      .then(playlist_id => {
                        discoveryService.populatePlaylist(
                          allSongs,
                          playlist_id,
                          header
                        );
                      });
                  });
              });
          });
      });
  };

  //NEED TO PRESENT THE USER WITH A BUTTON LINKING TO THEIR NEWLY CREATED PLAYLIST

  //move this whole thing into its own component then wrap the axios call in an effect hook
  const createPlaylistWithSimilarArtists = id => {
    discoveryService.getSimilarArtists(id, header).then(relatedArtists => {
      discoveryService
        .getArtistsTopSongs(relatedArtists, header, setAllRelatedSongs)
        .then(allSongs => {
          discoveryService
            .createPlaylist(header, setCreatedPlaylistId)
            .then(playlist_id => {
              discoveryService.populatePlaylist(allSongs, playlist_id, header);
            });
        });
    });
  };

  //EXPERIMENTAL FUNCTIONALITY - meant to create a playlist from similar songs to every song in a given playlist

  // // worth noting that we should also include the current artist into this. this would be handled in the get similar artists
  // const createPlaylistFromPlaylist_Song = id => {

  //   discoveryService.getNumberOfTracksInPlaylist(id, header)
  //   .then(numberOfTracks => {
  //     discoveryService.getPlaylistsTracks(id, numberOfTracks, header).then(allTracks => {
  //       console.log('allTRACKSSS', allTracks)
  //       const limiter1 = new Bottleneck({
  //         maxConcurrent:1,
  //         minTime:5000
  //       })
  //       const limiter2 = new Bottleneck({
  //         maxConcurrent:1,
  //         minTime:1000
  //       })
  //       const promises = allTracks.map(val => {
  //         const id = val.id
  //         const songID = val.songID
  //         limiter1.schedule(() => discoveryService.getSimilarArtists(id, header).then(relatedArtists => {
  //           limiter2.schedule(() => discoveryService
  //             .getArtistsAlbums(relatedArtists, header)
  //             .then(allAlbums => {
  //               discoveryService
  //                 .getAlbumsTracks(allAlbums, header)
  //                 .then(allTracks => {
  //                   discoveryService
  //                     .getAudioFeatures(allTracks, header)
  //                     .then(allAudioFeatures => {
  //                       discoveryService
  //                         .getAudioFeature(songID, header)
  //                         .then(songAudioFeatures => {
  //                           console.log("songaudiofeatures", songAudioFeatures);
  //                           return allAudioFeatures
  //                             .filter(feature => {
  //                               return (
  //                                 feature.tempo > songAudioFeatures.tempo * 0.9 &&
  //                                 feature.tempo < songAudioFeatures.tempo * 1.1 &&
  //                                 (feature.energy > songAudioFeatures.energy * 0.8 &&
  //                                   feature.energy <
  //                                     songAudioFeatures.energy * 1.2) &&
  //                                 (feature.valence >
  //                                   songAudioFeatures.valence * 0.8 &&
  //                                   feature.valence < songAudioFeatures.valence * 1.2)
  //                               );
  //                             })
  //                             .map(features => features.uri);
  //                             //return similarSongs
  //                         })
  //                     })
  //                 })
  //             }))
  //         }))

  //       })
  //       return Promise.all(promises).then(response => {
  //         console.log('THE ONLY RESPONSE IM LOOKING FOR', response)
  //       })
  //     })
  //   })

  // };

  const createPlaylistWithSimilarSongs = (id, songID) => {
    discoveryService.getSimilarArtists(id, header).then(relatedArtists => {
      discoveryService
        .getArtistsAlbums(relatedArtists, header)
        .then(allAlbums => {
          discoveryService
            .getAlbumsTracks(allAlbums, header)
            .then(allTracks => {
              discoveryService
                .getAudioFeatures(allTracks, header)
                .then(allAudioFeatures => {
                  discoveryService
                    .getAudioFeature(songID, header)
                    .then(songAudioFeatures => {
                      //make what im returning a statement. if it resolves as false (aka if the danceability parameter doesnt exist) return null
                      console.log("songaudiofeatures", songAudioFeatures);
                      const similarSongs = allAudioFeatures
                        .filter(feature => {
                          return (
                            feature.tempo > songAudioFeatures.tempo * 0.9 &&
                            feature.tempo < songAudioFeatures.tempo * 1.1 &&
                            (feature.energy > songAudioFeatures.energy * 0.8 &&
                              feature.energy <
                                songAudioFeatures.energy * 1.2) &&
                            (feature.valence >
                              songAudioFeatures.valence * 0.8 &&
                              feature.valence < songAudioFeatures.valence * 1.2)
                          );
                        })
                        .map(features => features.uri);
                      console.log("similar songs", similarSongs);
                      discoveryService
                        .createPlaylist(header, setCreatedPlaylistId)
                        .then(playlist_id => {
                          discoveryService.populatePlaylist(
                            similarSongs,
                            playlist_id,
                            header
                          );
                        });
                    });
                });
            });
        });
    });
  };

  const listOfPlaylists = userPlaylists.map(info => (
    <MusicItem
      key={info.id}
      id={[info.id]}
      image={info.image}
      name={info.name}
      functionToExecute={createPlaylistFromPlaylist_Artist}
    />
  ));

  const listOfArtists = artists.map(info => (
    <MusicItem
      key={info.id}
      id={[info.id]}
      image={info.image}
      name={info.name}
      functionToExecute={createPlaylistWithSimilarArtists}
    />
  ));

  const listOfSongs = songs.map(info => (
    <MusicItem
      key={info.id}
      id={[info.artist_id, info.id]}
      image={info.image}
      name={`${info.name} - ${info.artist}`}
      functionToExecute={createPlaylistWithSimilarSongs}
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
            setUserData={setUserData}
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
