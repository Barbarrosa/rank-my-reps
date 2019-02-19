import * as React from "react";
import { Route, RouteProps } from "react-router";
import { BillVote, Bill } from "../fn/Bill";
import {
  getRollCallVote,
  getSpecificBill,
  getMemberComparison
} from "../fn/cachedApi";
import { Chamber } from "../fn/Chamber";
import CongressChamber from "../fn/CongressChamber";
import { CongressMember } from "../fn/CongressMember";
import RollCallVote, {
  voteMatchesPosition,
  RollCallPosition
} from "../fn/RollCallVote";
import { ScoreCard } from "../fn/scorecard";
import { getUserId } from "../fn/User";
import getMemberState from "../state/MemberState";
import getScoreState from "../state/ScoreState";
import Nth from "../util/Nth";
import ProPublicaDataTable from "../components/tables/ProPublicaDataTable";
import AdaptedMaterialTable from "../components/adapters/AdaptedMaterialTable";
import { makeStyles } from "@material-ui/styles";
import getTrustLevelState from "../state/TrustLevelState";
import { Button, Tooltip } from "@material-ui/core";
import { setMemberTrustLevel } from "../fn/MemberTrustLevel";
import MemberCompare from "../fn/MemberCompare";

export const TITLE = "Congress Members";
type Position<T extends RollCallVote> = T extends { positions: Array<infer P> }
  ? P
  : never;
type RollCallPositionWithBill = RollCallPosition & { bill: Bill };
interface MemberAndPosition {
  member: CongressMember & { full_name?: string; trust_level?: number };
  position?: {
    score: number;
    bad: RollCallPositionWithBill[];
    good: RollCallPositionWithBill[];
    cmpBad: number;
    cmpGood: number;
    votes: RollCallPositionWithBill[];
  };
}
function getBillSession(date: string) {
  if (new Date(Date.parse(date)).getFullYear() % 2 === 0) {
    return 2;
  } else {
    return 1;
  }
}
interface MemberVotes {
  [vote: string]: Position<RollCallVote>;
}
function getVotes(
  votes: MemberVotes,
  scores: ScoreCard | undefined,
  good: boolean
): RollCallPositionWithBill[] {
  if (!scores) {
    return [];
  }
  return Object.entries(votes).reduce(
    (agg, [key, value]) => {
      if (
        scores[key] &&
        value &&
        voteMatchesPosition(value.vote_position, good && scores[key].support)
      ) {
        agg.push({ ...value, bill: scores[key].bill });
      }
      return agg;
    },
    [] as RollCallPositionWithBill[]
  );
}

const useStyles = makeStyles(theme => ({
  goodVote: {
    color: "green"
  },
  badVote: {
    color: "red"
  },
  trustButton: {
    width: "100%"
  }
}));

