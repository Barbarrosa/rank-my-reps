import * as api from "./api";
import { Bill, isBill, isSpecificBill } from "./Bill";
import { CongressMember, isCongressMember } from "./CongressMember";
import { isArrayOfType } from "./isArrayOfType";
import { cacheGet } from "./localStorageCache";
import { isRollCallVote } from "./RollCallVote";
import { isMemberCompare } from "./MemberCompare";

enum STORAGE_KEYS {
  getMembers = "FactBasedVote_getMembers",
  getRecentBills = "FactBasedVote_getRecentBills",
  getRollCallVote = "FactBasedVote_getRollCallVote",
  getSpecificBill = "FactBasedVote_getSpecificBill",
  getMemberComparison = "FactBasedVote_getMemberComparison"
}

export const getMembers = cacheGet(
  STORAGE_KEYS.getMembers,
  (v: any): v is CongressMember[] => isArrayOfType(v, isCongressMember),
  api.getMembers
);

export const getRecentBills = cacheGet(
  STORAGE_KEYS.getRecentBills,
  (v: any): v is Bill[] => isArrayOfType(v, isBill),
  api.getRecentBills
);

export const getRollCallVote = cacheGet(
  STORAGE_KEYS.getRollCallVote,
  isRollCallVote,
  api.getRollCallVote
);

export const getSpecificBill = cacheGet(
  STORAGE_KEYS.getSpecificBill,
  isSpecificBill,
  api.getSpecificBill
);

export const getMemberComparison = cacheGet(
  STORAGE_KEYS.getMemberComparison,
  isMemberCompare,
  api.getMemberComparison,
  9000 // 15 minutes
);
