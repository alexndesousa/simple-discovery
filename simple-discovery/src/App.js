import React, { useState, useEffect } from 'react'
import axios from 'axios'

//hash parameters will get the parameters in the url 
//need to figureo ut how to get them after a redirect

const App = () => {
    const[newSearch, setNewSearch] = useState("")
    const[artists, setArtists] = useState([])
    const[header, setHeader] = useState({})
    //const[authHeader, setAuthHeader] = useState({})
    //const[state, setState] = useState("")

    //gotta move the following into a function or itll constantly
    //be run, cant have the state and shit constantly being changed

    const client_id = "a4e259d0257745afb6d9bc995d65808d"
    const redirect_uri = "http://localhost:3000/"
    const scope = "user-top-read user-read-private user-read-email"


    const handleSearch = (event) => {
        setNewSearch(event.target.value)
    }

    const handleState = () => {
        const state = generateRandomString(16)
    }

    //redirects the user to spotify so they can authenticate themselves.
    //they are then sent back to the redirect uri (in this case localhost)
    const authenticateUser = () => {
        const state = generateRandomString(16)
        const url = "https://accounts.spotify.com/authorize?response_type=token"+
                    "&client_id="+ encodeURIComponent(client_id)+ 
                    "&scope=" + encodeURIComponent(scope) +
                    "&redirect_uri=" + encodeURIComponent(redirect_uri) +
                    "&state=" + encodeURIComponent(state)
        window.location = url
    }

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
    console.log(decodeAuthKey())
        
    
    const getUserInfo = () => {
        const authInfo = decodeAuthKey()
        const header = {Authorization: " " + authInfo.token_type + " " + authInfo.access_token}
        console.log("header", header)
        setHeader(header)
    }
    
    return (
        <div>
            <button onClick={() => authenticateUser()}>authenticate</button>
            <button onClick={() => getUserInfo()}>get dataaaa</button>
            <UserInfo header={header}></UserInfo>
        </div>
    )
}

const generateRandomString = length => {
    let text = "";
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    while (text.length <= length) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
  
    return text;
    };

const UserInfo = ({header}) => {
    const[userData, setUserData] = useState([])

    const endpoint = "https://api.spotify.com/v1/me"


    //this correctly fetches the authenticated users information
    useEffect(() => {
        axios
            .get(endpoint, {headers : header})
            .then(response => {
                console.log("response from get request", response.data)
                setUserData(response.data)
            })
    }, [header])

    return (
        <div>
            heya from the userinfo
            <h1>{userData.display_name}</h1>
            <h1>{userData.email}</h1>
        </div>
    )
}



export default App