const getRouteComponent = ({ match }) => {
  const { chamber, congress }: CongressChamber = match.params;
  const { members, loading } = getMemberState(chamber, congress);

  const userId = getUserId();

  const scoreState = getScoreState(userId);
  const { scores, loading: scoresLoading } = scoreState;

  const { trustLevels, loading: trustLevelsLoading } = getTrustLevelState(
    userId
  );

  const lowerCaseChamber: Chamber = chamber.toLowerCase() as Chamber;
  const [votes, setVotes] = React.useState([] as RollCallVote[]);
  const [votesLoading, setVotesLoading] = React.useState(true);
  React.useEffect(() => {
    (async () => {
      setVotesLoading(true);
      try {
        const fetches: RollCallVote[] = [];
        for (const score of scores) {
          try {
            const bill = await getSpecificBill(congress, score.bill.bill_slug);
            const passageVote = bill.votes.reduce(
              (a, b) => {
                if (b.chamber.toLowerCase() === lowerCaseChamber) {
                  if (a && Date.parse(b.date) < Date.parse(a.date)) {
                    return a;
                  } else {
                    return b;
                  }
                } else if (a) {
                  return a;
                }
              },
              undefined as BillVote | undefined
            );

            if (passageVote) {
              const vote = await getRollCallVote(
                chamber,
                congress,
                getBillSession(bill.introduced_date),
                Number(passageVote.roll_call)
              );
              fetches.push(vote);
            }
          } catch (e) {
            console.log(e);
          }
        }
        setVotes(fetches);
      } finally {
        setVotesLoading(false);
      }
    })();
  }, [chamber, congress, scores]);

  const [joined, setJoined] = React.useState([] as MemberAndPosition[]);
  const [joinedLoading, setJoinedLoading] = React.useState(true);

  const getMemberVotes = ({ id }: CongressMember) => {
    return votes.reduce(
      (a, v) => (
        (a[v.bill.bill_id] = v.positions.find(p => p.member_id === id)), a
      ),
      {}
    );
  };

  const [comparisons, setComparisons] = React.useState({} as {
    [K: string]: MemberCompare[];
  });
  const [comparisonsLoading, setComparisonsLoading] = React.useState(true);

  function getScoreFromComparisons({ id }: CongressMember) {
    const matching = comparisons[id] || [];
    if (matching.length < 1 || typeof matching.reduce !== "function") {
      return {
        good: 0,
        bad: 0
      };
    }
    const { good, bad, total } = matching.reduce(
      (result, compare) => {
        const good = result.good + Number(compare.common_votes);
        const bad = result.bad + Number(compare.disagree_votes);
        return {
          good,
          bad,
          total: result.total + good + bad
        };
      },
      { good: 0, bad: 0, total: 0 }
    );

    return {
      good: Math.floor((good / total) * (total / matching.length)),
      bad: Math.floor((bad / total) * (total / matching.length))
    };
  }

  React.useEffect(() => {
    (async () => {
      setComparisonsLoading(true);
      try {
        const newComparisons = {};
        for (const id in trustLevels) {
          for (const member of members) {
            const res = await getMemberComparison(
              congress,
              chamber,
              id,
              member.id
            );
            (newComparisons[member.id] = newComparisons[member.id] || []).push(
              res
            );
          }
        }
        setComparisons(newComparisons);
      } finally {
        setComparisonsLoading(false);
      }
    })();
  }, [congress, chamber, members, trustLevels]);

  // Populate row data
  React.useEffect(() => {
    const tmpJoined: MemberAndPosition[] = [];
    for (const member of members) {
      const existing: MemberAndPosition | {} =
        joined.find(f => f.member.id === member.id) || {};

      const good = getVotes(getMemberVotes(member), scores.original, true);
      const bad = getVotes(getMemberVotes(member), scores.original, false);

      const { good: cmpGood, bad: cmpBad } = getScoreFromComparisons(member);

      tmpJoined.push({
        ...existing,
        member: {
          ...member,
          get full_name() {
            const {
              short_title,
              first_name,
              middle_name,
              last_name,
              suffix
            } = member;
            return [short_title, first_name, middle_name, last_name, suffix]
              .filter(e => e)
              .join(" ");
          },
          get trust_level() {
            if (member.id in trustLevels) {
              return trustLevels[member.id].trustLevel;
            }
            return 0;
          }
        },
        position: {
          score: good.length - bad.length + (cmpGood - cmpBad),
          cmpGood,
          cmpBad,
          good,
          bad,
          votes: good.concat(bad)
        }
      });
    }
    setJoined(tmpJoined);
  }, [members, votes, trustLevels, comparisons]);

  // Control loading indicator
  React.useEffect(() => {
    setJoinedLoading(
      loading ||
        scoresLoading ||
        votesLoading ||
        trustLevelsLoading ||
        comparisonsLoading
    );
  }, [
    loading,
    scoresLoading,
    trustLevelsLoading,
    votesLoading,
    comparisonsLoading
  ]);

  const { goodVote, badVote, trustButton } = useStyles();

  return (
    <ProPublicaDataTable
      title={getMembersTitle(congress, chamber)}
      data={joined}
      detailPanel={(row: MemberAndPosition) => {
        return (
          <AdaptedMaterialTable
            columns={[
              {
                field: "bill.number",
                render: (row: RollCallPositionWithBill) => {
                  return (
                    <a target="_blank" href={row.bill.congressdotgov_url}>
                      {row.bill.number}
                    </a>
                  );
                },
                title: "#"
              },
              { field: "bill.short_title", title: "Name" },
              { field: "vote_position", title: "Position" }
            ]}
            data={row.position ? row.position.votes : []}
            title={`Score Breakdown for ${row.member.full_name}`}
          />
        );
      }}
      isLoading={joinedLoading}
      columns={[
        { field: "member.full_name", title: "Name" },
        {
          field: "position.score",
          render: (row: MemberAndPosition) => {
            const {
              position: {
                good: { length: good },
                bad: { length: bad },
                cmpGood,
                cmpBad,
                score
              } = {
                good: [],
                bad: [],
                cmpGood: 0,
                cmpBad: 0,
                score: 0
              }
            } = row;

            return (
              <Tooltip title="Support(You + Trusted Rep) - Oppose(You + Trusted Rep) = Total Score">
                <span>
                  {good || cmpGood ? (
                    <span className={good || cmpGood ? goodVote : ""}>
                      ({good}+{cmpGood})
                    </span>
                  ) : (
                    0
                  )}
                  <React.Fragment>&nbsp;-&nbsp;</React.Fragment>
                  {bad || cmpBad ? (
                    <span className={bad || cmpBad ? badVote : ""}>
                      ({bad}+{cmpBad})
                    </span>
                  ) : (
                    0
                  )}
                  <React.Fragment>&nbsp;=&nbsp;{score}</React.Fragment>
                </span>
              </Tooltip>
            );
          },
          title: "Score",
          type: "numeric"
        },
        {
          field: "member.trust_level",
          render: (row: MemberAndPosition) => {
            const change = () => {
              setMemberTrustLevel(userId, {
                member: row.member,
                trustLevel: Number(!row.member.trust_level)
              });
            };

            if (Number(row.member.trust_level) > 0) {
              return (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={change}
                  className={trustButton}
                >
                  Trusted
                </Button>
              );
            } else {
              return (
                <Button
                  variant="contained"
                  color="default"
                  onClick={change}
                  className={trustButton}
                >
                  Untrusted
                </Button>
              );
            }
          },
          title: "Trust Level",
          type: "numeric"
        },
        {
          title: "% Votes w/ Party",
          field: "member.votes_with_party_pct",
          type: "numeric"
        },
        { field: "member.party", title: "Party" },
        { field: "member.state", title: "State" },
        {
          field: "member.seniority",
          title: "Years in Office",
          type: "numeric"
        }
      ]}
    />
  );
};

export function getMembersTitle(congress: number, chamber: Chamber) {
  const formatChamber =
    chamber.charAt(0).toUpperCase() + chamber.slice(1).toLowerCase();
  return `${Nth(congress)} ${formatChamber}`;
}

export default <T extends RouteProps>(props: T): JSX.Element => (
  <Route {...props} component={getRouteComponent} />
);
