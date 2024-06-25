import type { Settlement as SettlementType } from "@/pages";
import Settle from "./Settle";

type SettlementsProps = {
    settlements: SettlementType[] | null;
};
export default function Settlements({ settlements }: SettlementsProps) {
    if (!settlements) return null;

    return settlements.map((settlement) => {
        let { amount, expense, isSettled, id } = settlement;

        console.log("Amount", amount);
        if (expense) {
            let { title } = expense;
            return (
                <Settle
                    key={id}
                    title={title}
                    amount={amount}
                    settlementId={Number(id)}
                    paid={isSettled}
                />
            );
        }
    });
}
