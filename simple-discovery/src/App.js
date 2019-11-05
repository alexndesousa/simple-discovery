import React, { useState, useEffect } from 'react'
import axios from 'axios'

//hash parameters will get the parameters in the url 
//need to figureo ut how to get them after a redirect

const App = () => {
    const[newSearch, setNewSearch] = useState("")
    const[artists, setArtists] = useState([])
    const[header, setHeader] = useState(null)
    const[state, setState] = useState("")

    const client_id = "a4e259d0257745afb6d9bc995d65808d"
    const redirect_uri = "http://localhost:3000/"
    const scope = "user-top-read user-read-private user-read-email"


    const handleSearch = (event) => {
        setNewSearch(event.target.value)
    }

    // const handleState = () => {
    //     setState(state)
    // }

    //redirects the user to spotify so they can authenticate themselves.
    //they are then sent back to the redirect uri (in this case localhost)
    const authenticateUser = () => {
        const state = generateRandomString(16)
        const url = "https://accounts.spotify.com/authorize?response_type=token"+
                    "&client_id="+ encodeURIComponent(client_id)+ 
                    "&scope=" + encodeURIComponent(scope) +
                    "&redirect_uri=" + encodeURIComponent(redirect_uri) +
                    "&state=" + encodeURIComponent(state)
        setState(state)
        window.location = url
    }


    //I should merge the next two functions into one, it seems unecessary that I have to press
    //the get data button, it should just work once the user is authenticated


    //grabs the url parameters and puts them into an object (then returns it)
    const decodeAuthKey = () => {
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
        const authInfo = decodeAuthKey()
        const header = {Authorization: " " + authInfo.token_type + " " + authInfo.access_token}
        setHeader(header)
    }


    //simply formats the artists into a list by name and in the order they showed up in
    const listOfArtists = artists.map(info => 
        <div key={info.id}>
            {info.name}
        </div>
    )

    return (
        <div>
            <Search newSearch={newSearch} handleSearch={handleSearch} header={header} setArtists={setArtists}></Search>
            <button onClick={() => authenticateUser()}>authenticate</button>
            <button onClick={() => getAuthorizationHeader()}>get dataaaa</button>
            <UserInfo header={header}></UserInfo>
            {listOfArtists}
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

const UserInfo = ({ header }) => {
    const[userData, setUserData] = useState([])

    const endpoint = "https://api.spotify.com/v1/me"


    //this correctly fetches the authenticated users information
    useEffect(() => {
        if(header !== null) {
            axios
                .get(endpoint, {headers : header})
                .then(response => {
                    console.log("response from get request", response.data)
                    setUserData(response.data)
                }).catch(error => {
                    console.log(error)
                })
        }
    }, [header])

    return (
        <div>
            heya from the userinfo
            <h1>{userData.display_name}</h1>
            <h1>{userData.email}</h1>
        </div>
    )
}

const Search = ({ newSearch, handleSearch, header, setArtists }) => {
    //need to somehow get the top 10 artists when the user presses the search button
    const endpoint = "https://api.spotify.com/v1/search"
    const searchQuery = newSearch //this will be newSearch but for testing purposes lets do this
    const type = "artist" // can be multiple types: "album,track" searches for the query in albums and tracks. album, artist, playlist and track are the valid types
    //there are also optional parameters but we will ignore them for now
    const[artistSearched, setArtistSearched] = useState(false)


    //this correctly finds eminem and a bunch of other dudes, but I only wanna do this when i click search
    const url = endpoint + "?" +
                "q=" + encodeURIComponent(searchQuery) + "&"+
                "type=" + encodeURIComponent(type)

    //might also be worth catching the error and making the user wait a the amount of time listed
    //before continuing making requests (such as response code 429 which means we've made too many requests)
    useEffect(() => {
        if(header !== null && artistSearched) {
            axios
                .get(url, {headers : header})
                .then(response => {
                    //this extracts the artist name and its id from the search and puts it in an array in the state hook
                    //this will make it easy to identify the corresponding id for the artist when it comes time
                    const formattedArtists = response.data.artists.items.map(info => {
                        let pair = {
                            "name":info.name,
                            "id":info.id
                        }
                        return pair
                    })
                    console.log("formatted", formattedArtists)
                    setArtists(formattedArtists)
                    setArtistSearched(false)
                }).catch(error => {
                    console.log(error)
                })
        }
    }, [header, artistSearched])
    
    const toggleArtistSearch = () => {
        setArtistSearched(true)
    }

    return (
        <div>
            find artists <input value={newSearch} onChange={handleSearch}></input>
            <button onClick={() => toggleArtistSearch()}>search</button>
        </div>
    )
}

const ArtistSearch = () => {

}

export default App