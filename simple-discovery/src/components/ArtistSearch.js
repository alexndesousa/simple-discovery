import React, { useState, useEffect } from "react";
import discoveryService from "../services/discoveryService";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";

const ArtistSearch = ({
  newArtistSearch,
  handleArtistSearch,
  header,
  setArtists
}) => {
  const [artistSearched, setArtistSearched] = useState(false);

  const toggleArtistSearch = () => {
    setArtistSearched(true);
  };

  useEffect(() => {
    if (header !== null && artistSearched) {
      discoveryService.searchForArtist(
        newArtistSearch,
        header,
        setArtists,
        setArtistSearched
      );
    }
  }, [newArtistSearch, header, artistSearched, setArtists]);

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
        label="Artists name"
        margin="normal"
        variant="filled"
        value={newArtistSearch}
        onChange={handleArtistSearch}
        onKeyPress={ev => {
          if (ev.key === "Enter") {
            toggleArtistSearch();
          }
        }}
      />
      {/* <input placeholder="enter an artists name" value={newArtistSearch} onChange={handleArtistSearch}></input> */}
      <Button variant="contained" onClick={() => toggleArtistSearch()}>search</Button>
    </Grid>
  );
};

export default ArtistSearch;
