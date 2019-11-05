import React, { useState, useEffect } from 'react'
import axios from 'axios'

const ArtistSearch = ({ newSearch, handleSearch, header, setArtists }) => {
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

export default ArtistSearch