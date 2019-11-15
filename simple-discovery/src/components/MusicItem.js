import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import LoadingModal from "./LoadingModal"

const useStyles = makeStyles({
  card: {
    maxWidth: 345
  },
  media: {
    height: 140
  }
});

const MusicItem = ({ id, image, name, functionToExecute, isPlaylistCreated, setPlaylistCreated }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [allowClose, setAllowClose] = useState(true)

  useEffect(() => {
    if(isPlaylistCreated) {
      setAllowClose(false)
    }
  }, [isPlaylistCreated])

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false);
    if (isPlaylistCreated) {
      setPlaylistCreated(false)
    }
  };

  return (
    <Grid item align="center">
      <LoadingModal open={open} handleClose={handleClose} isPlaylistCreated={isPlaylistCreated} isCloseAllowed={allowClose} />
      <Card className={classes.card} onClick={() => {functionToExecute(...id); handleOpen()}}>
        
        <CardActionArea>
          <CardMedia className={classes.media} image={image} title={name} />
          <CardContent>
            <Typography variant="h5" component="h2">
              {name}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  );
};

export default MusicItem;
