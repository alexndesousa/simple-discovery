
import React, { useState, useEffect } from 'react'
import axios from 'axios'

const SongSearch = ({ newSongSearch, handleSongSearch, header, setSongs }) => {
    const endpoint = "https://api.spotify.com/v1/search"
    const searchQuery = newSongSearch //this will be newSearch but for testing purposes lets do this
    const type = "track" // can be multiple types: "album,track" searches for the query in albums and tracks. album, artist, playlist and track are the valid types
    //there are also optional parameters but we will ignore them for now
    const[songSearched, setSongSearched] = useState(false)


    //this correctly finds eminem and a bunch of other dudes, but I only wanna do this when i click search
    const url = endpoint + 
                "?q=" + encodeURIComponent(searchQuery) +
                "&type=" + encodeURIComponent(type)

    //might also be worth catching the error and making the user wait a the amount of time listed
    //before continuing making requests (such as response code 429 which means we've made too many requests)
    useEffect(() => {
        if(header !== null && songSearched) {
            axios
                .get(url, {headers: header})
                .then(response => {
                    //this extracts the artist name and its id from the search and puts it in an array in the state hook
                    //this will make it easy to identify the corresponding id for the artist when it comes time
                    
                    console.log('response', response)
                    const formattedSongs = response.data.tracks.items.map(info => {
                        let pair = {
                            "name": info.name,
                            "id": info.id,
                            "artist":info.artists[0].name,
                            "image":info.album.images[0].url
                        }
                        return pair
                    })
                    console.log('what im storing for song', formattedSongs)
                    setSongs(formattedSongs)
                    setSongSearched(false)
                }).catch(error => {

                    //and maybe make an alert
                    console.log(error)
                })
        }
    }, [header, songSearched, setSongs, url])
    
    const toggleSongSearch = () => {
        setSongSearched(true)
    }

    return (
        <div>
            <input placeholder="enter a song to search for" value={newSongSearch} onChange={handleSongSearch}></input>
            <button onClick={() => toggleSongSearch()}>search</button>
        </div>
    )
}

export default SongSearch