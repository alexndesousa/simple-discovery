import axios from "axios";
import { chunkArray } from "../utils/utils";
import placeholderImage from "../assets/placeholder.png";

const baseUrl = "https://api.spotify.com/v1";

const sleepRequest = (milliseconds, originalRequest) => {
  console.log("originalRequest", originalRequest);
  return new Promise((resolve, reject) => {
    setTimeout(
      () =>
        resolve(
          axios({
            method: originalRequest.method,
            url: originalRequest.url,
            data: originalRequest.data,
            headers: originalRequest.headers
          })
        ),
      milliseconds
    );
  });
};

axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    console.log("error.response", error.response);
    const {
      config,
      response: { status }
    } = error;
    const originalRequest = config;
    if (status === 429 || status === 500) {
      return sleepRequest(
        error.response.headers["retry-after"] * 1000,
        originalRequest
      );
    } else if (status === 401) {
      ///handle reauthentication
      return Promise.reject(error);
    } else {
      return Promise.reject(error)
    }
  }
);

const getUserProfileInformation = (header) => {
  return axios.get(baseUrl + "/me", { headers: header }).then(response => {
    // const formattedData = {
    //   username: response.data.display_name,
    //   id: response.data.id,
    //   email: response.data.email,
    //   country: response.country
    // };
    return response.data.id;
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
    return allArtistIDsNoDuplicates;
  });
};

const getArtistsTopSongs = (artists, header) => {
  let allSongs = [];
  const endpoint = baseUrl + "/artists/";
  const promises = artists.map(artist => {
    return axios
      .get(endpoint + artist + "/top-tracks?country=GB", { headers: header })
      .then(response => {
        const songURIs = response.data.tracks.map(info => info.uri);
        allSongs = allSongs.concat(songURIs);
      });
  });
  return Promise.all(promises).then(() => {
    return allSongs;
  });
};

const createPlaylist = (header, userID) => {
  //MUST NOT FORGET TO CHANGE USER ID
  const endpoint = baseUrl + "/users/" + userID + "/playlists";
  header["Content-Type"] = "application/json";
  const body = {
    name: "Simple discovery",
    description: "Created by simple-discovery"
  };
  return axios.post(endpoint, body, { headers: header }).then(response => {
    return response.data.id;
  });
};

const populatePlaylist = (allSongs, playlistID, header) => {
  console.log("final allSongs", allSongs);
  const promises = chunkArray(allSongs, 100).map(songBundle => {
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
  let albumIDs = [];
  let allAlbumIDs = [];
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
        const trackIdsForThisBundle = response.data.albums.map(album =>
          album.tracks.items.map(item => item.id)
        );
        allTracks = allTracks.concat(trackIdsForThisBundle.flat());
        return response;
      });
  });

  return Promise.all(promises).then(response => {
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
        audioFeatures = audioFeatures.concat(response.data.audio_features);
        return response;
      });
  });

  return Promise.all(promises).then(response => {
    return audioFeatures;
  });
};

const getAudioFeature = (trackID, header) => {
  return axios
    .get(baseUrl + "/audio-features/" + encodeURIComponent(trackID), {
      headers: header
    })
    .then(response => {
      return response.data;
    });
};

const getNumberOfTracksInPlaylist = (playlistID, header) => {
  return axios
    .get(baseUrl + "/playlists/" + playlistID, { headers: header })
    .then(response => {
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
          const artistIDs = response.data.items
            .map(item => item.track.artists[0].id)
            .filter((item, index, array) => array.indexOf(item) === index);
          allArtists = allArtists.concat(artistIDs);
          return response;
        })
    );
  }

  return Promise.all(allPromises).then(response => {
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
    return allTracks;
  });
};

const createPlaylistFromPlaylist_ArtistBased = (id, header, setPlaylistCreated) => {
  let songsToAdd = []
  getNumberOfTracksInPlaylist(id, header)
  .then(numberOfTracks => getPlaylistsArtists(id, numberOfTracks, header))
  .then(artistIDs => getMultipleSimilarArtists(artistIDs, header))
  .then(relatedArtists => getArtistsTopSongs(relatedArtists, header))
  .then(allSongs => {
    songsToAdd = allSongs
    return getUserProfileInformation(header)
  })
  .then(userID => createPlaylist(header, userID))
  .then(playlist_id => populatePlaylist(songsToAdd, playlist_id, header))
  .then(() => setPlaylistCreated(true))
}

const createPlaylistWithSimilarArtists = (id, header, setPlaylistCreated) => {
  let songsToAdd = []
  getSimilarArtists(id, header)
  .then(relatedArtists => getArtistsTopSongs(relatedArtists, header))
  .then(allSongs => {
    songsToAdd = allSongs
    return getUserProfileInformation(header)
  })
  .then(userID => createPlaylist(header, userID))
  .then(playlist_id => populatePlaylist(songsToAdd, playlist_id, header))
  .then(() => setPlaylistCreated(true))
}

const createPlaylistWithSimilarSongs = (id, songID, header, setPlaylistCreated) => {
  let allFeatures = []
  let allSongs = []
  getSimilarArtists(id, header)
  .then(relatedArtists => getArtistsAlbums(relatedArtists, header))
  .then(allAlbums => getAlbumsTracks(allAlbums, header))
  .then(allTracks => getAudioFeatures(allTracks, header))
  .then(allAudioFeatures => {
    allFeatures = allAudioFeatures
    return getAudioFeature(songID, header)
  })
  .then(songAudioFeatures => {
    allSongs = allFeatures
      .filter(feature => {
        return ( feature !== null ?
          feature.tempo > songAudioFeatures.tempo * 0.9 &&
          feature.tempo < songAudioFeatures.tempo * 1.1 &&
          (feature.energy > songAudioFeatures.energy * 0.8 &&
            feature.energy <
              songAudioFeatures.energy * 1.2) &&
          (feature.valence >
            songAudioFeatures.valence * 0.8 &&
            feature.valence < songAudioFeatures.valence * 1.2)
        : false);
      })
      .map(features => features.uri)
  })
  .then(() => getUserProfileInformation(header))
  .then(userID => createPlaylist(header,userID))
  .then(playlist_id => populatePlaylist(allSongs,playlist_id,header))
  .then(() => setPlaylistCreated(true))
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
  getMultipleSimilarArtists: getMultipleSimilarArtists,
  createPlaylistFromPlaylist_ArtistBased:createPlaylistFromPlaylist_ArtistBased,
  createPlaylistWithSimilarArtists:createPlaylistWithSimilarArtists,
  createPlaylistWithSimilarSongs:createPlaylistWithSimilarSongs
};
