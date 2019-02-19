import { isChamber, Chamber } from "./Chamber";

export default interface MemberCompare {
  first_member_id: string;
  first_member_api_uri: string;
  second_member_id: string;
  second_member_api_uri: string;
  congress: string;
  chamber: Chamber;
  common_votes: string;
  disagree_votes: string;
  agree_percent: string;
  disagree_percent: string;
}

export function isMemberCompare(data: any): data is MemberCompare {
  return (
    typeof data === "object" &&
    typeof data.disagree_percent === "string" &&
    typeof data.agree_percent === "string" &&
    typeof data.disagree_votes === "string" &&
    typeof data.common_votes === "string" &&
    isChamber(data.chamber) &&
    typeof data.congress === "string" &&
    typeof data.second_member_api_uri === "string" &&
    typeof data.second_member_id === "string" &&
    typeof data.first_member_api_uri === "string" &&
    typeof data.first_member_id === "string"
  );
}
