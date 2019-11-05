import React, { useState, useEffect } from 'react'
import axios from 'axios'
import UserInfo from './components/UserInfo'
import ArtistSearch from './components/ArtistSearch'

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
            <ArtistSearch newSearch={newSearch} handleSearch={handleSearch} header={header} setArtists={setArtists}/>
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

export default App