import axios from "axios";
import { chunkArray } from "../utils/utils";
import Bottleneck from "bottleneck";
import placeholderImage from "../assets/placeholder.png";

const baseUrl = "https://api.spotify.com/v1";

const getUserProfileInformation = (header, setUserData) => {
  return axios.get(baseUrl + "/me", { headers: header }).then(response => {
    const formattedData = {
      username: response.data.display_name,
      id: response.data.id,
      email: response.data.email,
      country: response.country
    };
    setUserData(formattedData);
  });
};

const getUsersPlaylists = (header, setUserPlaylists) => {
  return axios
    .get(baseUrl + "/me/playlists?limit=50", { headers: header })
    .then(response => {
      console.log("response from playlists", response.data);
      const formattedData = response.data.items.map(info => {
        let formatted = {
          name: info.name,
          id: info.id,
          image: info.images[0].url
        };
        return formatted;
      });
      setUserPlaylists(formattedData);
      console.log("formatted data", formattedData);
    });
};

const searchForArtist = (query, header, setArtists, setArtistSearched) => {
  const type = "artist";
  const endpoint =
    baseUrl +
    "/search?q=" +
    encodeURIComponent(query) +
    "&type=" +
    encodeURIComponent(type);
  return axios
    .get(endpoint, { headers: header })
    .then(response => {
      const formattedArtists = response.data.artists.items.map(info => {
        let pair = {
          name: info.name,
          id: info.id,
          image:
            info.images[0] !== undefined ? info.images[0].url : placeholderImage
        };
        return pair;
      });
      setArtists(formattedArtists);
      setArtistSearched(false);
    })
    .catch(error => {
      console.log(error);
    });
};

const searchForSong = (query, header, setSongs, setSongSearched) => {
  const type = "track";
  const endpoint =
    baseUrl +
    "/search?q=" +
    encodeURIComponent(query) +
    "&type=" +
    encodeURIComponent(type);
  return axios
    .get(endpoint, { headers: header })
    .then(response => {
      console.log("SONG SEARCH RESPONSE", response);
      const formattedSongs = response.data.tracks.items.map(info => {
        let pair = {
          name: info.name,
          id: info.id,
          artist: info.artists[0].name,
          artist_id: info.artists[0].id,
          image: info.album.images[0].url
        };
        return pair;
      });
      setSongs(formattedSongs);
      setSongSearched(false);
    })
    .catch(error => {
      console.log(error);
    });
};

const getSimilarArtists = (id, header) => {
  const endpoint = baseUrl + "/artists/" + id + "/related-artists";
  return axios.get(endpoint, { headers: header }).then(response => {
    return response.data.artists.map(info => info.id);
  });
};

const getMultipleSimilarArtists = (artistIDs, header) => {
  let allArtistIDs = [];
  const promises = artistIDs.map(id =>
    getSimilarArtists(id, header).then(response => {
      allArtistIDs = allArtistIDs.concat(response);
      return response;
    })
  );
  return Promise.all(promises).then(() => {
    const allArtistIDsNoDuplicates = allArtistIDs.filter(
      (item, index, array) => array.indexOf(item) === index
    );
    console.log(
      "response from the promises for multiple similar artists NO DUPLICATES",
      allArtistIDsNoDuplicates
    );
    return allArtistIDsNoDuplicates;
  });
};

const getArtistsTopSongs = (artists, header, setAllRelatedSongs) => {
  let allSongs = [];
  const limiter = new Bottleneck({
    maxConcurrent: 4,
    minTime: 500
  });
  const endpoint = baseUrl + "/artists/";
  const promises = artists.map(artist => {
    return limiter.schedule(() =>
      axios
        .get(endpoint + artist + "/top-tracks?country=GB", { headers: header })
        .then(response => {
          const songURIs = response.data.tracks.map(info => info.uri);
          //console.log('made a request', response, songURIs)
          allSongs = allSongs.concat(songURIs);
        })
    );
  });
  return Promise.all(promises).then(() => {
    //console.log("allSongs", allSongs);
    setAllRelatedSongs(allSongs);
    return allSongs;
  });
};

const createPlaylist = (header, setCreatedPlaylistID) => {
  //MUST NOT FORGET TO CHANGE USER ID
  const endpoint = baseUrl + "/users/" + "alex31734" + "/playlists";
  header["Content-Type"] = "application/json";
  const body = {
    name: "Simple discovery test",
    description: "just a simple test"
  };
  return axios.post(endpoint, body, { headers: header }).then(response => {
    setCreatedPlaylistID(response.data.id);
    return response.data.id;
  });
};

const populatePlaylist = (allSongs, playlistID, header) => {
  console.log("final allSongs", allSongs);
  const promises = chunkArray(allSongs, 100).map(songBundle => {
    console.log("songBundle", songBundle);
    return axios
      .post(
        baseUrl + "/playlists/" + playlistID + "/tracks",
        { uris: songBundle },
        { headers: header }
      )
      .then(response => {
        return response;
      });
  });
  return Promise.all(promises);
};

//worth noting that i can increase the minimum amount of albums it finds for each artist
//default is 20, up to a maximum of 50
const getArtistsAlbums = (artistIDs, header) => {
  console.log("artistIDs", artistIDs);
  let albumIDs = [];
  let allAlbumIDs = [];
  // const limiter = new Bottleneck({
  //   maxConcurrent:5,
  //   minTime:1000
  // })
  const promises = artistIDs.map(artistID => {
    return axios
      .get(baseUrl + "/artists/" + artistID + "/albums", { headers: header })
      .then(response => {
        const artistAlbums = response.data.items.map(item => item.id);
        if (albumIDs.length + artistAlbums.length <= 20) {
          albumIDs = albumIDs.concat(artistAlbums);
        } else {
          allAlbumIDs.push(albumIDs);
          albumIDs = [].concat(artistAlbums);
        }
        return response;
      });
  });
  return Promise.all(promises).then(response => {
    allAlbumIDs.push(albumIDs);
    console.log("response from getting all artists albums", response);
    console.log("getting all artists albums", allAlbumIDs);
    return allAlbumIDs;
  });
};

