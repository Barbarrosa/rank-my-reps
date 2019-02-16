import * as React from "react";
import {
  BrowserRouter,
  Link,
  NavLink as OriginalNavLink,
  Route
} from "react-router-dom";

import { AppBar, createMuiTheme, Tab, Tabs, Toolbar } from "@material-ui/core";
import { ThumbDown, ThumbUp } from "@material-ui/icons";
import { makeStyles, ThemeProvider } from "@material-ui/styles";
import { LocationDescriptor } from "history";
import { RouteChildrenProps } from "react-router";
import BillRoute from "../routes/BillRoute";
import MembersRoute, { getMembersTitle } from "../routes/MembersRoute";
import ScorecardRoute, {
  TITLE as SCORECARD_TITLE
} from "../routes/ScorecardRoute";

import agplv3Logo from "../assets/agplv3-with-text-100x42.png";
import ApiKeyRequest from "../components/ApiKeyRequest";
import { CookieWidget, PrivacyWidget } from "../components/PolicyWidgets";

const muiTheme = createMuiTheme({
  typography: {
    useNextVariants: true
  }
});

const useStyles = makeStyles(theme => ({
  bodyText: theme.typography.body1,
  link: {
    color: "#fff",
    textDecoration: "none"
  },
  toolbar: theme.mixins.toolbar
}));

const StyledNavLink = props => (
  <OriginalNavLink {...props} className={useStyles().link} />
);

const NavLink = (props: {
  to: LocationDescriptor;
  label: React.ReactNode;
  setTab: () => void;
}) => {
  function tabFn({ location }: RouteChildrenProps) {
    const selected = location.pathname === props.to ? true : false;
    if (selected) {
      props.setTab();
    }
    return (
      <StyledNavLink to={props.to}>
        <Tab label={props.label} selected={selected} />
      </StyledNavLink>
    );
  }

  return <Route exact={true} to={props.to} children={tabFn} />;
};

const ToolbarShift = props => (
  <div {...props} className={useStyles().toolbar} />
);

function Header(): JSX.Element {
  const [tab, setTab] = React.useState(0);
  const prepSetTab = (n: number) => () => n === tab || setTab(n);
  return (
    <header>
      <AppBar>
        <Toolbar>
          <Tabs value={tab} variant="scrollable" scrollButtons="auto">
            <NavLink setTab={prepSetTab(0)} to="/" label="Home" />
            <NavLink
              setTab={prepSetTab(1)}
              to="/bills/house/116"
              label={"House Bills (Passed)"}
            />
            <NavLink
              setTab={prepSetTab(2)}
              to="/bills/senate/116"
              label={"Senate Bills (Passed)"}
            />
            <NavLink
              setTab={prepSetTab(3)}
              to="/members/senate/116"
              label={getMembersTitle(116, "senate")}
            />
            <NavLink
              setTab={prepSetTab(4)}
              to="/members/house/116"
              label={getMembersTitle(116, "house")}
            />
            <NavLink
              setTab={prepSetTab(5)}
              to="/scorecard"
              label={SCORECARD_TITLE}
            />
          </Tabs>
        </Toolbar>
      </AppBar>
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
          Navigate to the <Link to="/members/senate/116">Senate</Link> or{" "}
          <Link to="/members/house/116">House</Link> tabs.
        </li>
        <li>
          Sort the list by clicking on the "Votes you Support" or "Votes you
          Oppose" columns.
        </li>
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
