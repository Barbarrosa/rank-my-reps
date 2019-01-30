import { useEffect, useState } from "react";
import { Bill, BillType } from "../fn/Bill";
import { getRecentBills } from "../fn/cachedApi";
import { Chamber } from "../fn/Chamber";

export default function getBillState(chamber: Chamber, congress: number): { bills: Bill[], loading: boolean } {
    const [bills,setBills] = useState([] as Bill[]);
    const [loading,setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                setBills(await getRecentBills(chamber, congress, BillType.passed));
            } finally {
                setLoading(false);
            }
        })();
    },[chamber, congress]);

    return {
        bills,
        loading,
    }
}