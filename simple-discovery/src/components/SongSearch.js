
import React, { useState, useEffect } from 'react'
import discoveryService from '../services/discoveryService'

const SongSearch = ({ newSongSearch, handleSongSearch, header, setSongs }) => {
    const[songSearched, setSongSearched] = useState(false)

    const toggleSongSearch = () => {
        setSongSearched(true)
    }

    useEffect(() => {
        if(header !== null && songSearched) {
            discoveryService.searchForSong(newSongSearch, header, setSongs, setSongSearched)
        }
    }, [newSongSearch, header, setSongs, songSearched])
    
    return (
        <div>
            <input placeholder="enter a song to search for" value={newSongSearch} onChange={handleSongSearch}></input>
            <button onClick={() => toggleSongSearch()}>search</button>
        </div>
    )
}

export default SongSearch