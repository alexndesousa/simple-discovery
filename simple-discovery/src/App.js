import React, { useState, useEffect } from 'react'
import UserInfo from './components/UserInfo'
import ArtistSearch from './components/ArtistSearch'
import SongSearch from './components/SongSearch'
import axios from 'axios'
import discoveryService from "./services/discoveryService"

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

    //i also wanna check the url here. If it contains the access_token, get rid of the authenticate
    //this can be done with the same method from earlier where it just extracted the token from the url params
    useEffect(() => {
        console.log('hello from the useEffect thingy mabob')
        getAuthorizationHeader()
    }, [])


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
        discoveryService
            .getSimilarArtists(id, header)
            .then(relatedArtists => {
                discoveryService
                .getArtistsTopSongs(relatedArtists, header, setAllRelatedSongs)
                .then(allSongs => {
                    discoveryService
                        .createPlaylist(header, setCreatedPlaylistId)
                        .then(playlist_id => {
                            discoveryService
                            .populatePlaylist(allSongs, playlist_id, header)
                        })
                })
            })
    }

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
                            <UserInfo header={header} setUserData={setUserData} setUserPlaylists={setUserPlaylists}></UserInfo>
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