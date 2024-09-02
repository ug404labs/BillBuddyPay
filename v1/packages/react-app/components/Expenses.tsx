import { formatEther } from "viem";
import Expense from "./Expense";
import type { Expense as ExpenseType } from "@/pages";

type ExpensesProps = {
    expenses: ExpenseType[];
};

export default function Expenses({ expenses }: ExpensesProps) {
    if (!expenses.length)
        return (
            <div className="flex items-center justify-center w-full mt-2">
                No Expenses
            </div>
        );

    return expenses.map((expense: ExpenseType) => {
        let { id, title, isSettled, amount } = expense;
        return (
            <Expense
                key={id}
                className="first:border-t border-black"
                title={title}
                amount={formatEther(amount)}
                paid={isSettled}
            />
        );
    });
}
