import React, { useEffect } from "react";
import discoveryService from "../services/discoveryService";

const UserInfo = ({ header, setUserData, setUserPlaylists }) => {
  useEffect(() => {
    if (header !== null) {
      discoveryService
        .getUserProfileInformation(header, setUserData)
        .then(() => {
          discoveryService.getUsersPlaylists(header, setUserPlaylists);
        })
        .catch(error => {
          console.log(error);
        });
    }
  }, [header, setUserPlaylists, setUserData]);

  return <div>your profile information:</div>;
};

export default UserInfo;
