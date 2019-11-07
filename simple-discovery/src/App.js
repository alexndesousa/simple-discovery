import React, { useState, useEffect } from 'react'
import UserInfo from './components/UserInfo'
import ArtistSearch from './components/ArtistSearch'
import SongSearch from './components/SongSearch'
import axios from 'axios'

//hash parameters will get the parameters in the url 
//need to figureo ut how to get them after a redirect

const App = () => {
    const[newArtistSearch, setNewArtistSearch] = useState("")
    const[newSongSearch, setNewSongSearch] = useState("")

    const[artists, setArtists] = useState([])
    const[songs, setSongs] = useState([])
    const[userData, setUserData] = useState([])
    const[userPlaylists, setUserPlaylists] = useState([])

    const[createdPlaylistId, setCreatedPlaylistId] = useState("")
    const[allRelatedSongs, setAllRelatedSongs] = useState([])
    
    const[header, setHeader] = useState(null)
    const[state, setState] = useState("")
    const[newToken, setToken] = useState(null)
    const[urlParameters, setUrlParameters] = useState({})

    const[isLoginVisible, setLoginVisible] = useState(true)
    const[isMainMenuVisible, setMainMenuVisibility] = useState(true)
    const[isArtistPageVisible, setArtistPageVisibility] = useState(false)
    const[isSongPageVisible, setSongPageVisibility] = useState(false)
    const[isPlaylistPageVisible, setPlaylistPageVisibility] = useState(false)


    const handleArtistSearch = (event) => {
        setNewArtistSearch(event.target.value)
    }

    const handleSongSearch = (event) => {
        setNewSongSearch(event.target.value)
    }

    const toggleMainMenu = () => {
        console.log('toggled main menu')
        setMainMenuVisibility(!isMainMenuVisible)
    }

    const togglePlaylistPage = () => {
        setPlaylistPageVisibility(!isPlaylistPageVisible)
    }

    const toggleArtistPage = () => {
        setArtistPageVisibility(!isArtistPageVisible)
    }

    const toggleSongPage = () => {
        setSongPageVisibility(!isSongPageVisible)
    }

    

    // const handleState = () => {
    //     setState(state)
    // }

    //redirects the user to spotify so they can authenticate themselves.
    //they are then sent back to the redirect uri (in this case localhost)
    const authenticateUser = () => {
        const client_id = "a4e259d0257745afb6d9bc995d65808d"
        const redirect_uri = "http://localhost:3000/"
        const scope =   "user-top-read \
                        user-read-private \
                        user-read-email \
                        playlist-modify-public \
                        playlist-read-private"


        //whenever I make an api call, ensure that the state is the same as this one
        const state = generateRandomString(16)
        const url = "https://accounts.spotify.com/authorize?response_type=token"+
                    "&client_id="+ encodeURIComponent(client_id)+ 
                    "&scope=" + encodeURIComponent(scope) +
                    "&redirect_uri=" + encodeURIComponent(redirect_uri) +
                    "&state=" + encodeURIComponent(state)
        setState(state)
        setLoginVisible(false)
        //window.open(url, 'Login with spotify', 'width=800,height=600')
        window.location = url
    }


    //I should merge the next two functions into one, it seems unecessary that I have to press
    //the get data button, it should just work once the user is authenticated


    //grabs the url parameters and puts them into an object (then returns it)
    const decodeURLParameters = () => {
        const queryString = window.location.hash.substring(1)
        let query = {}
        let pairs = queryString.split("&")
        for(let i=0; i<pairs.length; i++) {
            let pair = pairs[i].split('=')
            query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1])
        }
        return query
    }
    //returns an object with all the information that i need from the url    
    const getAuthorizationHeader = () => {
        const authInfo = decodeURLParameters()
        const newHeader = {Authorization: " " + authInfo.token_type + " " + authInfo.access_token}
        setHeader(newHeader)
    }

    //so this will happen once on each refresh, thank fuck i figured it out. No need to click
    //"get dataaaa" to retrieve a users data


    //i also wanna check the url here. If it contains the access_token, get rid of the authenticate
    //this can be done with the same method from earlier where it just extracted the token from the url params
    useEffect(() => {
        console.log('hello from the useEffect thingy mabob')
        getAuthorizationHeader()
    }, [])

    //simply formats the artists into a list by name and in the order they showed up in

    const listOfPlaylists = userPlaylists.map(info =>
        <div key={info.id}>
            <img src={info.image} width="100"></img>
            {info.name}
        </div>
        )

    const userProfileInformation = 
        <div key={userData.id}>
            <h1>{userData.username}</h1>
            <h1>{userData.email}</h1>
            <h1>{userData.id}</h1>
            {listOfPlaylists}
        </div>

    //move this whole thing into its own component then wrap the axios call in an effect hook
    const getRelatedArtists = (id) => {
        const endpoint = "https://api.spotify.com/v1/artists/"+id+"/related-artists"
            //gets the related artists
            axios
                .get(endpoint, {headers : header})
                .then(response => {
                    let relatedArtists = response.data.artists.map(info => info.id)
                    return relatedArtists
                })
                .then(relatedArtists => {
                    let songs = []
                    let allSongs = []
                    const promises = relatedArtists.map(artist => {
                        return axios
                                .get("https://api.spotify.com/v1/artists/"+artist+"/top-tracks?country=GB", {headers:header})
                                .then(response => {
                                    const songURIs = response.data.tracks.map(info => info.uri)
                                    if(songs.length + songURIs.length <= 100) {
                                        songs = songs.concat(songURIs)
                                    } else {
                                        allSongs.push(songs)
                                        songs = [].concat(songURIs)
                                    }
                                })
                    })
                    Promise.all(promises)
                    .then(() => {
                        allSongs.push(songs)
                        setAllRelatedSongs(allSongs)
                    })
                    .then(() => {
                        console.log('checking if it made it into the next then ', songs)
                        //here we create the playlist
                        const endpoint = "https://api.spotify.com/v1/users/"+"alex31734"+"/playlists"

                        //const tempHeader = header["Content-Type"] = "application/json"
                        const tempHeader = header
                        tempHeader["Content-Type"] = "application/json"

                        
                        console.log('tempHeader', tempHeader, " normal header", header)
                        //tempHeader = header["Content-Type"] = "application/json"
                        const body = {
                            "name":"Simple discovery test",
                            "description":"just a simple test"
                        }
                        axios
                            .post(endpoint, body, {headers: header})
                            .then(response => {
                                console.log('response from playlist creation', response)
                                console.log('created playlist id', response.data.id)
                                setCreatedPlaylistId(response.data.id)
                                return response.data.id
                            })
                            .then(playlist_id => {
                                const promises = allSongs.map(songBundle => {
                                    return axios
                                            .post("https://api.spotify.com/v1/playlists/"+playlist_id+"/tracks", 
                                                {"uris":songBundle}, 
                                                {headers:header})
                                            .then(response => {
                                                console.log('response from adding bundle of songs to the playlist', response)
                                                return response
                                            })
                                })
                                Promise.all(promises)
                                .then(response => {
                                    console.log('response from executing all promises (for adding songs to a playlist)', response)
                                })
                            })
                    })
                })




                //.then(relatedSongs => {
                //     console.log('checking if relatedSongs made it to next "then"', relatedSongs)
                //     //create a playlist
                //     //add songs to playlist
                    // const endpoint = "https://api.spotify.com/v1/users/"+"alex31734"+"/playlists"

                    // const tempHeader = header["Content-Type"] = "application/json"
                    // const body = {
                    //     "name":"Simple discovery test",
                    //     "description":"just a simple test"
                    // }
                    // //let playlist_id = null
                    // //console.log('header state', header)

                    // axios
                    //     .post(endpoint, body, {headers: header})
                    //     .then(response => {
                    //         //need to store this playlist id somewhere
                    //         //console.log('response from playlist creation', response)
                    //         setCreatedPlaylistId(response.data.id)
                    //         //console.log('playlist_id', playlist_id)
                    //     })
                    //     .catch(error => {
                    //         console.log('errorrrr ', error)
                    //     })
                    
                //     return relatedSongs
                // })
                // .then(relatedSongs => {
                //     console.log('playlist id', createdPlaylistId)
                //     console.log('related songs', relatedSongs)
                // })
                // .catch(error => {
                //     console.log('error! ', error)
                // })
    }

    const getRelatedArtistsSongs = id => {
        const artists = getRelatedArtists(id)
        const country_id = userData.country
        for(let i=0; i<3; i++) {
            const endpoint = "https://api.spotify.com/v1/artists/"+artists[i]+"/top-tracks?country=" + country_id
            axios
                .get(endpoint, {headers : header})
                .then(response => {
                    console.log("response from related songs: ", response)
                })
        }
        
    }

    //when the button is clicked, we go to the loading page
    //in the background it will make an api call to the artist, finding out who the similar X
    //artists are. it will then store these "similar" artists and find their top songs X
    //these top songs will then be put into a playlist
    //once this is done the user is presented with a "get playlist" button which will
    //open their playlist in a new tab
    const listOfArtists = artists.map(info => 
        <div key={info.id}>
            {info.name}
            <button onClick={() => getRelatedArtists(info.id)}>
                select
            </button>
        </div>
    )

    

    const listOfSongs = songs.map(info => 
        <div key={info.id}>
            <img src={info.image} width="100"></img>
            {info.name} - {info.artist}
        </div>
    )

    const MainMenu = 
            <>
                {isMainMenuVisible ? 
                    <div>
                        <div>
                            <button onClick={() => {togglePlaylistPage(); toggleMainMenu()}}>import playlist</button>
                        </div>
                        <div>
                            <button onClick={() => {toggleArtistPage(); toggleMainMenu()}}>search artist</button>
                        </div>
                        <div>
                            <button onClick={() => {toggleSongPage(); toggleMainMenu()}}>search song</button>
                        </div>
                    </div>
                : null}
            </>

    const PlaylistPage = 
            <>
                {isPlaylistPageVisible ?
                    <div>
                        <div>
                            <UserInfo header={header} userData={userData} setUserData={setUserData} setUserPlaylists={setUserPlaylists}></UserInfo>
                        </div>
                        {userProfileInformation}
                        <button onClick={() => {togglePlaylistPage(); toggleMainMenu()}}>back</button>
                    </div>
                : null}
                
            </>

    const ArtistPage = 
            <>
                {isArtistPageVisible ?
                    <div>
                        <div>
                            <ArtistSearch newArtistSearch={newArtistSearch} handleArtistSearch={handleArtistSearch} header={header} setArtists={setArtists}/>
                        </div>
                        {listOfArtists}
                        <button onClick={() => {toggleArtistPage(); toggleMainMenu()}}>back</button>
                    </div>
                : null}
            </>

    const SongPage =
            <>
                {isSongPageVisible ?
                    <div>
                        <div>
                            <SongSearch newSongSearch={newSongSearch} handleSongSearch={handleSongSearch} header={header} setSongs={setSongs}/>
                        </div>
                        {listOfSongs}
                        <button onClick={() => {toggleSongPage(); toggleMainMenu()}}>back</button>
                    </div>
                : null}
            </>

    return (
        <div>
            
            {isLoginVisible ? <button onClick={() => authenticateUser()} >authenticate</button> : null}
            {/* {isLoginVisible ? <button onClick={() => toggleMainMenu()} >authenticate</button> : null} */}

            {MainMenu}
            {PlaylistPage}
            {ArtistPage}
            {SongPage}
        </div>
    )
}




const generateRandomString = length => {
    let text = ""
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  
    while (text.length <= length) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
  
    return text
}

export default App