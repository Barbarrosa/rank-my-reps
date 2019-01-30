import { isString } from 'util';
import { Bill } from './Bill';
import { hasKeyValueTypes } from "./hasKeyValueTypes";
import { cacheGet, cacheSet, cacheSubscribe } from "./localStorageCache";

export interface ScoreCard {
    [rollCallVote: string]: Score;
}

export interface Score {
    bill: Bill;
    priority: number;
    support: boolean;
}

function isScore(data: any): data is Score {
    return typeof data === "object"
        && typeof data.priority === "number"
        && typeof data.support === "boolean";
}

enum STORAGE_KEYS {
    ScoreCard = 'FactBasedVote_ScoreCard'
}

export const getScoreCard: (userId: string) => Promise<ScoreCard> = cacheGet(
    STORAGE_KEYS.ScoreCard,
    (data: any): data is ScoreCard => {
        return hasKeyValueTypes(data, isString, isScore);
    },
    async (userId: string): Promise<ScoreCard> => ({})
);

export const updateScoreCard:(userId: string, card: ScoreCard) => Promise<void> = cacheSet(
    STORAGE_KEYS.ScoreCard,
    (userId: string, card: ScoreCard) => [userId],
    (userId: string, card: ScoreCard) => card,
    async (userId: string, card: ScoreCard):Promise<void> => {},
    31536000 // 1 year
);

export async function updateScore(userId: string, billId: string, score?: Score): Promise<void> {
    const scoreCard:ScoreCard = await getScoreCard(userId);
    if(score) {
        scoreCard[billId] = score;
    } else {
        delete scoreCard[billId];
    }
    await updateScoreCard(userId, scoreCard);
}

export const subscribeToScoreCard: (userId: string) => AsyncIterableIterator<ScoreCard> = (userId: string) => cacheSubscribe(
    `${STORAGE_KEYS.ScoreCard}:${userId}`,
    (data: any): data is ScoreCard => {
        return hasKeyValueTypes(data, isString, isScore);
    }
);