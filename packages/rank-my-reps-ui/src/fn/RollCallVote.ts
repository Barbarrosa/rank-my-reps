import { isNumber as isNumberOriginal, isObject as isObjectOriginal, isString as isStringOriginal } from "lodash";
import InstrumentTypeGuard from "../util/InstrumentTypeGuard";
import TypeGuardResult from "../util/TypeGuardResult";
import { Chamber, isChamber as isChamberOriginal } from "./Chamber";
import { isArrayOfType } from "./isArrayOfType";

export type VotePosition = "Yes" | "No" | "Not Voting" | "Speaker";
export function voteMatchesPosition(vote: VotePosition, position: boolean): boolean {
    switch(vote) {
        case "Yes": return position;
        case "No": return !position;
        default: return false;
    }
}
export function isVotePositionOriginal(data: any): data is VotePosition {
    return data === "Yes" || data === "No" || data === "Not Voting" || data === "Speaker";
}

const isVotePosition = (isVotePositionOriginal);
const isNumber = (isNumberOriginal);
const isString = (isStringOriginal);
const isObject = (isObjectOriginal);
const isChamber = (isChamberOriginal);

export interface VoteTotals {
    yes: number;
    no: number;
    present: number;
    not_voting: number;
}
export function isVoteTotals(
    data: any,
    addtl?: (data: VoteTotals & { [K:string]: any }) => data is VoteTotals
    ): data is TypeGuardResult<typeof addtl,VoteTotals>|VoteTotals {
    return isObject(data)
        && isNumber(data.yes)
        && isNumber(data.no)
        && isNumber(data.present)
        && isNumber(data.not_voting)
        && (addtl ? addtl(data) : true);
}
export interface PartyVoteTotals extends VoteTotals {
    majority_position: VotePosition;
}
export function isPartyVoteTotals(data: any): data is PartyVoteTotals {
    return isVoteTotals(data, (v): v is PartyVoteTotals => isVotePosition(v.majority_position));
}
export interface RollCallBillData {
    bill_id: string;
    number: string;
    api_uri: string;
    title: string;
    latest_action: string;
}
export function isRollCallBillData(data: any): data is RollCallBillData {
    return isObject(data)
        && isString(data.bill_id)
        && isString(data.number)
        && isString(data.api_uri)
        && isString(data.title)
        && isString(data.latest_action);
}
export interface RollCallPosition {
    member_id: string;
    name: string;
    party: string;
    state: string;

    vote_position: VotePosition;
    dw_nominate?: number;
}
export function isRollCallPosition(data: any): data is RollCallPosition {
    return isObject(data)
        && isString(data.member_id)
        && isString(data.name)
        && isString(data.party)
        && isString(data.state)
        && isVotePosition(data.vote_position)
        && (isNumber(data.dw_nominate) || !data.dw_nominate);
}
export default interface RollCallVote {
    congress: number;
    session: number;
    chamber: Chamber;
    roll_call: number;
    source: string;
    url: string;
    bill: RollCallBillData;
    question: string;
    description: string;
    vote_type: string;
    date: string;
    time: string;
    result: string;
    tie_breaker?: string;
    tie_breaker_vote?: string;
    document_number?: string;
    document_title?: string;
    democratic: PartyVoteTotals;
    republican: PartyVoteTotals;
    independent: VoteTotals;
    total: VoteTotals;
    positions: RollCallPosition[];
}
export function isRollCallVote(data: any): data is RollCallVote {
    return isObject(data)
        && isNumber(data.congress)
        && isNumber(data.session)
        && isChamber(data.chamber)
        && isNumber(data.roll_call)
        && isString(data.source)
        && isString(data.url)
        && isRollCallBillData(data.bill)
        && isString(data.question)
        && isString(data.description)
        && isString(data.vote_type)
        && isString(data.date)
        && isString(data.time)
        && isString(data.result)
        && (isString(data.tie_breaker) || !data.tie_breaker)
        && (isString(data.tie_breaker_vote) || !data.tie_breaker_vote)
        && (isString(data.document_number) || !data.document_number)
        && (isString(data.document_title) || !data.document_title)
        && isPartyVoteTotals(data.democratic)
        && isPartyVoteTotals(data.republican)
        && isVoteTotals(data.independent)
        && isVoteTotals(data.total)
        && isArrayOfType(data.positions, isRollCallPosition);
}