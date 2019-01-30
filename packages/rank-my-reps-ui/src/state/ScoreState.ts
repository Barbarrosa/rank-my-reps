import { useEffect, useState } from "react";
import { Score, ScoreCard, subscribeToScoreCard } from "../fn/scorecard";

const convertScorecard = (card: ScoreCard): Array<{vote: string} & Score> & { original?: ScoreCard } => {
    const converted: Array<{vote: string} & Score> & { original?: ScoreCard } = Object.entries(card)
        .map(([vote, score]) => ({vote, ...score}));
    converted.original = card;
    return converted;
};

export default function getScoreState(userId: string): { scores: Array<{vote:string} & Score> & { original?: ScoreCard }, loading: boolean } {
    const [scores,setScores] = useState([] as Array<{vote:string} & Score> & { original?: ScoreCard });
    const [loading,setLoading] = useState(true);
    useEffect(() => {
        let generator: AsyncIterableIterator<ScoreCard>;
        (async () => {
            generator = subscribeToScoreCard(userId);
            setLoading(true);
            setScores(convertScorecard((await generator.next()).value));
            setLoading(false);

            for await(const scorecard of generator) {
                setScores(convertScorecard(scorecard));
            }
        })();
        return () => {
            if(generator && generator.return) { generator.return(); }
        };
    },[userId]);
    return {
        loading,
        scores,
    };
}