type ExpenseProps = {
    className?: string;
    title?: string;
    amount?: string;
    paid?: boolean;
};

function Expense({
    className,
    title = "Sandwich",
    amount = "10",
    paid = false,
}: ExpenseProps) {
    return (
        <div
            className={`w-full px-4 py-4 border-b border-black flex justify-between ${className}`}
        >
            <div>
                <h3>{title}</h3>
                <div className="flex items-center gap-x-2">
                    {paid ? (
                        <span className="text-green-600">Settled</span>
                    ) : (
                        <span className="text-red-600">Pending</span>
                    )}
                </div>
            </div>
            <h3>{amount} cUSD</h3>
        </div>
    );
}

export default Expense;
