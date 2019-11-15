import React, { useEffect } from "react";
import discoveryService from "../services/discoveryService";

const UserInfo = ({ header, setUserPlaylists }) => {
  useEffect(() => {
    if (header !== null) {
      discoveryService
        .getUserProfileInformation(header)
        .then(() => {
          discoveryService.getUsersPlaylists(header, setUserPlaylists);
        })
        .catch(error => {
          console.log(error);
        });
    }
  }, [header, setUserPlaylists]);

  return <div>your profile information:</div>;
};

export default UserInfo;
