import React, { useState, useEffect } from 'react'
import axios from 'axios'

const UserInfo = ({ header, userData, setUserData, setUserPlaylists }) => {
    //const[userData, setUserData] = useState([])

    const endpoint = "https://api.spotify.com/v1/me"

    //this correctly fetches the authenticated users information
    useEffect(() => {
        if(header !== null) {
            axios
                .get(endpoint, {headers : header})
                .then(response => {
                    console.log("response from get request", response.data)
                    const formattedData = {
                            "username":response.data.display_name,
                            "id":response.data.id,
                            "email": response.data.email
                    }
                    setUserData(formattedData)
                    axios
                        .get(endpoint+"/playlists?limit=50", {headers : header})
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
                })
                .catch(error => {
                    console.log(error)
                })
        }
    }, [header])

    return (
        <div>
            your profile information:
        </div>
    )
}

export default UserInfo