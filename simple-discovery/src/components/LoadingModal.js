import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles(theme => ({
  paper: {
    position: "absolute",
    maxWidth: 400,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    borderRadius:"3%"
  }
}));

const LoadingModal = ({
  open,
  handleClose,
  isPlaylistCreated,
  isCloseAllowed
}) => {
  const classes = useStyles();

  return (
    <div>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={open}
        onClose={handleClose}
        disableBackdropClick={isCloseAllowed}
        disableEscapeKeyDown={isCloseAllowed}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {isPlaylistCreated ? (
          <div className={classes.paper} align="center">
            <h2>Playlist created</h2>
            <p>(Click off this box to close it)</p>
          </div>
        ) : (
          <div className={classes.paper}>
            <h2 id="simple-modal-title">Generating playlist</h2>
            <div align="center">
              <CircularProgress />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LoadingModal;
