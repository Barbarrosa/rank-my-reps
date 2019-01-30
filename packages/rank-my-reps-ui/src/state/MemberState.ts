import { useEffect, useState } from "react";
import { getMembers } from "../fn/cachedApi";
import { Chamber } from "../fn/Chamber";
import { CongressMember } from "../fn/CongressMember";

export default function getMemberState(chamber: Chamber, congress: number): { members: CongressMember[], loading: boolean } {
    const [members, setMembers] = useState([] as CongressMember[]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        (async () => {
            try {
                setMembers(await getMembers(chamber, congress))
            } finally {
                setLoading(false);
            }
        })();
    },[chamber,congress]);
    return {
        loading,
        members,
    };
}