import * as React from "react";
import { Route, RouteProps } from "react-router";
import { BillVote, Bill } from "../fn/Bill";
import { getRollCallVote, getSpecificBill } from "../fn/cachedApi";
import { Chamber } from "../fn/Chamber";
import CongressChamber from "../fn/CongressChamber";
import { CongressMember } from "../fn/CongressMember";
import RollCallVote, {
  voteMatchesPosition,
  RollCallPosition
} from "../fn/RollCallVote";
import { Score, ScoreCard } from "../fn/scorecard";
import { getUserId } from "../fn/User";
import getMemberState from "../state/MemberState";
import getScoreState from "../state/ScoreState";
import Nth from "../util/Nth";
import ProPublicaDataTable from "../components/tables/ProPublicaDataTable";
import AdaptedMaterialTable from "../components/adapters/AdaptedMaterialTable";
import { makeStyles } from "@material-ui/styles";

export const TITLE = "Congress Members";
type Position<T extends RollCallVote> = T extends { positions: Array<infer P> }
  ? P
  : never;
type RollCallPositionWithBill = RollCallPosition & { bill: Bill };
interface MemberAndPosition {
  member: CongressMember & { full_name?: string };
  position: {
    score: number;
    bad: RollCallPositionWithBill[];
    good: RollCallPositionWithBill[];
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
  }
}));

const getRouteComponent = ({ match }) => {
  const { chamber, congress }: CongressChamber = match.params;
  const { members, loading } = getMemberState(chamber, congress);

  const scoreState = getScoreState(getUserId());
  const { scores } = scoreState;
  const scoresLoading = scoreState.loading;

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
  React.useEffect(() => {
    if (loading || scoresLoading || votesLoading) {
      return;
    }
    setJoinedLoading(true);
    try {
      const tmpJoined: MemberAndPosition[] = [];
      for (const member of members) {
        const memberVotes: MemberVotes = votes.reduce(
          (a, v) => (
            (a[v.bill.bill_id] = v.positions.find(
              p => p.member_id === member.id
            )),
            a
          ),
          {}
        );

        const bad = getVotes(memberVotes, scores.original, false);
        const good = getVotes(memberVotes, scores.original, true);

        tmpJoined.push({
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
            }
          },
          position: {
            get score() {
              return good.length - bad.length;
            },
            get good() {
              return good;
            },
            get bad() {
              return bad;
            }
          }
        });
      }
      setJoined(tmpJoined);
    } finally {
      setJoinedLoading(false);
    }
  }, [loading, scoresLoading, votesLoading, chamber, congress, votes, members]);

  const { goodVote, badVote } = useStyles();

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
            data={row.position.good.concat(row.position.bad)}
            title={`Score Breakdown for ${row.member.full_name}`}
          />
        );
      }}
      isLoading={loading || scoresLoading || votesLoading || joinedLoading}
      columns={[
        { field: "member.full_name", title: "Name" },
        {
          field: "position.score",
          render: (row: MemberAndPosition) => {
            const {
              position: {
                good: { length: good },
                bad: { length: bad }
              }
            } = row;

            return [
              good ? <span className={good ? goodVote : ""}>+{good}</span> : 0,
              <React.Fragment>&nbsp;/&nbsp;</React.Fragment>,
              bad ? <span className={bad ? badVote : ""}>-{bad}</span> : 0
            ];
          },
          title: "Score"
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
