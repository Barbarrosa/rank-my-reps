import { Bill } from "./Bill";
import { Score } from "./scorecard";

export default interface ScoredBill {
  bill: Bill;
  score?: Score & { vote: string };
}
