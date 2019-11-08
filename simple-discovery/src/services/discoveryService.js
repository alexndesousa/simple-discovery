import axios from 'axios'

const baseUrl = "https://api.spotify.com/v1"

const getUserProfileInformation = (header, setUserData) => {
    return axios
            .get(baseUrl + "/me", {headers : header})
            .then(response => {
                const formattedData = {
                    "username":response.data.display_name,
                    "id":response.data.id,
                    "email": response.data.email,
                    "country":response.country
                }
                setUserData(formattedData)
            })
}

const getUsersPlaylists = (header, setUserPlaylists) => {
    return axios
            .get(baseUrl+"/me/playlists?limit=50", {headers : header})
            .then(response => {
                console.log('response from playlists', response.data)
                const formattedData = response.data.items.map(info => {
                    let formatted = {
                        "name":info.name,
                        "id":info.id,
                        "image":info.images[0].url
                    }
                    return formatted
                })
                setUserPlaylists(formattedData)
                console.log("formatted data", formattedData)
            })
}

const searchForArtist = (query, header, setArtists, setArtistSearched) => {
    const type = "artist"
    const endpoint = baseUrl + "/search?q=" + encodeURIComponent(query) + "&type=" + encodeURIComponent(type)
    return axios
            .get(endpoint, {headers: header})
            .then(response => {
                const formattedArtists = response.data.artists.items.map(info => {
                    let pair = {
                        "name": info.name,
                        "id": info.id
                    }
                    return pair
                })
                setArtists(formattedArtists)
                setArtistSearched(false)
            }).catch(error => {
                console.log(error)
            })
}

const searchForSong = (query, header, setSongs, setSongSearched) => {
    const type = "track"
    const endpoint = baseUrl + "/search?q=" + encodeURIComponent(query) + "&type=" + encodeURIComponent(type)
    return axios
            .get(endpoint, {headers: header})
            .then(response => { 
                const formattedSongs = response.data.tracks.items.map(info => {
                    let pair = {
                        "name": info.name,
                        "id": info.id,
                        "artist":info.artists[0].name,
                        "image":info.album.images[0].url
                    }
                    return pair
                })
                setSongs(formattedSongs)
                setSongSearched(false)
            }).catch(error => {
                console.log(error)
            })
}

const getSimilarArtists = (id, header) => {
    const endpoint = baseUrl + "/artists/" + id + "/related-artists"
    return axios
            .get(endpoint, {headers: header})
            .then(response => {
                return response.data.artists.map(info => info.id)
            })
}

const getArtistsTopSongs = (artists, header, setAllRelatedSongs) => {
    let tempSongs = []
    let allSongs = []
    const endpoint = baseUrl + "/artists/"
    const promises = artists.map(artist => {
        //MUST NOT FORGET TO CHANGE THE COUNTRY CODE!!!!!!!!
        return axios
                .get(endpoint + artist + "/top-tracks?country=GB", {headers:header})
                .then(response => {
                    const songURIs = response.data.tracks.map(info => info.uri)
                    if(tempSongs.length + songURIs.length <= 100) {
                        tempSongs = tempSongs.concat(songURIs)
                    } else {
                        allSongs.push(tempSongs)
                        tempSongs = [].concat(songURIs)
                    }
                })
    })
    return Promise
            .all(promises)
            .then(() => {
                allSongs.push(tempSongs)
                console.log('allSongs', allSongs)
                setAllRelatedSongs(allSongs)
                return allSongs
            })
}

const createPlaylist = (header, setCreatedPlaylistID) => {
    //MUST NOT FORGET TO CHANGE USER ID
    const endpoint = baseUrl + "/users/" + "alex31734" + "/playlists"
    header["Content-Type"] = "application/json"
    const body = {
        "name":"Simple discovery test",
        "description":"just a simple test"
    }
    return axios
            .post(endpoint, body, {headers:header})
            .then(response => {
                setCreatedPlaylistID(response.data.id)
                return response.data.id
            })
}

const populatePlaylist = (allSongs, playlistID, header) => {
    console.log('final allSongs', allSongs)
    const promises = allSongs.map(songBundle => {
        return axios
                .post(baseUrl + "/playlists/" + playlistID + "/tracks",
                    {"uris":songBundle},
                    {headers:header})
                .then(response => {
                    return response
                })
    })
    return Promise.all(promises)
}

export default {
    getUserProfileInformation:getUserProfileInformation,
    getUsersPlaylists:getUsersPlaylists,
    searchForArtist:searchForArtist,
    searchForSong:searchForSong,
    getSimilarArtists:getSimilarArtists,
    getArtistsTopSongs:getArtistsTopSongs,
    createPlaylist:createPlaylist,
    populatePlaylist:populatePlaylist
}