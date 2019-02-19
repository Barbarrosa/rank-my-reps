import { isChamber, Chamber } from "./Chamber";

export default interface MemberCompare {
  first_member_id: string;
  first_member_api_uri: string;
  second_member_id: string;
  second_member_api_uri: string;
  congress: string;
  chamber: Chamber;
  common_votes: number;
  disagree_votes: number;
  agree_percent: number;
  disagree_percent: number;
}

export function isMemberCompare(data: any): data is MemberCompare {
  return (
    typeof data === "object" &&
    typeof data.disagree_percent === "number" &&
    typeof data.agree_percent === "number" &&
    typeof data.disagree_votes === "number" &&
    typeof data.common_votes === "number" &&
    isChamber(data.chamber) &&
    typeof data.congress === "string" &&
    typeof data.second_member_api_uri === "string" &&
    typeof data.second_member_id === "string" &&
    typeof data.first_member_api_uri === "string" &&
    typeof data.first_member_id === "string"
  );
}
