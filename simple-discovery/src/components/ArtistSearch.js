import React, { useState, useEffect } from 'react'
import discoveryService from '../services/discoveryService'

const ArtistSearch = ({ newArtistSearch, handleArtistSearch, header, setArtists }) => {
    const[artistSearched, setArtistSearched] = useState(false)

    const toggleArtistSearch = () => {
        setArtistSearched(true)
    }

    useEffect(() => {
        if(header !== null && artistSearched) {
            discoveryService.searchForArtist(newArtistSearch, header, setArtists, setArtistSearched)
        }
    }, [newArtistSearch, header, artistSearched, setArtists])

    return (
        <div>
            <input placeholder="enter an artists name" value={newArtistSearch} onChange={handleArtistSearch}></input>
            <button onClick={() => toggleArtistSearch()}>search</button>
        </div>
    )
}

export default ArtistSearch