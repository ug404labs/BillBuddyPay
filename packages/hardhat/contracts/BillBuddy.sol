// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address _from, address _to, uint256 _amount) external;
}

contract BillBuddy {
    address immutable STABLE_TOKEN_ADDRESS;
    uint256 expenseCounter;
    uint256 settlementCounter;

    Expense[] expenses;
    Settlement[] settlements;

    mapping(address => User) users;

    event Settled(uint256 settlementId);

    struct User {
        int256 effectiveBalance;
        uint256[] expenses;
        uint256[] settlements;
    }

    struct Expense {
        uint256 totalAmount;
        address[] receivers;
        uint256[] shares;
        uint256[] settlements;
        bool isSettled;
        string title;
    }

    struct Settlement {
        uint256 expenseId;
        uint256 amount;
        address settler;
        bool isSettled;
    }

    constructor(address _tokenAddress) {
        STABLE_TOKEN_ADDRESS = _tokenAddress;
    }

    function createExpense(
        string memory title,
        uint256 _totalAmount,
        address[] memory settlers,
        address[] memory receivers,
        uint256[] memory shares
    ) external returns (uint256 expenseId) {
        require(receivers.length == shares.length, "Receivers and shares length mismatch");
        uint256 noOfSettlements = settlers.length;
        uint256 individualSettlementAmount = _totalAmount / noOfSettlements;

        uint256[] memory _settlements = new uint256[](noOfSettlements);

        for (uint256 i = 0; i < noOfSettlements; i++) {
            Settlement memory settlement;

            User storage _user = users[settlers[i]];

            if (settlers[i] == msg.sender) {
                settlement = Settlement(
                    expenseCounter,
                    individualSettlementAmount,
                    settlers[i],
                    true
                );
            } else {
                settlement = Settlement(
                    expenseCounter,
                    individualSettlementAmount,
                    settlers[i],
                    false
                );
                users[settlers[i]].effectiveBalance += int256(
                    individualSettlementAmount
                );
            }

            settlements.push(settlement);

            _user.settlements.push(settlementCounter);

            _settlements[i] = settlementCounter;
            settlementCounter++;
        }

        Expense memory expense = Expense(
            _totalAmount,
            receivers,
            shares,
            _settlements,
            false,
            title
        );

        User storage user = users[msg.sender];

        expenseId = expenseCounter;
        user.expenses.push(expenseId);

        expenses.push(expense);
        expenseCounter++;

        users[msg.sender].effectiveBalance -= int256(
            _totalAmount - individualSettlementAmount
        );
    }

    function getExpense(
        uint256 _expenseId
    ) public view returns (Expense memory) {
        return expenses[_expenseId];
    }

    function getUserStats(address _user) public view returns (User memory) {
        return users[_user];
    }

    function getSettlement(
        uint256 _settlementId
    ) public view returns (Settlement memory) {
        return settlements[_settlementId];
    }

    function settle(uint256 _settlementId) external {
        Settlement memory settlement = settlements[_settlementId];
        Expense memory expense = expenses[settlement.expenseId];

        uint256 totalSettledAmount = 0;

        for (uint256 i = 0; i < expense.receivers.length; i++) {
            uint256 receiverAmount = (settlement.amount * expense.shares[i]) / 100;
            totalSettledAmount += receiverAmount;
            IERC20(STABLE_TOKEN_ADDRESS).transferFrom(
                msg.sender,
                expense.receivers[i],
                receiverAmount
            );
            users[expense.receivers[i]].effectiveBalance += int256(receiverAmount);
        }

        require(totalSettledAmount == settlement.amount, "Settlement amount mismatch");

        settlement.isSettled = true;

        settlements[_settlementId] = settlement;

        bool isExpenseSettled = true;

        for (uint256 i = 0; i < expense.settlements.length; i++) {
            if (!settlements[expense.settlements[i]].isSettled) {
                isExpenseSettled = false;
                break;
            }
        }

        expense.isSettled = isExpenseSettled;

        expenses[settlement.expenseId] = expense;

        users[settlement.settler].effectiveBalance -= int256(settlement.amount);

        emit Settled(_settlementId);
    }
}
