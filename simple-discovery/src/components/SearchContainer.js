import React from "react";
import SearchForm from "./SearchForm";
import IconButton from "@material-ui/core/IconButton";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import MusicContainer from "./MusicContainer";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  back_button: {
    left: "10%"
  }
});

const SearchContainer = ({
  isPageVisible,
  togglePage,
  toggleMainMenu,
  searchLabel,
  newSearch,
  handleSearch,
  header,
  setValues,
  type,
  musicItems
}) => {
  const classes = useStyles();

  return (
    <>
      {isPageVisible ? (
        <div>
          <IconButton
            className={classes.back_button}
            onClick={() => {
              togglePage();
              toggleMainMenu();
            }}
          >
            <ArrowBackIcon fontSize="large" />
          </IconButton>

          <SearchForm
            searchLabel={searchLabel}
            newSearch={newSearch}
            handleSearch={handleSearch}
            header={header}
            setValues={setValues}
            type={type}
          />
          <MusicContainer musicItems={musicItems} />
        </div>
      ) : null}
    </>
  );
};

export default SearchContainer;