const getAlbumsTracks = (albumIDs, header) => {
  let allTracks = [];
  const promises = albumIDs.map(albumBundle => {
    return axios
      .get(baseUrl + "/albums/?ids=" + albumBundle.toString(), {
        headers: header
      })
      .then(response => {
        //console.log('response from getting tracks', response)
        const trackIdsForThisBundle = response.data.albums.map(album =>
          album.tracks.items.map(item => item.id)
        );
        //console.log('track ids for this bundle ', trackIdsForThisBundle)
        allTracks = allTracks.concat(trackIdsForThisBundle.flat());
        return response;
      });
  });

  return Promise.all(promises).then(response => {
    console.log("response form getting all trakcs", response);
    console.log("contents of allTracks", allTracks);
    console.log("chunked array ", chunkArray(allTracks, 100));
    return chunkArray(allTracks, 100);
  });
};

const getAudioFeatures = (allTracks, header) => {
  let audioFeatures = [];
  const promises = allTracks.map(tracksBundle => {
    return axios
      .get(baseUrl + "/audio-features/?ids=" + tracksBundle.toString(), {
        headers: header
      })
      .then(response => {
        //console.log('response from audiofeatures ', response)
        //console.log('specific audiofeatures ', response.data.audio_features)
        audioFeatures = audioFeatures.concat(response.data.audio_features);
        return response;
      });
  });

  return Promise.all(promises).then(response => {
    console.log("response from all audio features ", response);
    console.log("final audio features: ", audioFeatures);
    //const sortedFeatures = response.data.audio_features.map(bundle => bundle.audio_features)
    //console.log('sortedFeatures', sortedFeatures)
    return audioFeatures;
  });
};

const getAudioFeature = (trackID, header) => {
  return axios
    .get(baseUrl + "/audio-features/" + encodeURIComponent(trackID), {
      headers: header
    })
    .then(response => {
      console.log("response for getting single audioFeature", response);
      console.log("response for getting single audioFeature", response.data);
      return response.data;
    });
};

const getNumberOfTracksInPlaylist = (playlistID, header) => {
  return axios
    .get(baseUrl + "/playlists/" + playlistID, { headers: header })
    .then(response => {
      console.log("number of tracks", response.data.tracks.total);
      return response.data.tracks.total;
    });
};

const getPlaylistsArtists = (playlistID, amountOfTracks, header) => {
  const maxTracksPerPage = 100;
  let allArtists = [];
  let allPromises = [];

  for (let offset = 0; offset < amountOfTracks; offset += maxTracksPerPage) {
    allPromises.push(
      axios
        .get(
          baseUrl + "/playlists/" + playlistID + "/tracks?offset=" + offset,
          { headers: header }
        )
        .then(response => {
          //maps to the artist id and removes duplicates
          const artistIDs = response.data.items
            .map(item => item.track.artists[0].id)
            .filter((item, index, array) => array.indexOf(item) === index);
          allArtists = allArtists.concat(artistIDs);
          return response;
        })
    );
  }

  return Promise.all(allPromises).then(response => {
    console.log("response from all playlist tracks getting", response);
    console.log("all playlist track getting ", allArtists);
    return allArtists;
  });
};

const getPlaylistsTracks = (playlistID, amountOfTracks, header) => {
  const maxTracksPerPage = 100;
  let allTracks = [];
  let allPromises = [];

  for (let offset = 0; offset < amountOfTracks; offset += maxTracksPerPage) {
    allPromises.push(
      axios
        .get(
          baseUrl + "/playlists/" + playlistID + "/tracks?offset=" + offset,
          { headers: header }
        )
        .then(response => {
          //maps to the artist id and removes duplicates
          console.log("RESPONSE FROM GETPLAYLISTTRACKS", response);
          const trackIDs = response.data.items
            .map(item => {
              let obj = {
                songID: item.track.id,
                id: item.track.artists[0].id
              };
              return obj;
            })
            .filter((item, index, array) => array.indexOf(item) === index);
          allTracks = allTracks.concat(trackIDs);
          return response;
        })
    );
  }

  return Promise.all(allPromises).then(response => {
    console.log("response from all playlist tracks getting", response);
    console.log("all playlist track getting ", allTracks);
    return allTracks;
  });
};

export default {
  getUserProfileInformation: getUserProfileInformation,
  getUsersPlaylists: getUsersPlaylists,
  searchForArtist: searchForArtist,
  searchForSong: searchForSong,
  getSimilarArtists: getSimilarArtists,
  getArtistsTopSongs: getArtistsTopSongs,
  createPlaylist: createPlaylist,
  populatePlaylist: populatePlaylist,
  getArtistsAlbums: getArtistsAlbums,
  getAlbumsTracks: getAlbumsTracks,
  getAudioFeatures: getAudioFeatures,
  getAudioFeature: getAudioFeature,
  getNumberOfTracksInPlaylist: getNumberOfTracksInPlaylist,
  getPlaylistsArtists: getPlaylistsArtists,
  getPlaylistsTracks: getPlaylistsTracks,
  getMultipleSimilarArtists: getMultipleSimilarArtists
};
