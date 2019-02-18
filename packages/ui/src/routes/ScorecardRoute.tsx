import { ThumbDown, ThumbUp } from "@material-ui/icons";
import * as React from "react";
import { Route, RouteProps } from "react-router";
import AdaptedMaterialTable from "../components/adapters/AdaptedMaterialTable";
import { Score } from "../fn/scorecard";
import { getUserId } from "../fn/User";
import getScoreState from "../state/ScoreState";

export const TITLE = "Bill Scorecard";
const getRouteComponent = () => {
  const { scores, loading } = getScoreState(getUserId());

  return (
    <AdaptedMaterialTable
      title={TITLE}
      data={scores}
      isLoading={loading}
      columns={[
        {
          field: "bill.number",
          render: (row: Score) => {
            return (
              <a target="_blank" href={row.bill.congressdotgov_url}>
                {row.bill.number}
              </a>
            );
          },
          title: "#"
        },
        {
          field: "bill.short_title",
          title: "Title"
        },
        { title: "Priority", field: "priority" },
        {
          field: "support",
          render: (data: Score) => {
            if (data.support) {
              return (
                <span title="support">
                  <ThumbUp />
                </span>
              );
            } else {
              return (
                <span title="oppose">
                  <ThumbDown />
                </span>
              );
            }
          },
          title: "Support",
          type: "boolean"
        }
      ]}
    />
  );
};
export default <T extends RouteProps>(props: T): JSX.Element => (
  <Route {...props} component={getRouteComponent} />
);
