import { CongressMember, isCongressMember } from "./CongressMember";
import { cacheGet, cacheSet, cacheSubscribe } from "./localStorageCache";
import { isArrayOfType } from "./isArrayOfType";
import { hasKeyValueTypes } from "./hasKeyValueTypes";
import { isString } from "util";

export interface MemberTrustLevelIndex {
  [memberId: string]: MemberTrustLevel;
}

export interface MemberTrustLevel {
  member: CongressMember;
  trustLevel: number;
}

function isMemberTrustLevel(data: any): data is MemberTrustLevel {
  return (
    typeof data === "object" &&
    typeof data.trustLevel === "number" &&
    isCongressMember(data.member)
  );
}

enum STORAGE_KEYS {
  MemberTrustLevels = "FactBasedVote_MemberTrustLevels"
}

export const getMemberTrustLevels: (
  userId: string
) => Promise<MemberTrustLevelIndex> = cacheGet(
  STORAGE_KEYS.MemberTrustLevels,
  (data: any): data is MemberTrustLevelIndex => {
    return hasKeyValueTypes(data, isString, isMemberTrustLevel);
  },
  async (userId: string): Promise<MemberTrustLevelIndex> => ({})
);

export const updateMemberTrustLevels: (
  userId: string,
  members: MemberTrustLevelIndex
) => Promise<void> = cacheSet(
  STORAGE_KEYS.MemberTrustLevels,
  (userId: string, members: MemberTrustLevelIndex) => [userId],
  (userId: string, members: MemberTrustLevelIndex) => members,
  async (userId: string, members: MemberTrustLevelIndex): Promise<void> => {},
  31536000 // 1 year
);

export const setMemberTrustLevel = async (
  userId: string,
  member: MemberTrustLevel
): Promise<void> => {
  const members = await getMemberTrustLevels(userId);
  const {
    member: { id }
  } = member;
  if (member.trustLevel) {
    members[id] = member;
  } else {
    delete members[id];
  }
  await updateMemberTrustLevels(userId, members);
};

export const subscribeToMemberTrustLevels: (
  userId: string
) => AsyncIterableIterator<MemberTrustLevelIndex> = (userId: string) =>
  cacheSubscribe(
    `${STORAGE_KEYS.MemberTrustLevels}:${userId}`,
    (data: any): data is MemberTrustLevelIndex => {
      return hasKeyValueTypes(data, isString, isMemberTrustLevel);
    }
  );
