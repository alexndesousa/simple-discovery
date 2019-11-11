import React, { useState, useEffect } from "react";
import discoveryService from "../services/discoveryService";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";

const SearchForm = ({
  searchLabel,
  newSearch,
  handleSearch,
  header,
  setValues,
  type
}) => {
  let discoveryFunction = null;

  if (type === "song") {
    discoveryFunction = discoveryService.searchForSong;
  } else {
    discoveryFunction = discoveryService.searchForArtist;
  }

  const [searched, setSearched] = useState(false);

  const toggleSearch = () => {
    setSearched(true);
  };

  useEffect(() => {
    if (header !== null && searched) {
      discoveryFunction(newSearch, header, setValues, setSearched);
    }
  }, [newSearch, header, setValues, searched]);

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
        label={searchLabel}
        margin="normal"
        variant="filled"
        value={newSearch}
        onChange={handleSearch}
        onKeyPress={ev => {
          if (ev.key === "Enter") {
            toggleSearch();
          }
        }}
      />

      <Button variant="contained" onClick={() => toggleSearch()}>
        search
      </Button>
    </Grid>
  );
};

export default SearchForm;
