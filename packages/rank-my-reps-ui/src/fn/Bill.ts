import { isBoolean as isBooleanOriginal, isNumber as isNumberOriginal, isObject as isObjectOriginal, isString as isStringOriginal } from "lodash";
import { Chamber, isChamber as isChamberOriginal } from "./Chamber";
import { isArrayOfType } from "./isArrayOfType";

const isObject = (isObjectOriginal);
const isNumber = (isNumberOriginal);
const isString = (isStringOriginal);
const isBoolean = (isBooleanOriginal);
const isChamber = (isChamberOriginal);

export interface AbstractBill {
    bill_id: string,
    bill_slug: string,
    bill_type: string,
    number: string,
    bill_uri: string,
    title: string,
    short_title: string,
    sponsor_title: string,
    sponsor_id: string,
    sponsor_state: string,
    sponsor_party: string,
    sponsor_uri: string,
    gpo_pdf_uri?: string,
    congressdotgov_url: string,
    govtrack_url: string,
    introduced_date: string,
    active: boolean,
    last_vote?: string,
    house_passage?: string,
    senate_passage?: string,
    enacted?: string,
    vetoed?: string,
    cosponsors: number,
    cosponsors_by_party: {
        [party:string]: number,
    },
    committees: string,
    committee_codes: string[],
    subcommittee_codes: string[],
    primary_subject: string,
    summary: string,
    summary_short: string,
    latest_major_action_date: string,
    latest_major_action: string
}

export interface Bill extends AbstractBill {
    sponsor_name: string,
}

export interface BillAction {
    id: number;
    chamber?: Chamber;
    action_type: string;
    datetime: string;
    description: string;
}

export function isBillAction(data: any): data is BillAction {
    return isObject(data)
        && (isChamber(data.chamber) || !data.chamber)
        && isString(data.action_type)
        && isString(data.datetime)
        && isString(data.description);
}

export interface BillVote {
    chamber: string;
    date: string;
    time: string;
    roll_call: string;
    question: string;
    result: string;
    total_yes: number;
    total_no: number;
    total_not_voting: number;
    api_url: string;
}

export function isBillVote(data: any): data is BillVote {
    return isObject(data)
        && isChamber(data.chamber)
        && isString(data.date)
        && isString(data.time)
        && isString(data.roll_call)
        && isString(data.question)
        && isString(data.result)
        && isString(data.api_url)
        && isNumber(data.total_yes)
        && isNumber(data.total_no)
        && isNumber(data.total_not_voting);
}

export interface SpecificBill extends AbstractBill {
    actions: BillAction[];
    bill: string;
    congress: string;
    house_passage_vote?: string;
    senate_passage_vote?: string;
    sponsor: string;
    versions: [];
    votes: BillVote[];
    withdrawn_cosponsors: number;
}

export function isSpecificBill(data: any): data is SpecificBill {
    return isAbstractBill(data)
        && isString(data.bill)
        && isString(data.congress)
        && isString(data.sponsor)
        && isNumber(data.withdrawn_cosponsors)
        && (isString(data.house_passage_vote) || !data.house_passage_vote)
        && (isString(data.senate_passage_vote) || !data.senate_passage_vote)
        && isArrayOfType(data.actions, isBillAction)
        && isArrayOfType(data.votes, isBillVote)
        && Array.isArray(data.versions);
}

function isAbstractBill(data: any): data is AbstractBill & { [B:string]: unknown } {
    return isObject(data)
        && isString(data.bill_id)
        && isString(data.bill_slug)
        && isString(data.bill_type)
        && isString(data.number)
        && isString(data.bill_uri)
        && isString(data.title)
        && isString(data.short_title)
        && isString(data.sponsor_title)
        && isString(data.sponsor_id)
        && isString(data.sponsor_state)
        && isString(data.sponsor_party)
        && isString(data.sponsor_uri)
        && (isString(data.gpo_pdf_uri) || data.gpo_pdf_uri === null || data.gpo_pdf_uri === undefined)
        && isString(data.congressdotgov_url)
        && isString(data.govtrack_url)
        && isString(data.introduced_date)
        && isBoolean(data.active)
        && (isString(data.last_vote) || data.last_vote === null || data.last_vote === undefined)
        && (isString(data.house_passage) || data.house_passage === null || data.house_passage === undefined)
        && (isString(data.senate_passage) || data.senate_passage === null || data.senate_passage === undefined)
        && (isString(data.enacted) || data.enacted === null || data.enacted === undefined)
        && (isString(data.vetoed) || data.vetoed === null || data.vetoed === undefined)
        && isNumber(data.cosponsors)
        && (data.cosponsors_by_party === null || data.cosponsors_by_party === undefined
            || (isObject(data.cosponsors_by_party)
            && Object.entries(data.cosponsors_by_party).every(([,value]) => isNumber(value))
        ))
        && isString(data.committees)
        && Array.isArray(data.committee_codes) && data.committee_codes.every((v:any) => isString(v))
        && Array.isArray(data.subcommittee_codes) && data.subcommittee_codes.every((v:any) => isString(v))
        && isString(data.primary_subject)
        && isString(data.summary)
        && isString(data.summary_short)
        && isString(data.latest_major_action_date)
        && isString(data.latest_major_action);
}

export function isBill(data: any): data is Bill {
    return isAbstractBill(data)
        && isString(data.sponsor_name)
}

export enum BillType {
    introduced = 'introduced',
    updated = 'updated',
    active = 'active',
    passed = 'passed',
    enacted = 'enacted',
    vetoed = 'vetoed',
}