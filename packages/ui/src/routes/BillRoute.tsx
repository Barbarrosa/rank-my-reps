import { ThumbDown, ThumbUp } from "@material-ui/icons";
import { makeStyles } from "@material-ui/styles";
import * as React from "react";
import { Route, RouteProps } from "react-router";
import LeftJoin from "ts-left-join";
import { Bill } from "../fn/Bill";
import { Score, updateScore } from "../fn/scorecard";
import { getUserId } from "../fn/User";
import getBillState from "../state/BillState";
import getScoreState from "../state/ScoreState";
import Nth from "../util/Nth";
import ProPublicaDataTable from "../components/tables/ProPublicaDataTable";

interface ScoredBill {
  bill: Bill;
  score?: Score & { vote: string };
}

const getUpdateRowScoreFn = (
  row: ScoredBill,
  support: boolean
): (() => Promise<void>) => {
  return async () => {
    if (row.score && row.score.support === support) {
      await updateScore(getUserId(), row.bill.bill_id);
    } else {
      await updateScore(getUserId(), row.bill.bill_id, {
        ...(row.score || { priority: 1, bill: row.bill }),
        support
      });
    }
  };
};

const useStyles = makeStyles(() => ({
  thumb: {
    cursor: "pointer"
  }
}));

const getRouteComponent = ({ match }) => {
  const classes = useStyles();

  const { chamber, congress } = match.params;
  const billState = getBillState(chamber, congress);
  const { bills } = billState;
  const billsLoading = billState.loading;

  const scoreState = getScoreState(getUserId());
  const { scores } = scoreState;
  const scoresLoading = scoreState.loading;

  const [joined, setJoined] = React.useState([]);
  React.useEffect(() => {
    setJoined(LeftJoin("bill", bills, "score", scores, "bill_id", "vote"));
  }, [bills, scores]);

  return (
    <ProPublicaDataTable
      title={`Recent Bills - ${Nth(congress)} ${chamber
        .charAt(0)
        .toUpperCase()}${chamber.slice(1)}`}
      isLoading={billsLoading || scoresLoading}
      data={joined}
      columns={[
        {
          customFilterAndSearch: (filter, row: ScoredBill) => {
            return (
              (filter === "checked") === (row.score ? row.score.support : null)
            );
          },
          customSort: (row1: ScoredBill, row2: ScoredBill) => {
            const support1 = row1.score ? row1.score.support : null;
            const support2 = row2.score ? row2.score.support : null;

            // true > null > false
            switch (true) {
              case support1 && support2:
                return 0;
              case support1 === false && support2 === false:
                return 0;
              case support1 === null && support2 === null:
                return 0;

              case support1 === true && support2 === false:
                return 1;
              case support1 === null && support2 === false:
                return 1;
              case support1 === true && support2 === null:
                return 1;

              case support1 === false && support2 === true:
                return -1;
              case support1 === null && support2 === true:
                return -1;
              case support1 === false && support2 === null:
                return -1;
            }

            return 0;
          },
          field: "score.support",
          render: (row: ScoredBill) => {
            const good = row.score ? row.score.support : null;
            return (
              <span>
                <span title="support">
                  <ThumbUp
                    className={classes.thumb}
                    color={good ? "inherit" : "disabled"}
                    onClick={getUpdateRowScoreFn(row, true)}
                  />
                </span>
                <span title="oppose">
                  <ThumbDown
                    className={classes.thumb}
                    color={good === false ? "inherit" : "disabled"}
                    onClick={getUpdateRowScoreFn(row, false)}
                  />
                </span>
              </span>
            );
          },
          title: "Preference",
          type: "boolean"
        },
        {
          field: "bill.number",
          render: (row: ScoredBill) => {
            return (
              <a target="_blank" href={row.bill.congressdotgov_url}>
                {row.bill.number}
              </a>
            );
          },
          title: "#"
        },
        {
          field: "bill.primary_subject",
          title: "Primary Subject"
        },
        {
          field: "bill.short_title",
          title: "Title"
        }
      ]}
    />
  );
};

export default <T extends RouteProps>(props: T): JSX.Element => (
  <Route {...props} component={getRouteComponent} />
);
