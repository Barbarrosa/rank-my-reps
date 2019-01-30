import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { merge } from 'lodash';
import { Bill, BillType, SpecificBill } from './Bill';
import { Chamber } from "./Chamber";
import { CongressApiBillResult, CongressApiMemberResult, CongressApiResponse, CongressApiRollCallVoteResult, isCongressApiBillResult, isCongressApiMemberResult, isCongressApiResponse, isCongressApiRollCallVoteResult, isCongressApiSpecificBillResult } from './CongressApiResponse';
import { CongressMember } from "./CongressMember";
import { isArrayOfType } from "./isArrayOfType";
import RollCallVote from './RollCallVote';

function getPropublicaKey():string {
    const apiKey: undefined|string = process.env.REACT_APP_PROPUBLICA_API_KEY;
    if(apiKey === undefined) {
        throw new Error('API key undefined.');
    }
    if(apiKey.length < 1) {
        throw new Error('API key empty.');
    }
    return apiKey;
}

function getAxiosInstance(overrides: AxiosRequestConfig = {}):AxiosInstance {
    const conf = merge({
        baseURL: 'https://api.propublica.org/congress/v1',
        headers: {
            'X-API-Key': getPropublicaKey(),
        },
    }, overrides);

    return axios.create(conf);
}

function getLastCongress() {
    return 116;
}

function validateCongress(congress: number): void {
    const lastCongress = getLastCongress();
    if(congress > lastCongress) {
        throw new Error(`Invalid congress specified; 1 to ${lastCongress} required.`);
    }
}

let instance:AxiosInstance;
function api():AxiosInstance {
    if(!instance) {
        instance = getAxiosInstance();
    }
    return instance;
}

async function get<T>(url:string, validFn: (data: any) => data is T, opts?:AxiosRequestConfig): Promise<CongressApiResponse<T>> {
    const result:AxiosResponse = await api().get<T>(url,opts);
    if(isCongressApiResponse(result.data, validFn)) {
        return result.data;
    } else {
        console.error('Bad Response', url, result.data);
        throw new Error('Invalid response format');
    }
};

/**
 * https://projects.propublica.org/api-docs/congress-api/bills/#get-recent-bills
 */
export async function getMembers(chamber: Chamber, congress: number):Promise<CongressMember[]> {
    validateCongress(congress);
    const validFn = (data:any): data is [CongressApiMemberResult] => (isArrayOfType(data,isCongressApiMemberResult) && data.length === 1);
    return (await get(`/${congress}/${chamber}/members.json`, validFn)).results[0].members;
}

/**
 * https://projects.propublica.org/api-docs/congress-api/members/#lists-of-members
 */
export async function getRecentBills(chamber: Chamber, congress: number, type: BillType):Promise<Bill[]> {
    validateCongress(congress);
    const validFn = (data:any): data is [CongressApiBillResult] => (isArrayOfType(data,isCongressApiBillResult) && data.length === 1);
    return (await get(`/${congress}/${chamber}/bills/${type}.json`, validFn)).results[0].bills;
}

/**
 * https://projects.propublica.org/api-docs/congress-api/votes/#get-a-specific-roll-call-vote
 */
export async function getRollCallVote(chamber: Chamber, congress: number, session: number, rollCall: number):Promise<RollCallVote> {
    validateCongress(congress);
    return (await get(`/${congress}/${chamber}/sessions/${session}/votes/${rollCall}.json`, isCongressApiRollCallVoteResult)).results.votes.vote;
}

/**
 * https://projects.propublica.org/api-docs/congress-api/bills/#get-a-specific-bill
 */
export async function getSpecificBill(congress: number, id: string):Promise<SpecificBill> {
    validateCongress(congress);
    return (await get(`/${congress}/bills/${id}.json`, isCongressApiSpecificBillResult)).results[0];
}