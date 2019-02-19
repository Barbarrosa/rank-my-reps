import {
  getScoreCard,
  Score,
  ScoreCard,
  subscribeToScoreCard,
  updateScoreCard
} from "../fn/scorecard";
import getSubscribableState from "./SubscribableState";

const convertScorecard = (
  card: ScoreCard
): Array<{ vote: string } & Score> & { original?: ScoreCard } => {
  const converted: Array<{ vote: string } & Score> & {
    original?: ScoreCard;
  } = Object.entries(card).map(([vote, score]) => ({ vote, ...score }));
  converted.original = card;
  return converted;
};

async function* generateScoreRows(userId: string) {
  // Ensure scorecard exists
  await updateScoreCard(userId, await getScoreCard(userId));

  for await (const scorecard of subscribeToScoreCard(userId)) {
    yield convertScorecard(scorecard);
  }
}

export default function getScoreState(
  userId: string
): {
  scores: Array<{ vote: string } & Score> & { original?: ScoreCard };
  loading: boolean;
} {
  const { state, loading } = getSubscribableState(
    [userId],
    [] as ReturnType<typeof convertScorecard>,
    () => generateScoreRows(userId)
  );
  return {
    loading,
    scores: state
  };
}
