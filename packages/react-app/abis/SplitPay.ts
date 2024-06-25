const abi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "_tokenAddress",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "settlementId",
                type: "uint256",
            },
        ],
        name: "Settled",
        type: "event",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "title",
                type: "string",
            },
            {
                internalType: "uint256",
                name: "_totalAmount",
                type: "uint256",
            },
            {
                internalType: "address[]",
                name: "settlers",
                type: "address[]",
            },
        ],
        name: "createExpense",
        outputs: [
            {
                internalType: "uint256",
                name: "expenseId",
                type: "uint256",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_expenseId",
                type: "uint256",
            },
        ],
        name: "getExpense",
        outputs: [
            {
                components: [
                    {
                        internalType: "uint256",
                        name: "amount",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256[]",
                        name: "settlements",
                        type: "uint256[]",
                    },
                    {
                        internalType: "address",
                        name: "receiver",
                        type: "address",
                    },
                    {
                        internalType: "bool",
                        name: "isSettled",
                        type: "bool",
                    },
                    {
                        internalType: "string",
                        name: "title",
                        type: "string",
                    },
                ],
                internalType: "struct SplitPay.Expense",
                name: "",
                type: "tuple",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_settlementId",
                type: "uint256",
            },
        ],
        name: "getSettlement",
        outputs: [
            {
                components: [
                    {
                        internalType: "uint256",
                        name: "expenseId",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "amount",
                        type: "uint256",
                    },
                    {
                        internalType: "address",
                        name: "settler",
                        type: "address",
                    },
                    {
                        internalType: "bool",
                        name: "isSettled",
                        type: "bool",
                    },
                ],
                internalType: "struct SplitPay.Settlement",
                name: "",
                type: "tuple",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_user",
                type: "address",
            },
        ],
        name: "getUserStats",
        outputs: [
            {
                components: [
                    {
                        internalType: "int256",
                        name: "effectiveBalance",
                        type: "int256",
                    },
                    {
                        internalType: "uint256[]",
                        name: "expenses",
                        type: "uint256[]",
                    },
                    {
                        internalType: "uint256[]",
                        name: "settlements",
                        type: "uint256[]",
                    },
                ],
                internalType: "struct SplitPay.User",
                name: "",
                type: "tuple",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_settlementId",
                type: "uint256",
            },
        ],
        name: "settle",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
];

export default abi;
