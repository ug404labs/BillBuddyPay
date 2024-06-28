// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BillBuddyPay {
    IERC20 public usdcToken;

    struct Payment {
        uint256 id;
        string name;
        string description;
        address[] recipients;
        uint256[] shares;
        uint256 totalAmount;
        uint256 paidAmount;
    }

    struct Expense {
        uint256 id;
        string name;
        string description;
        address[] payers;
        uint256[] shares;
        uint256 totalAmount;
        uint256 paidAmount;
        address receiver;
    }

    mapping(uint256 => Payment) public payments;
    mapping(uint256 => Expense) public expenses;
    uint256 public paymentCount;
    uint256 public expenseCount;

    mapping(address => uint256[]) public userPayments;
    mapping(address => uint256[]) public userExpenses;

    event PaymentCreated(uint256 indexed id, string name);
    event ExpenseCreated(uint256 indexed id, string name);
    event PaymentContributed(uint256 indexed id, uint256 amount);
    event ExpenseContributed(uint256 indexed id, uint256 amount);
    event TransactionSettled(uint256 indexed id, bool isExpense);

    constructor(address _usdcTokenAddress) {
        usdcToken = IERC20(_usdcTokenAddress);
    }

    function createPayment(
        string memory _name,
        string memory _description,
        address[] memory _recipients,
        uint256[] memory _shares,
        uint256 _totalAmount
    ) public {
        require(_recipients.length == _shares.length, "Recipients and shares must have the same length");
        require(_totalAmount > 0, "Total amount must be greater than 0");

        paymentCount++;
        payments[paymentCount] = Payment(
            paymentCount, _name, _description, _recipients, _shares, _totalAmount, 0
        );

        for (uint256 i = 0; i < _recipients.length; i++) {
            userPayments[_recipients[i]].push(paymentCount);
        }

        emit PaymentCreated(paymentCount, _name);
    }

    function createExpense(
        string memory _name,
        string memory _description,
        address[] memory _payers,
        uint256[] memory _shares,
        uint256 _totalAmount,
        address _receiver
    ) public {
        require(_payers.length == _shares.length, "Payers and shares must have the same length");
        require(_totalAmount > 0, "Total amount must be greater than 0");

        expenseCount++;
        expenses[expenseCount] = Expense(
            expenseCount, _name, _description, _payers, _shares, _totalAmount, 0, _receiver
        );

        for (uint256 i = 0; i < _payers.length; i++) {
            userExpenses[_payers[i]].push(expenseCount);
        }

        emit ExpenseCreated(expenseCount, _name);
    }

    function contributeToPayment(uint256 _paymentId, uint256 _amount) public {
        Payment storage payment = payments[_paymentId];
        require(payment.id != 0, "Payment does not exist");
        require(payment.paidAmount < payment.totalAmount, "Payment is already settled");

        require(usdcToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        payment.paidAmount += _amount;

        emit PaymentContributed(_paymentId, _amount);

        if (payment.paidAmount >= payment.totalAmount) {
            settlePayment(_paymentId);
        }
    }

    function contributeToExpense(uint256 _expenseId, uint256 _amount) public {
        Expense storage expense = expenses[_expenseId];
        require(expense.id != 0, "Expense does not exist");
        require(expense.paidAmount < expense.totalAmount, "Expense is already settled");

        require(usdcToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        expense.paidAmount += _amount;

        emit ExpenseContributed(_expenseId, _amount);

        if (expense.paidAmount >= expense.totalAmount) {
            settleExpense(_expenseId);
        }
    }

    function settlePayment(uint256 _paymentId) private {
        Payment storage payment = payments[_paymentId];
        require(payment.paidAmount >= payment.totalAmount, "Payment is not fully paid");

        uint256 totalShares = getTotalShares(payment.shares);
        for (uint256 i = 0; i < payment.recipients.length; i++) {
            uint256 amount = (payment.totalAmount * payment.shares[i]) / totalShares;
            require(usdcToken.transfer(payment.recipients[i], amount), "Transfer to recipient failed");
        }

        emit TransactionSettled(_paymentId, false);
    }

    function settleExpense(uint256 _expenseId) private {
        Expense storage expense = expenses[_expenseId];
        require(expense.paidAmount >= expense.totalAmount, "Expense is not fully paid");

        require(usdcToken.transfer(expense.receiver, expense.totalAmount), "Transfer to receiver failed");

        emit TransactionSettled(_expenseId, true);
    }

    function getUserPayments(address _user) public view returns (uint256[] memory) {
        return userPayments[_user];
    }

    function getUserExpenses(address _user) public view returns (uint256[] memory) {
        return userExpenses[_user];
    }

    function getPaymentDetails(uint256 _paymentId) public view returns (Payment memory) {
        return payments[_paymentId];
    }

    function getExpenseDetails(uint256 _expenseId) public view returns (Expense memory) {
        return expenses[_expenseId];
    }

    function getTotalShares(uint256[] memory _shares) private pure returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < _shares.length; i++) {
            total += _shares[i];
        }
        return total;
    }
}