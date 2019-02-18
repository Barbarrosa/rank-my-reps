import * as React from "react";
import { BrowserRouter, Link, NavLink, Route } from "react-router-dom";

import {
  AppBar,
  Button,
  createMuiTheme,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar
} from "@material-ui/core";
import { Menu as MenuIcon, ThumbDown, ThumbUp } from "@material-ui/icons";
import { makeStyles, ThemeProvider } from "@material-ui/styles";
import BillRoute from "../routes/BillRoute";
import MembersRoute, { getMembersTitle } from "../routes/MembersRoute";
import ScorecardRoute, {
  TITLE as SCORECARD_TITLE
} from "../routes/ScorecardRoute";

import agplv3Logo from "../assets/agplv3-with-text-100x42.png";
import GithubLogo from "../assets/GitHub-Mark-Light-64px.png";
import ApiKeyRequest from "../components/ApiKeyRequest";
import { CookieWidget, PrivacyWidget } from "../components/PolicyWidgets";

const muiTheme = createMuiTheme({
  typography: {
    useNextVariants: true
  }
});

const useStyles = makeStyles(theme => ({
  bodyText: theme.typography.body2,
  githubLogo: {
    height: "2.5em",
    "vertical-align": "middle"
  },
  menuItem: {
    ...theme.typography.body2,
    display: "block",
    height: "100%",
    textDecoration: "none",
    width: "100%"
  },
  rightLinks: {
    position: "absolute",
    right: "1em"
  },
  titleText: {
    ...theme.typography.h5,
    color: "#fff"
  },
  toolbar: theme.mixins.toolbar
}));

const ToolbarShift = props => (
  <div {...props} className={useStyles().toolbar} />
);

function Header(): JSX.Element {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(!open);
  return (
    <header>
      <AppBar>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="Open drawer"
            onClick={handleOpen}
          >
            <MenuIcon />
          </IconButton>
          <h1 className={useStyles().titleText}>Rank My Reps</h1>
          <div className={useStyles().rightLinks}>
            <Button
              variant="text"
              target="_blank"
              href="https://github.com/Barbarrosa/rank-my-reps"
            >
              <img
                className={useStyles().githubLogo}
                src={GithubLogo}
                alt="Rank My Reps Github Project"
              />
            </Button>
            <Button
              variant="contained"
              size="small"
              color="secondary"
              target="_blank"
              href="https://github.com/Barbarrosa/rank-my-reps/issues"
            >
              Issues
            </Button>
          </div>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        anchor="left"
        open={open}
        onClose={handleOpen}
      >
        <List>
          {[
            {
              name: "Home",
              to: "/"
            },
            {
              name: "House Bills (Passed)",
              to: "/bills/house/116"
            },
            {
              name: "Senate Bills (Passed)",
              to: "/bills/senate/116"
            },
            {
              name: getMembersTitle(116, "house"),
              to: "/members/house/116"
            },
            {
              name: getMembersTitle(116, "senate"),
              to: "/members/senate/116"
            },
            {
              name: SCORECARD_TITLE,
              to: "/scorecard"
            }
          ].map(item => {
            return (
              <ListItem key={item.to}>
                <ListItemText>
                  <NavLink
                    to={item.to}
                    className={useStyles().menuItem}
                    onClick={handleOpen}
                  >
                    {item.name}
                  </NavLink>
                </ListItemText>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
    </header>
  );
}

function Main(): JSX.Element {
  const Home = () => (
    <div className={useStyles().bodyText}>
      <p>
        Welcome to Rank My Reps! This app helps bridge the gap between elected
        officials' votes and your preferences.
      </p>
      <p>Start by following these steps:</p>
      <ol>
        <li>
          Select <Link to="/bills/house/116">House Bills (Passed)</Link> or{" "}
          <Link to="/bills/senate/116">Senate Bills (Passed)</Link>
        </li>
        <li>
          Find and click{" "}
          <span title="support">
            <ThumbUp />
          </span>{" "}
          for bills you like or{" "}
          <span title="oppose">
            <ThumbDown />
          </span>{" "}
          for bills you don't like.
        </li>
        <li>
          Navigate to <Link to="/members/senate/116">116th Senate</Link> or{" "}
          <Link to="/members/house/116">116th House</Link>.
        </li>
        <li>Sort the list by clicking on the "Score" column.</li>
      </ol>
      <p>
        Now you know which reps vote like you! Here are some suggestions about
        what to do with this info:
      </p>
      <ul>
        <li>Help your community replace reps who did poorly.</li>
        <li>Vote for reps who did well.</li>
        <li>
          Build alliances with good reps outside your district/county/state.
        </li>
      </ul>
      <p>
        <strong>This project is in alpha.</strong> Your browser stores your
        score preferences in a cache that may be deleted arbitrarily based on
        your browser's settings, and upcoming versions of this project may
        produce backwards-incompatible changes resulting in data loss.
      </p>
    </div>
  );
  return (
    <main>
      <ToolbarShift />
      <div>
        <Route path="/" exact={true} component={Home} />
        <ScorecardRoute path="/scorecard" />
        <MembersRoute path="/members/:chamber/:congress" />
        <BillRoute path="/bills/:chamber/:congress" />
      </div>
    </main>
  );
}

function App(): JSX.Element {
  return (
    <div>
      <Header />
      <Main />
      <div>
        <a
          href="https://github.com/Barbarrosa/rank-my-reps/blob/master/LICENSE"
          target="_blank"
        >
          <img src={agplv3Logo} />
        </a>
      </div>
      <PrivacyWidget />
      <CookieWidget />
      <ApiKeyRequest />
    </div>
  );
}

function RoutedAndStyledApp() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={muiTheme}>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default RoutedAndStyledApp;
