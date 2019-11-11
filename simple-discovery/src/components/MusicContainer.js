import React from "react";
import Grid from "@material-ui/core/Grid";

const MusicContainer = ({ musicItems }) => {
  return (
    <Grid
      container
      direction="column"
      justify="center"
      alignItems="stretch"
      spacing={2}
      style={{ minHeight: "80vh", margin: "0", width: "100%" }}
    >
      {musicItems}
    </Grid>
  );
};

export default MusicContainer;
