import {
  MemberTrustLevelIndex,
  updateMemberTrustLevels,
  getMemberTrustLevels,
  subscribeToMemberTrustLevels
} from "../fn/MemberTrustLevel";
import getSubscribableState from "./SubscribableState";

interface Result {
  loading: boolean;
  trustLevels: MemberTrustLevelIndex;
}
export default function getTrustLevelState(userId: string): Result {
  const { state, loading } = getSubscribableState(
    [userId],
    {} as MemberTrustLevelIndex,
    async function*(): AsyncIterableIterator<MemberTrustLevelIndex> {
      await updateMemberTrustLevels(userId, await getMemberTrustLevels(userId));

      for await (const levels of subscribeToMemberTrustLevels(userId)) {
        yield levels;
      }
    }
  );
  return {
    loading,
    trustLevels: state
  };
}
