import React, { useState, useEffect } from "react";
import discoveryService from "../services/discoveryService";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";

const SongSearch = ({ newSongSearch, handleSongSearch, header, setSongs }) => {
  const [songSearched, setSongSearched] = useState(false);

  const toggleSongSearch = () => {
    setSongSearched(true);
  };

  useEffect(() => {
    if (header !== null && songSearched) {
      discoveryService.searchForSong(
        newSongSearch,
        header,
        setSongs,
        setSongSearched
      );
    }
  }, [newSongSearch, header, setSongs, songSearched]);

  return (
    <Grid
      container
      direction="column"
      justify="center"
      alignItems="center"
      spacing={2}
      style={{ margin: "0", width: "100%" }}
    >
      <TextField
        id="filled-basic"
        label="Song name"
        margin="normal"
        variant="filled"
        value={newSongSearch}
        onChange={handleSongSearch}
        onKeyPress={ev => {
          if (ev.key === "Enter") {
            toggleSongSearch();
          }
        }}
      />

      <Button variant="contained" onClick={() => toggleSongSearch()}>search</Button>
    </Grid>

    // <div>
    //   <input
    //     placeholder="enter a song to search for"
    //     value={newSongSearch}
    //     onChange={handleSongSearch}
    //   ></input>
    //   <button onClick={() => toggleSongSearch()}>search</button>
    // </div>
  );
};

export default SongSearch;
