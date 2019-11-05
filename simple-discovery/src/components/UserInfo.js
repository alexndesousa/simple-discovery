import React, { useState, useEffect } from 'react'
import axios from 'axios'

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

export default UserInfo