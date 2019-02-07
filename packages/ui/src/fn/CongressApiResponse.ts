import { isObject } from "lodash";
import { Bill, isBill, isSpecificBill, SpecificBill } from "./Bill";
import { Chamber, isChamber } from "./Chamber";
import { CongressMember, isCongressMember } from "./CongressMember";
import { isArrayOfType } from "./isArrayOfType";
import RollCallVote, { isRollCallVote } from "./RollCallVote";

export interface CongressApiResponse<T> {
  status: "OK";
  copyright: string;
  results: T;
}

export function isCongressApiResponse<T>(
  data: any,
  resultFn: (data: any) => data is T
): data is CongressApiResponse<T> {
  return (
    typeof data === "object" &&
    data.status === "OK" &&
    typeof data.copyright === "string" &&
    resultFn(data.results)
  );
}

export interface CongressApiResultWithList {
  num_results: number;
  offset: number;
}

export interface UnknownCongressApiResultWithList
  extends CongressApiResultWithList {
  congress?: number | string;
  chamber?: Chamber;
  bills?: Bill[];
  members?: CongressMember[];
}

export interface CongressApiMemberResult extends CongressApiResultWithList {
  congress: number | string;
  chamber: Chamber;
  members: CongressMember[];
}

export interface CongressApiBillResult extends CongressApiResultWithList {
  congress: number | string;
  chamber: Chamber;
  bills: Bill[];
}

export interface ResponseVoteContainer {
  votes: SingleRollCallVoteContainer;
}

export interface SingleRollCallVoteContainer {
  vote: RollCallVote;
}

export interface CongressApiRollCallVoteResult
  extends CongressApiResponse<ResponseVoteContainer> {
  votes: SingleRollCallVoteContainer;
}

function isCongressApiResultWithList<T extends CongressApiResultWithList>(
  data: any,
  extraValidation: (val: UnknownCongressApiResultWithList) => val is T
): data is T {
  return (
    typeof data === "object" &&
    typeof data.num_results === "number" &&
    typeof data.offset === "number" &&
    extraValidation(data)
  );
}

function validateCongress(val: any): val is { congress: string | number } {
  return (
    (typeof val.congress === "string" || typeof val.congress === "number") &&
    !isNaN(Number(val.congress))
  );
}

export function isCongressApiMemberResult(
  data: any
): data is CongressApiMemberResult {
  return isCongressApiResultWithList(
    data,
    (val: UnknownCongressApiResultWithList): val is CongressApiMemberResult => {
      return (
        validateCongress(val) &&
        isChamber(val.chamber) &&
        isArrayOfType(val.members, isCongressMember)
      );
    }
  );
}

export function isCongressApiBillResult(
  data: any
): data is CongressApiBillResult {
  return isCongressApiResultWithList(
    data,
    (val: UnknownCongressApiResultWithList): val is CongressApiBillResult => {
      return (
        validateCongress(val) &&
        isChamber(val.chamber) &&
        isArrayOfType(val.bills, isBill)
      );
    }
  );
}

export function isCongressApiRollCallVoteResult(
  data: any
): data is CongressApiRollCallVoteResult {
  return (
    isObject(data) && isObject(data.votes) && isRollCallVote(data.votes.vote)
  );
}

export function isCongressApiSpecificBillResult(
  data: any
): data is [SpecificBill] {
  return Array.isArray(data) && data.length === 1 && isSpecificBill(data[0]);
}
