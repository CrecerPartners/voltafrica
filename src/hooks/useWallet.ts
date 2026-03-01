import { useMemo } from "react";
import { useTransactions } from "./useTransactions";

export function useWallet() {
  const { data: transactions, ...rest } = useTransactions();

  const summary = useMemo(() => {
    if (!transactions) return { availableBalance: 0, pendingEarnings: 0, totalEarned: 0, totalPaidOut: 0 };

    let totalEarned = 0;
    let totalPaidOut = 0;
    let pendingEarnings = 0;

    let processingPayouts = 0;

    for (const t of transactions) {
      if (t.type === "payout") {
        if (t.status === "processing") {
          processingPayouts += Math.abs(t.amount);
        }
        totalPaidOut += Math.abs(t.amount);
      } else if (t.status === "pending") {
        pendingEarnings += t.amount;
      } else if (t.status === "paid") {
        totalEarned += t.amount;
      }
    }

    return {
      availableBalance: totalEarned - totalPaidOut,
      pendingEarnings,
      totalEarned: totalEarned + pendingEarnings,
      totalPaidOut,
    };
  }, [transactions]);

  return { summary, transactions, ...rest };
}
