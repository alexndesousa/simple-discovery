import React, { useState, useEffect } from "react";
import discoveryService from "../services/discoveryService";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";

const PlaylistForm = ({
  searchLabel,
  newSearch,
  handleSearch,
  header,
  setValues
}) => {
  let discoveryFunction = discoveryService.getUsersPlaylists;

  useEffect(() => {
    if (header !== null) {
      discoveryFunction(header, setValues)
    }
  }, [newSearch, header, setValues]);

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
      />
    </Grid>
  );
};

export default PlaylistForm;
